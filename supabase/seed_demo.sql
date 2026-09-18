-- ============================================================================
-- OPTIONAL DEMO DATA
-- ============================================================================
-- Run this ONLY if you want to see the app populated with sample data.
-- It creates a business called "Demo Realty" owned by whichever auth user ID
-- you paste in below. It does NOT create auth users for you — you must
-- already have signed up at least one account in the app first.
--
-- HOW TO USE:
-- 1. Sign up as an owner in the app normally (e.g. demo-owner@example.com).
-- 2. In Supabase Dashboard -> Authentication -> Users, copy that user's UUID.
-- 3. Paste it into :owner_id below (replace the placeholder text).
-- 4. Run this file in the SQL Editor.
--
-- This never runs automatically and never touches real customer data — it
-- only inserts new rows under a new "Demo Realty" business.
-- ============================================================================

do $$
declare
  v_owner_id uuid := 'PASTE-YOUR-OWNER-AUTH-USER-UUID-HERE'; -- <-- replace this
  v_business_id uuid;
  v_rahul_id uuid;
  v_amit_id uuid;
  v_priya_id uuid;
begin
  insert into public.businesses (name, category, owner_id)
  values ('Demo Realty', 'Real Estate', v_owner_id)
  returning id into v_business_id;

  insert into public.business_members (business_id, role, full_name, active, invite_used)
  values (v_business_id, 'employee', 'Rahul', true, true) returning id into v_rahul_id;
  insert into public.business_members (business_id, role, full_name, active, invite_used)
  values (v_business_id, 'employee', 'Amit', true, true) returning id into v_amit_id;
  insert into public.business_members (business_id, role, full_name, active, invite_used)
  values (v_business_id, 'employee', 'Priya', true, true) returning id into v_priya_id;

  -- A mix of completed, pending, and overdue tasks so the dashboard looks real.
  insert into public.tasks (business_id, title, description, assigned_to, created_by, status, priority, due_at, started_at, completed_at)
  values
    (v_business_id, 'Call pending leads', '20 leads from last week', v_rahul_id, v_owner_id, 'completed', 'high', now() - interval '3 hours', now() - interval '4 hours', now() - interval '2 hours'),
    (v_business_id, 'Prepare site report', 'Photos not required', v_amit_id, v_owner_id, 'pending', 'high', now() - interval '45 minutes', null, null),
    (v_business_id, 'Follow up with customer', 'Ms. Sharma, 2BHK enquiry', v_priya_id, v_owner_id, 'in_progress', 'normal', now() + interval '3 hours', now() - interval '30 minutes', null),
    (v_business_id, 'Submit daily report', null, v_rahul_id, v_owner_id, 'pending', 'normal', now() + interval '5 hours', null, null);

  insert into public.recurring_tasks (business_id, title, description, assigned_to, created_by, priority, recurrence_type, due_time, start_date)
  values (v_business_id, 'Check pending leads', 'Daily lead follow-up', v_rahul_id, v_owner_id, 'normal', 'daily', '16:00', current_date);

  raise notice 'Demo Realty created with business_id = %', v_business_id;
end $$;
