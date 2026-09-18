# Beginner Setup Guide

This assumes you have never deployed a web app before. Follow the parts in
order. Each part takes a few minutes.

---

## PART A — Create your Supabase project

1. Go to https://supabase.com and click **Start your project**. Sign up (GitHub login is easiest) — this is free.
2. Click **New project**.
3. Choose an organization (Supabase creates a default one for you), give the project a name (e.g. `teamtrack`), and set a database password — **save this password somewhere**, you likely won't need it day-to-day but it's needed for direct database access later.
4. Choose the region closest to India (e.g. Mumbai / `ap-south-1`) for the fastest experience.
5. Click **Create new project** and wait 1–2 minutes while it provisions.

## PART B — Run the database SQL

1. In your new Supabase project, click **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Open `supabase/schema.sql` from this project on your computer, select all its text, and copy it.
4. Paste it into the SQL Editor and click **Run** (or press Ctrl/Cmd+Enter).
5. You should see "Success. No rows returned." If you see a red error instead, see `TROUBLESHOOTING.md`.
6. (Optional) If you want to see the app with sample data before adding real employees: sign up as an owner in the app first (Part I), then come back, open `supabase/seed_demo.sql`, follow the instructions written at the top of that file (you paste in your own user ID), and run it the same way.

## PART C — Configure Authentication

1. In Supabase, click **Authentication** in the left sidebar, then **Providers**.
2. Make sure **Email** is enabled (it is by default).
3. Click **Authentication → Settings** (sometimes labeled **URL Configuration**).
4. For now, leave **Confirm email** ON (default) — this is more secure. If you want to skip email confirmation during testing (so signup logs you in immediately), you can turn it off here and turn it back on later before real customers use it.
5. Under **Site URL** and **Redirect URLs**, you'll come back and add your GitHub Pages URL once you have it (Part G). For now, you can leave the default.

## PART D — Create a GitHub repository

1. Go to https://github.com and sign in (or create a free account).
2. Click the **+** icon top-right → **New repository**.
3. Name it (e.g. `teamtrack`). Keep it **Public** (required for GitHub Pages on free accounts) or **Private** if you have GitHub Pro. Do not initialize with a README (you already have one).
4. Click **Create repository**. Keep this page open — it shows you the commands for the next part.

## PART E — Upload the project

If you're comfortable with basic command-line steps, open a terminal in the folder where you unzipped this project and run:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
git push -u origin main
```

Replace `YOUR-USERNAME/YOUR-REPO-NAME` with your actual GitHub repository address (shown on the page from Part D).

If you'd rather not use the command line: on the GitHub repository page, click **uploading an existing file**, then drag the contents of the unzipped project folder in. GitHub's web uploader has a file-count limit, so the command-line method above is more reliable for a project this size.

## PART F — Configure GitHub secrets and variables

1. On your GitHub repository page, click **Settings** → **Secrets and variables** → **Actions**.
2. Under the **Secrets** tab, click **New repository secret** and add:
   - Name: `VITE_SUPABASE_URL` — Value: from Supabase, **Project Settings → API → Project URL**
   - Name: `VITE_SUPABASE_ANON_KEY` — Value: from Supabase, **Project Settings → API → anon public** key
3. Switch to the **Variables** tab, click **New repository variable**, and add:
   - Name: `VITE_BASE_PATH` — Value: `/YOUR-REPO-NAME/` (with leading and trailing slashes, matching your repository name from Part D exactly, including capitalization)

## PART G — Deploy

1. On your GitHub repository page, click **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Go to the **Actions** tab of your repository. If you already pushed code in Part E, a workflow run called "Deploy to GitHub Pages" should already be running or queued. If not, click **Deploy to GitHub Pages** in the left list, then **Run workflow**.
4. Wait for it to finish (a green checkmark, usually 1–3 minutes).
5. Go back to **Settings → Pages** — your live URL is shown at the top, looking like `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/`.

## PART H — Open the app

1. Visit the URL from Part G. You should see the TeamTrack landing page.
2. Go back to Supabase → **Authentication → URL Configuration**, and set **Site URL** to that same URL. Also add it under **Redirect URLs**. This makes password-reset emails link back to the right place.

## PART I — Create your owner account

1. On the live app, click **Start Free**.
2. Fill in your name, email, and a password, and submit.
3. If email confirmation is ON (Part C default), check your inbox, click the confirmation link, then come back and log in.
4. You'll land in the setup wizard — name your business, pick a category, and continue.

## PART J — Add employees

1. In the setup wizard (or later from **Employees → Add Employee**), enter an employee's name.
2. You'll get an invite link like `https://YOUR-URL/join/xxxxxxxx`. Send it to that employee however you like (WhatsApp, SMS).
3. It expires in 7 days and can be used once. Once they set a password through it, they're a permanent team member — you don't need to re-invite them.

## PART K — Test the system

Follow the 10-minute test procedure in `USER_GUIDE.md` ("Testing your setup").

## PART L — Install as a phone app

**iPhone (Safari):**
1. Open your app's URL in Safari.
2. Tap the Share icon (square with an arrow).
3. Tap **Add to Home Screen**, then **Add**.

**Android (Chrome):**
1. Open your app's URL in Chrome.
2. Tap the **⋮** menu (top right).
3. Tap **Add to Home screen** (or you may see an **Install app** banner automatically), then confirm.

Once installed, it opens full-screen like a normal app.

---

Stuck at any step? Check `TROUBLESHOOTING.md` first — it covers the most
common issue at each of the parts above.
