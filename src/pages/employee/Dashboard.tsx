import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { getMyTasksToday, isOverdue } from '@/services/tasks'
import { generateDueRecurringTasks, updateTourCompleted } from '@/services/business'
import { PriorityDot, StatusBadge } from '@/components/StatusBits'
import FullScreenLoader from '@/components/FullScreenLoader'
import GuidedTour from '@/components/GuidedTour'

const EMPLOYEE_TOUR_STEPS = [
  { title: 'My Tasks', text: 'This is where you\u2019ll see everything assigned to you.' },
  { title: 'Start Task', text: 'Start a task when you begin working on it.' },
  { title: 'Complete', text: 'Mark it complete when you\u2019re finished.' },
  { title: 'History', text: 'Review your completed work.' }
]

export default function EmployeeDashboard() {
  const { business, membership, profile, user, refresh } = useAuth()
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState<any[]>([])
  const [showTour, setShowTour] = useState(false)

  useEffect(() => {
    if (!business || !membership) return
    ;(async () => {
      setLoading(true)
      await generateDueRecurringTasks(business.id).catch(() => null)
      const data = await getMyTasksToday(membership.id)
      setTasks(data ?? [])
      setLoading(false)
      if (profile && !profile.tour_employee_completed) setShowTour(true)
    })()
  }, [business, membership]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <FullScreenLoader />

  async function finishTour() {
    setShowTour(false)
    if (user) {
      await updateTourCompleted(user.id, 'tour_employee_completed')
      await refresh()
    }
  }

  const active = tasks.filter((t) => t.status !== 'completed' && !isOverdue(t))
  const overdue = tasks.filter((t) => t.status !== 'completed' && isOverdue(t))
  const completed = tasks.filter((t) => t.status === 'completed')

  return (
    <div className="max-w-lg mx-auto p-4 space-y-6">
      {showTour && <GuidedTour steps={EMPLOYEE_TOUR_STEPS} onFinish={finishTour} finalButtonLabel="You're ready to go" />}

      <div>
        <h1 className="text-xl font-bold">Good morning, {(membership?.full_name ?? profile?.full_name ?? '').split(' ')[0]} 👋</h1>
      </div>

      <section>
        <h2 className="text-sm font-semibold text-gray-500 mb-2">TODAY</h2>
        {active.length === 0 ? (
          <div className="card text-gray-500 text-sm">Nothing pending right now.</div>
        ) : (
          <div className="space-y-2">
            {active.map((t) => (
              <TaskRow key={t.id} task={t} />
            ))}
          </div>
        )}
      </section>

      {overdue.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-danger mb-2">OVERDUE</h2>
          <div className="space-y-2">
            {overdue.map((t) => (
              <TaskRow key={t.id} task={t} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-sm font-semibold text-gray-500 mb-2">COMPLETED TODAY</h2>
        {completed.length === 0 ? (
          <div className="card text-gray-500 text-sm">Nothing completed yet.</div>
        ) : (
          <div className="space-y-2">
            {completed.map((t) => (
              <TaskRow key={t.id} task={t} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function TaskRow({ task }: { task: any }) {
  return (
    <Link to={`/tasks/${task.id}`} className="card flex items-center gap-3 block">
      <PriorityDot priority={task.priority} />
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{task.title}</div>
        <div className="text-xs text-gray-400">Due {new Date(task.due_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
      </div>
      <StatusBadge status={task.status} overdue={isOverdue(task)} />
    </Link>
  )
}
