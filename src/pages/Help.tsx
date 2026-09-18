import { useNavigate } from 'react-router-dom'
import { APP_CONFIG } from '@/config'

const TOPICS = [
  {
    title: 'Getting started',
    body: `After signing up you'll go through a short setup: name your business, pick a category, add your first employee, and create your first task. You can skip any step and do it later.`
  },
  {
    title: 'Adding employees',
    body: `Go to Employees → Add Employee, enter their name, and you'll get an invite link. Send it to them (WhatsApp, SMS, anything works). It's valid for 7 days and can only be used once — after that they're a permanent member of your team.`
  },
  {
    title: 'Creating tasks',
    body: `Go to Tasks → Create Task. Fill in a title, who it's assigned to, and a deadline. Keep titles short — employees see them on a small screen.`
  },
  {
    title: 'Completing tasks',
    body: `Employees open a task, tap Start Task when they begin, then Mark Complete when done. They can add an optional note describing what they did.`
  },
  {
    title: 'Recurring tasks',
    body: `Go to Recurring → New Recurring Task to set up something that repeats daily, weekly, or monthly. ${APP_CONFIG.productName} generates the actual task automatically each day it's due — you don't need to recreate it.`
  },
  {
    title: 'Understanding overdue tasks',
    body: `A task becomes overdue automatically once its deadline passes and it isn't marked complete — nothing to do manually. If it's completed after the deadline, it's marked "Completed late" so you still see the full picture.`
  },
  {
    title: 'Reports',
    body: `Reports shows today's completion rate, each employee's numbers, and a searchable history of past tasks.`
  },
  {
    title: 'Account settings',
    body: `Update your business name and timezone from Settings. You can also restart the guided product tour from there at any time.`
  }
]

export default function Help() {
  const navigate = useNavigate()
  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <button className="text-sm text-gray-400" onClick={() => navigate(-1)}>
        ← Back
      </button>
      <h1 className="text-xl font-bold">Help Centre</h1>
      <div className="space-y-3">
        {TOPICS.map((t) => (
          <div key={t.title} className="card">
            <h2 className="font-semibold mb-1">{t.title}</h2>
            <p className="text-sm text-gray-600">{t.body}</p>
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-400 text-center pt-4">Still stuck? Email {APP_CONFIG.supportEmail}</p>
    </div>
  )
}
