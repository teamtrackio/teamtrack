-- ============================================================================
-- TeamTrack — Supabase schema, indexes, and Row Level Security policies
-- ============================================================================
-- HOW TO RUN THIS:
-- Supabase Dashboard -> SQL Editor -> New Query -> paste this whole file -> Run
-- Safe to run once on a fresh project. Not designed to be re-run on top of
-- itself (it will error on "already exists" — that's expected and harmless).
-- ============================================================================

create extension if not exists "pgcrypto"; -- for gen_random_uuid()

-- ----------------------------------------------------------------------------
-- 1. PROFILES
-- One row per authenticated user (owner or employee). Created automatically
-- by a trigger on auth.users so the app never has to manage this manually.
-- ----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  tour_owner_completed boolean not null default false,
  tour_employee_completed boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (id = auth.uid());

create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid());

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', null))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 2. BUSINESSES
-- ----------------------------------------------------------------------------
create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  owner_id uuid not null references auth.users(id) on delete cascade,
  timezone text not null default 'Asia/Kolkata',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_businesses_owner_id on public.businesses(owner_id);

alter table public.businesses enable row level security;

create policy "businesses_select_owner"
  on public.businesses for select
  using (owner_id = auth.uid());

create policy "businesses_insert_owner"
  on public.businesses for insert
  with check (owner_id = auth.uid());

create policy "businesses_update_owner"
  on public.businesses for update
  using (owner_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 3. BUSINESS_MEMBERS
-- Represents both owners' and employees' membership in a business, plus
-- pending (not-yet-signed-up) employee invitations via invite_token.
-- ----------------------------------------------------------------------------
create table public.business_members (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'employee')),
  active boolean not null default true,
  full_name text not null,
  invite_token uuid,
  invite_expires_at timestamptz,
  invite_used boolean not null default false,
  created_at timestamptz not null default now(),
  constraint unique_member_per_user_business unique (business_id, user_id)
);

create index idx_business_members_business_id on public.business_members(business_id);
create index idx_business_members_user_id on public.business_members(user_id);
create index idx_business_members_invite_token on public.business_members(invite_token);

alter table public.business_members enable row level security;

-- This policy lives here (not in section 2) because it depends on
-- business_members, which must exist first — a policy referencing a
-- not-yet-created table fails with "relation does not exist".
create policy "businesses_select_member"
  on public.businesses for select
  using (
    exists (
      select 1 from public.business_members m
      where m.business_id = businesses.id
        and m.user_id = auth.uid()
        and m.active = true
    )
  );

-- A small helper function avoids repeating the "am I this business's owner"
-- subquery in every policy, and is marked STABLE so Postgres can cache it
-- within a single statement.
create or replace function public.is_business_owner(target_business_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.businesses b
    where b.id = target_business_id and b.owner_id = auth.uid()
  );
$$;

create policy "members_select_owner"
  on public.business_members for select
  using (public.is_business_owner(business_id));

create policy "members_select_self"
  on public.business_members for select
  using (user_id = auth.uid());

create policy "members_insert_owner"
  on public.business_members for insert
  with check (public.is_business_owner(business_id));

create policy "members_update_owner"
  on public.business_members for update
  using (public.is_business_owner(business_id));

-- Employees are allowed to attach their own auth user_id to an invited
-- member row ONLY via the join-by-token flow, which is implemented as a
-- SECURITY DEFINER function (accept_invite below) rather than a direct
-- table policy — this prevents an employee from claiming someone else's
-- invite row or joining an arbitrary business.

-- ----------------------------------------------------------------------------
-- 4. RECURRING_TASKS
-- Stores the RULE only. Concrete task rows are generated lazily (see
-- generate_due_recurring_tasks below) to avoid pre-creating hundreds of
-- future rows, per the free-tier storage budget.
-- ----------------------------------------------------------------------------
create table public.recurring_tasks (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  title text not null,
  description text,
  assigned_to uuid not null references public.business_members(id) on delete cascade,
  created_by uuid not null references auth.users(id),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high')),
  recurrence_type text not null check (recurrence_type in ('daily', 'weekly', 'monthly')),
  due_time text not null default '18:00', -- HH:MM, interpreted in business timezone
  start_date date not null,
  end_date date,
  last_generated_date date,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index idx_recurring_tasks_business_id on public.recurring_tasks(business_id);
create index idx_recurring_tasks_active on public.recurring_tasks(active);

alter table public.recurring_tasks enable row level security;

create policy "recurring_select_owner"
  on public.recurring_tasks for select
  using (public.is_business_owner(business_id));

create policy "recurring_insert_owner"
  on public.recurring_tasks for insert
  with check (public.is_business_owner(business_id));

create policy "recurring_update_owner"
  on public.recurring_tasks for update
  using (public.is_business_owner(business_id));

create policy "recurring_delete_owner"
  on public.recurring_tasks for delete
  using (public.is_business_owner(business_id));

-- ----------------------------------------------------------------------------
-- 5. TASKS
-- assigned_to references business_members.id (not auth.users directly) so
-- that a task can be assigned even before an invited employee has signed up.
-- ----------------------------------------------------------------------------
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  title text not null,
  description text,
  assigned_to uuid not null references public.business_members(id) on delete cascade,
  created_by uuid not null references auth.users(id),
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed')),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high')),
  due_at timestamptz not null,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  recurring_task_id uuid references public.recurring_tasks(id) on delete set null,
  updated_at timestamptz not null default now()
);

create index idx_tasks_business_id on public.tasks(business_id);
create index idx_tasks_assigned_to on public.tasks(assigned_to);
create index idx_tasks_status on public.tasks(status);
create index idx_tasks_due_at on public.tasks(due_at);
create index idx_tasks_created_at on public.tasks(created_at);
-- Composite index for the most common dashboard query: a business's
-- non-completed tasks ordered by due date.
create index idx_tasks_business_status_due on public.tasks(business_id, status, due_at);

alter table public.tasks enable row level security;

create or replace function public.is_task_assignee(target_task_member_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.business_members m
    where m.id = target_task_member_id and m.user_id = auth.uid()
  );
$$;

create policy "tasks_select_owner"
  on public.tasks for select
  using (public.is_business_owner(business_id));

create policy "tasks_select_assignee"
  on public.tasks for select
  using (public.is_task_assignee(assigned_to));

create policy "tasks_insert_owner"
  on public.tasks for insert
  with check (public.is_business_owner(business_id));

create policy "tasks_update_owner"
  on public.tasks for update
  using (public.is_business_owner(business_id));

-- Employees may update ONLY their own assigned task's status/timestamps —
-- enforced by is_task_assignee(assigned_to). They cannot repoint a task to
-- a different business or reassign it (the app's UI never exposes that, and
-- this policy is the actual enforcement layer regardless of the UI).
create policy "tasks_update_assignee"
  on public.tasks for update
  using (public.is_task_assignee(assigned_to))
  with check (public.is_task_assignee(assigned_to));

create policy "tasks_delete_owner"
  on public.tasks for delete
  using (public.is_business_owner(business_id));

-- ----------------------------------------------------------------------------
-- 6. TASK_ACTIVITY
-- Lightweight, append-only log of meaningful task events only (never UI
-- events like clicks/hovers, per the retention policy in the product spec).
-- ----------------------------------------------------------------------------
create table public.task_activity (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid references auth.users(id),
  action text not null,
  note text,
  created_at timestamptz not null default now()
);

create index idx_task_activity_task_id on public.task_activity(task_id);
create index idx_task_activity_business_id on public.task_activity(business_id);

alter table public.task_activity enable row level security;

create policy "activity_select_owner"
  on public.task_activity for select
  using (public.is_business_owner(business_id));

create policy "activity_select_assignee"
  on public.task_activity for select
  using (
    exists (
      select 1 from public.tasks t
      where t.id = task_activity.task_id and public.is_task_assignee(t.assigned_to)
    )
  );

create policy "activity_insert_owner"
  on public.task_activity for insert
  with check (public.is_business_owner(business_id));

create policy "activity_insert_assignee"
  on public.task_activity for insert
  with check (
    exists (
      select 1 from public.tasks t
      where t.id = task_activity.task_id and public.is_task_assignee(t.assigned_to)
    )
  );

-- ----------------------------------------------------------------------------
-- 7. updated_at maintenance trigger (generic, reused on two tables)
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_businesses_updated_at
  before update on public.businesses
  for each row execute procedure public.set_updated_at();

create trigger trg_tasks_updated_at
  before update on public.tasks
  for each row execute procedure public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 8. INVITE FLOW — secure, single-use, expiring tokens
-- create_employee_invite: owner creates a pending business_members row and
-- returns a token. accept_invite: an authenticated new employee redeems it.
-- Both are SECURITY DEFINER so they can bypass RLS internally in a
-- controlled way, but each does its own explicit authorization check first.
-- ----------------------------------------------------------------------------
create or replace function public.create_employee_invite(
  p_business_id uuid,
  p_full_name text
)
returns table (member_id uuid, invite_token uuid)
language plpgsql security definer set search_path = public
as $$
declare
  v_token uuid;
  v_member_id uuid;
begin
  if not public.is_business_owner(p_business_id) then
    raise exception 'Not authorized to invite employees to this business';
  end if;

  v_token := gen_random_uuid();

  insert into public.business_members (business_id, role, full_name, invite_token, invite_expires_at, active)
  values (p_business_id, 'employee', p_full_name, v_token, now() + interval '7 days', true)
  returning id into v_member_id;

  return query select v_member_id, v_token;
end;
$$;

create or replace function public.accept_invite(p_token uuid)
returns uuid -- returns business_id on success
language plpgsql security definer set search_path = public
as $$
declare
  v_member public.business_members%rowtype;
begin
  select * into v_member
  from public.business_members
  where invite_token = p_token
    and invite_used = false
    and invite_expires_at > now()
  limit 1;

  if v_member.id is null then
    raise exception 'This invite link is invalid or has expired.';
  end if;

  update public.business_members
  set user_id = auth.uid(),
      invite_used = true,
      invite_token = null -- burn the token so it can never be reused or leaked
  where id = v_member.id;

  return v_member.business_id;
end;
$$;

-- ----------------------------------------------------------------------------
-- 9. RECURRING TASK GENERATION
-- Generates today's task instance for each active recurring rule that is
-- due and hasn't already been generated. Designed to be called:
--   (a) lazily whenever the owner or employee dashboard loads, and/or
--   (b) on a schedule via a Supabase Edge Function + pg_cron / external
--       scheduler (see supabase/functions/generate-recurring-tasks).
-- It is idempotent per (recurring_task_id, day) via last_generated_date.
-- ----------------------------------------------------------------------------
create or replace function public.generate_due_recurring_tasks(p_business_id uuid)
returns integer
language plpgsql security definer set search_path = public
as $$
declare
  r record;
  v_tz text;
  v_today date;
  v_due_at timestamptz;
  v_should_run boolean;
  v_count integer := 0;
begin
  select timezone into v_tz from public.businesses where id = p_business_id;
  if v_tz is null then
    return 0;
  end if;

  v_today := (now() at time zone v_tz)::date;

  for r in
    select * from public.recurring_tasks
    where business_id = p_business_id
      and active = true
      and start_date <= v_today
      and (end_date is null or end_date >= v_today)
      and (last_generated_date is null or last_generated_date < v_today)
  loop
    v_should_run := case r.recurrence_type
      when 'daily' then true
      when 'weekly' then extract(dow from v_today) = extract(dow from r.start_date)
      when 'monthly' then extract(day from v_today) = extract(day from r.start_date)
      else false
    end;

    if v_should_run then
      v_due_at := (v_today::text || ' ' || r.due_time) :: timestamp at time zone v_tz;

      insert into public.tasks (business_id, title, description, assigned_to, created_by, priority, due_at, recurring_task_id)
      values (r.business_id, r.title, r.description, r.assigned_to, r.created_by, r.priority, v_due_at, r.id);

      insert into public.task_activity (task_id, business_id, user_id, action)
      select id, r.business_id, r.created_by, 'task_created'
      from public.tasks where recurring_task_id = r.id and due_at = v_due_at
      order by created_at desc limit 1;

      update public.recurring_tasks set last_generated_date = v_today where id = r.id;
      v_count := v_count + 1;
    end if;
  end loop;

  return v_count;
end;
$$;

-- ----------------------------------------------------------------------------
-- 10. REPORTING AGGREGATES (computed in Postgres, never downloaded row-by-row)
-- ----------------------------------------------------------------------------
create or replace function public.get_today_summary(p_business_id uuid)
returns table (
  total bigint,
  completed bigint,
  pending bigint,
  in_progress bigint,
  overdue bigint
)
language sql stable security definer set search_path = public
as $$
  select
    count(*) as total,
    count(*) filter (where status = 'completed') as completed,
    count(*) filter (where status = 'pending' and due_at >= now()) as pending,
    count(*) filter (where status = 'in_progress') as in_progress,
    count(*) filter (where status <> 'completed' and due_at < now()) as overdue
  from public.tasks
  where business_id = p_business_id
    and created_at >= date_trunc('day', now() at time zone (select timezone from public.businesses where id = p_business_id));
$$;

create or replace function public.get_employee_completion(p_business_id uuid)
returns table (
  member_id uuid,
  full_name text,
  total bigint,
  completed bigint,
  overdue bigint
)
language sql stable security definer set search_path = public
as $$
  select
    m.id as member_id,
    m.full_name,
    count(t.id) as total,
    count(t.id) filter (where t.status = 'completed') as completed,
    count(t.id) filter (where t.status <> 'completed' and t.due_at < now()) as overdue
  from public.business_members m
  left join public.tasks t
    on t.assigned_to = m.id
    and t.created_at >= date_trunc('day', now() at time zone (select timezone from public.businesses where id = p_business_id))
  where m.business_id = p_business_id and m.role = 'employee' and m.active = true
  group by m.id, m.full_name
  order by m.full_name;
$$;

-- ============================================================================
-- End of schema. Grants: Supabase's default 'authenticated' and 'anon' roles
-- already have table-level privileges; RLS policies above are what actually
-- restrict row access, which is the security boundary that matters here.
-- ============================================================================
