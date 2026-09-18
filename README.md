# TeamTrack

**Delegate work without chasing your employees.**

TeamTrack is an employee task delegation and accountability app for small
Indian businesses (5–30 people). Owners assign tasks with a deadline;
employees start and complete them; overdue work surfaces automatically.

## CLAUDE CREATED THIS vs. YOU NEED TO DO THIS

Everything in this repository — every file — **was created for you**. Nothing
here needs you to write code.

What **you** still need to do, because only you have the accounts, is set up
three free services and connect them together:

1. Create a free Supabase project and run the provided SQL (`supabase/schema.sql`).
2. Create a free GitHub repository and push this code to it.
3. Add two secrets to that GitHub repository so it can talk to Supabase.

**Follow `BEGINNER_SETUP.md` for exact, click-by-click steps.** It assumes no
programming background.

## What's in this repository

| Path | What it is |
|---|---|
| `src/` | The application source code (React + TypeScript + Vite) |
| `supabase/schema.sql` | The complete database schema, indexes, and security rules — paste into Supabase's SQL Editor once |
| `supabase/seed_demo.sql` | Optional: fills the app with fake "Demo Realty" data so you can see it working before adding real employees |
| `supabase/functions/generate-recurring-tasks` | Optional: a scheduled job so recurring tasks are generated even if nobody opens the app that day (not required — the app generates them on load too) |
| `.github/workflows/deploy.yml` | Automatically builds and publishes the app to GitHub Pages every time you push to `main` |
| `.env.example` | Template for local development credentials — copy to `.env` and fill in |
| `BEGINNER_SETUP.md` | Step-by-step setup guide, written for non-developers |
| `USER_GUIDE.md` | How to use the app day-to-day, as an owner or an employee |
| `TROUBLESHOOTING.md` | Fixes for the most likely setup problems |

## Technology (all free tier)

- **Frontend:** React, Vite, TypeScript, Tailwind CSS, installable as a PWA
- **Backend:** Supabase (Postgres database, authentication, Row Level Security)
- **Hosting:** GitHub Pages
- **Cost:** ₹0 to run at the scale this is designed for (see "Free-tier design" below)

No OpenAI, no Claude API, no Twilio, no WhatsApp Business API, no paid
infrastructure of any kind is used or required.

## Free-tier design

This app is deliberately built to stay inside Supabase's free plan limits
(500 MB database, 5 GB egress/month, 50,000 monthly active users) under
normal use by a handful of small businesses:

- **No file/image storage.** Nothing is uploaded to Supabase Storage — the
  product is text and structured data only.
- **Narrow queries everywhere.** Dashboards fetch only today's tasks and
  overdue tasks — never a business's entire history — via server-side
  filtering, pagination (`supabase/schema.sql` indexes support this), and
  `.limit()` ceilings in `src/services/tasks.ts`.
  aggregate functions (`get_today_summary`, `get_employee_completion` in
  `schema.sql`) run inside Postgres, not by downloading rows into the browser.
- **Recurring tasks store only their rule**, not hundreds of future rows. A
  daily recurring task doesn't create 365 database rows — it creates one row
  today, generated the moment it's needed (see `generate_due_recurring_tasks`
  in `schema.sql`).
- **Activity logging is selective.** Only meaningful task events (created,
  started, completed) are logged — never clicks, page views, or keystrokes.
- **No realtime subscriptions.** Dashboards refresh on load rather than
  holding permanent realtime connections, which is simpler and avoids the
  200-connection / 2M-message realtime ceiling entirely for this MVP.

## Multi-tenancy and security

Every business's data is isolated from every other business's data using
Postgres **Row Level Security (RLS)** — this is enforced by the database
itself, not just hidden by the frontend. See the policies in
`supabase/schema.sql` and the isolation test procedure in
`TROUBLESHOOTING.md` / `USER_GUIDE.md`.

The frontend only ever receives Supabase's public "anon" key. No secret or
service-role key is ever placed in frontend code — the one place a
service-role key is used is inside the optional Edge Function
(`supabase/functions/generate-recurring-tasks`), where Supabase injects it
automatically into a server-side execution environment the browser never sees.

## Honesty about what "one pass" means here

This project was generated in a single work session as complete, readable,
internally-consistent source code, SQL, and documentation — not a skeleton
with TODOs. What it has **not** been through is: `npm install` against real
package registries, a live build, or execution against a live Supabase
project (this environment has no network access to those services). Treat
the first deploy as your test run, and use `TROUBLESHOOTING.md` if the build
or a Supabase call errors — the fixes there cover the most likely causes.
