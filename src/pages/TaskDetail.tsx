import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabaseClient'
import { startTask, completeTask, getTaskActivity, isOverdue, completedLate } from '@/services/tasks'
import { StatusBadge, PriorityDot, ErrorBanner } from '@/components/StatusBits'
import FullScreenLoader from '@/components/FullScreenLoader'

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>()
  const { business, membership, user } = useAuth()
  const navigate = useNavigate()
  const [task, setTask] = useState<any>(null)
  const [activity, setActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const isEmployeeView = membership?.role === 'employee'

  async function load() {
    if (!id) return
    setLoading(true)
    const { data } = await supabase
      .from('tasks')
      .select('*, business_members!tasks_assigned_to_fkey(full_name)')
      .eq('id', id)
      .maybeSingle()
    setTask(data)
    if (data) setActivity(await getTaskActivity(data.id))
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function handleStart() {
    if (!task || !business || !user) return
    setBusy(true)
    setError(null)
    try {
      await startTask(task.id, business.id, user.id)
      await load()
    } catch {
      setError('Couldn\u2019t update the task. Check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  async function handleComplete() {
    if (!task || !business || !user) return
    setBusy(true)
    setError(null)
    try {
      await completeTask(task.id, business.id, user.id, note.trim() || undefined)
      await load()
    } catch {
      setError('Couldn\u2019t save. Check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <FullScreenLoader />
  if (!task) {
    return (
      <div className="p-6 text-center text-gray-500">
        Task not found.{' '}
        <button className="text-brand-600 font-medium" onClick={() => navigate(-1)}>
          Go back
        </button>
      </div>
    )
  }

  const overdue = isOverdue(task)
  const late = completedLate(task)
  const assigneeName = task.business_members?.full_name ?? task.business_members?.[0]?.full_name

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <button className="text-sm text-gray-400" onClick={() => navigate(-1)}>
        ← Back
      </button>
      <ErrorBanner message={error} />

      <div className="card space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <PriorityDot priority={task.priority} />
            <h1 className="text-lg font-semibold">{task.title}</h1>
          </div>
          <StatusBadge status={task.status} overdue={overdue} />
        </div>
        {task.description && <p className="text-gray-600 text-sm">{task.description}</p>}
        <div className="text-sm text-gray-500 space-y-1">
          {!isEmployeeView && <p>Assigned to: {assigneeName}</p>}
          <p>Deadline: {new Date(task.due_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
          <p className="capitalize">Priority: {task.priority}</p>
          {task.status === 'completed' && late && <p className="text-warn font-medium">Completed late</p>}
        </div>
      </div>

      {isEmployeeView && task.status !== 'completed' && (
        <div className="card space-y-3">
          {task.status === 'pending' && (
            <button className="btn-primary w-full" disabled={busy} onClick={handleStart}>
              Start Task
            </button>
          )}
          {task.status === 'in_progress' && (
            <>
              <div>
                <label className="label">Completion note (optional)</label>
                <textarea className="input" rows={2} placeholder="e.g. 20 calls completed. 3 interested." value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
              <button className="btn-primary w-full" disabled={busy} onClick={handleComplete}>
                Mark Complete
              </button>
            </>
          )}
        </div>
      )}

      {task.status === 'completed' && (
        <div className="card text-center text-ok font-medium py-4">✓ Task completed</div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-gray-500 mb-2">ACTIVITY</h2>
        <div className="space-y-2">
          {activity.map((a) => (
            <div key={a.id} className="text-sm text-gray-600 card py-2">
              <div className="flex justify-between">
                <span className="capitalize">{a.action.replace('task_', '').replace('_', ' ')}</span>
                <span className="text-xs text-gray-400">{new Date(a.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
              </div>
              {a.note && <p className="mt-1 text-gray-800">{a.note}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
