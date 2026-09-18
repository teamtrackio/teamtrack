# Troubleshooting

### "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY" / blank app / errors in browser console
Your GitHub repository secrets aren't set, or a value has a typo.
- Go to **Settings → Secrets and variables → Actions → Secrets** and confirm `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` exist.
- Get the correct values from Supabase: **Project Settings → API**. The URL looks like `https://xxxxxxxxxxxx.supabase.co` (no trailing slash). The anon key is a long string starting with `eyJ...`.
- After fixing a secret, re-run the deploy: **Actions tab → Deploy to GitHub Pages → Run workflow**. Secrets are baked in at build time, so simply saving a new secret does not update an already-deployed site.

### Supabase URL or public key wrong (login just spins or fails silently)
Double-check you copied the **anon public** key, not the `service_role` key. The service_role key must never be used in this project's frontend — if you're not sure which is which, the anon key is the shorter-looking one labeled "public" in the Supabase dashboard, and Supabase visually separates them with a warning next to service_role.

### Login failure ("Couldn't log in")
- Confirm the email/password are correct.
- If you just signed up and email confirmation is ON, you must click the confirmation link before logging in.
- Check **Supabase → Authentication → Users** to confirm the account exists and its status.

### "row-level security policy" error when creating a business/task/employee
This means an insert was attempted that doesn't match the RLS rules in `schema.sql` — usually because:
- You're not logged in (check the browser's Application/Storage tab for a Supabase session), or
- You ran only part of `schema.sql`. Re-run the whole file from the top in a fresh SQL Editor query — some `create policy` statements depend on tables/functions defined earlier in the same file.

### "relation ... does not exist" / database table missing
`schema.sql` wasn't fully run, or was run against the wrong project. Open **Supabase → Table Editor** and confirm you see `profiles`, `businesses`, `business_members`, `tasks`, `task_activity`, `recurring_tasks`. If any are missing, re-run `schema.sql` (Part B).

### GitHub Actions build fails (red X on the workflow)
Click into the failed run and open the **Build** step's log — it will name the actual error. Common causes:
- A secret name is misspelled (must exactly match `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`, case-sensitive).
- You edited a `.ts`/`.tsx` file and introduced a TypeScript error — the log will show the file and line.

### GitHub Pages shows a blank white page after deploying
Almost always the `VITE_BASE_PATH` repository variable is wrong or missing.
- It must be `/YOUR-REPO-NAME/` (leading and trailing slash) if your site is at `https://username.github.io/repo-name/`.
- It must be `/` if your site is at `https://username.github.io/` directly (a user/organization page) or a custom domain.
- After fixing it, re-run the deploy workflow — this is a **build-time** setting.

### Refreshing a page (e.g. `/dashboard`) gives a GitHub 404
This project already includes the fix for this (`public/404.html` + the decoder script in `index.html`) — this is expected to work out of the box. If it still 404s:
- Confirm `public/404.html`'s `segmentsToKeep` value matches your `VITE_BASE_PATH`: `1` if you're using a repo subpath (the default, most common case), `0` if your site is at the domain root.
- Confirm the build actually included `404.html` in the deployed output (check **Actions → (latest run) → Upload build artifact** log, or browse to `https://your-url/404.html` directly and see if it loads).

### Employee invitation problem ("This invite link is invalid or has expired")
Invite links expire after 7 days and can only be used once. Generate a new one from **Employees → Add Employee** using the same name (or a similar one) — it's fine to have used the name before.

### PWA not installing / no "Add to Home Screen" prompt
- iPhone Safari never shows an automatic prompt — you must use Share → Add to Home Screen manually (see `BEGINNER_SETUP.md` Part L).
- Android Chrome usually prompts automatically after a couple of visits, but you can always trigger it manually via the ⋮ menu.
- The site must be served over HTTPS — GitHub Pages does this automatically, so this is only an issue if you're testing on `localhost` without HTTPS in some browsers (Chrome allows `localhost` as an exception).

### Environment variables missing during local development
Copy `.env.example` to `.env` in the project root and fill in your real Supabase URL and anon key, then restart `npm run dev`. `.env` is intentionally excluded from git via `.gitignore` — for the deployed site, GitHub Actions secrets serve this purpose instead (Part F).

### Recurring tasks not appearing
Recurring tasks are generated the moment an owner or employee dashboard loads for that business (there's no need for anything to run in the background for this to work). If one seems missing:
- Confirm today's date actually matches the recurrence rule (e.g. a "weekly" task only generates on the same weekday as its `start_date`; a "monthly" task only on the same day-of-month).
- Confirm the recurring task is not **Paused** (Recurring page → Pause/Resume toggle).
- Confirm the business's timezone (Settings) is correct — due times are calculated in that timezone, not your browser's.
