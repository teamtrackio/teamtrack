# User Guide

## For Owners

### Set up your business
After signing up, a short wizard walks you through: business name, category,
your first employee, and your first task. You can skip the employee/task
steps and do them later from the main app.

### Add an employee
**Employees → Add Employee** → enter their name → you get a one-time invite
link (valid 7 days). Send it to them any way you like. Once they set a
password through it, they're on your team permanently — no need to re-invite.

### Create a task
**Tasks → Create Task** → title, who it's for, a deadline, and a priority
(Low / Normal / High). It appears on that employee's dashboard immediately.

### Create a recurring task
**Recurring → New Recurring Task** → set it to repeat Daily, Weekly, or
Monthly, with a due time and a start date. TeamTrack generates the actual
task automatically each day/week/month it's due — you set it up once.

### See overdue work
A task turns "Overdue" automatically the moment its deadline passes, if it
isn't marked complete — nothing to do manually. If it's completed after the
deadline, you'll see "Completed late" on it so you still have the full picture.

### View reports
**Reports** shows today's completion percentage, per-employee numbers, and a
paginated history of past tasks you can browse.

### View employee performance
**Employees** shows each person's completed/total count for today and any
overdue count. Tap into an employee to see their detail (via the Employees
list and Reports).

### Restart the tour
**Settings → Restart product tour.**

### Use Help
**Settings → Help Centre**, or the **Help** link wherever it appears — static
answers to the topics above, no need to leave the app.

---

## For Employees

### Log in
Use the email and password you set when you followed your invite link.

### See your tasks
Your home screen ("Today") shows: tasks due today, anything overdue, and
what you've already completed today.

### Start a task
Open it, tap **Start Task**. This records when you began, in case it's
useful later.

### Complete a task
Once you're done, tap **Mark Complete**. You can add a short note describing
what you did (e.g. "20 calls completed. 3 interested.") — this is optional
but helps your manager without needing a separate message.

### See your history
The **History** tab shows everything you've been assigned, oldest actions
last, with pagination if you have a lot of history.

---

## Testing your setup (10 minutes)

Do this once after deploying, before adding real employees:

1. **Sign up** as an owner. Confirm email if required. Log in.
2. **Complete setup wizard**: name a test business, add a test employee named e.g. "Test Employee", create a test task due in 2 minutes.
3. **Open the invite link** for "Test Employee" in a different browser (or an incognito window) and finish joining with a different email.
4. As the **employee**, confirm you see the test task. Wait 2+ minutes so it goes overdue, then refresh — confirm it now shows **Overdue** on both the employee and owner dashboards.
5. As the **employee**, tap **Start Task**, then **Mark Complete** with a note.
6. Switch back to the **owner** view — confirm the dashboard now shows it completed (and "Completed late", since it went overdue first), and the note appears on the task's activity log.
7. Create a **recurring task** (daily) due a few minutes from now, refresh the employee dashboard, and confirm it appears as a normal task for today.
8. Try the **multi-tenant isolation test** below.
9. Log out, and confirm you're returned to the login screen and can't see any data without logging in again.
10. On your phone, open the app URL and add it to your home screen (see `BEGINNER_SETUP.md` Part L).

## Multi-tenant isolation test (mandatory before real use)

1. Sign up a **second** owner account (Business B) with a different email.
2. Set up Business B with its own employee and task.
3. Confirm that logging in as Business B's owner shows **only** Business B's employees and tasks — never Business A's.
4. Confirm Business A's employee cannot see Business B's tasks, and vice versa, even by guessing a task URL (`/tasks/:id`) — this is enforced by the database's Row Level Security regardless of what the app's UI shows, so even a manually-typed URL for another business's task will fail to load data.
