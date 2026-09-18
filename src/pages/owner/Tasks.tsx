import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { getTodayTasksForBusiness, createTask, isOverdue } from '@/services/tasks'
import { getEmployees } from '@/services/business'
import { PriorityDot, StatusBadge, ErrorBanner, EmptyState } from '@/components/StatusBits'
import FullScreenLoader from '@/components/FullScreenLoader'
import type { TaskPriority } from '@/types/database'

export default function OwnerTasks() {
  const { business, user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [dueTime, setDueTime] = useState('18:00')
  const [priority, setPriority] = useState<TaskPriority>('normal')
  const [saving, setSaving] = useState(false)

  async function load() {
    if (!business) return
    setLoading(true)
    const [t, e] = await Promise.all([getTodayTasksForBusiness(business.id), getEmployees(business.id)])
    setTasks(t ?? [])
    setEmployees((e ?? []).filter((x) => x.active))
    if (!assignedTo && e && e.length > 0) setAssignedTo(e[0].id)
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business])

  async function handleCreate() {
    if (!business || !user || !title.trim() || !assignedTo) return
    setSaving(true)
    setError(null)
    try {
      const dueAt = new Date(`${dueDate}T${dueTime}:00`).toISOString()
      await createTask({ businessId: business.id, title: title.trim(), description, assignedTo, createdBy: user.id, dueAt, priority })
      setTitle('')
      setDescription('')
      setShowForm(false)
      await load()
    } catch {
      setError('Couldn\u2019t create the task. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <FullScreenLoader />

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Tasks</h1>
        <button className="btn-primary text-sm py-2" onClick={() => setShowForm((s) => !s)}>
          + Create Task
        </button>
      </div>

      {showForm && (
        <div className="card space-y-3">
          <ErrorBanner message={error} />
          <div>
            <label className="label">Title</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Call pending leads" />
          </div>
          <div>
            <label className="label">Description (optional)</label>
            <textarea className="input" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <label className="label">Assign to</label>
            {employees.length === 0 ? (
              <p className="text-sm text-gray-500">
                No employees yet.{' '}
                <Link to="/employees" className="text-brand-600 font-medium">
                  Add one first
                </Link>
              </p>
            ) : (
              <select className="input" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.full_name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Due date</label>
              <input className="input" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div>
              <label className="label">Due time</label>
              <input className="input" type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Priority</label>
            <div className="flex gap-2">
              {(['low', 'normal', 'high'] as TaskPriority[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`px-3 py-2 rounded-xl text-sm border capitalize ${priority === p ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <button className="btn-primary w-full" disabled={saving || !title.trim() || !assignedTo} onClick={handleCreate}>
            {saving ? 'Creating…' : 'Create task'}
          </button>
        </div>
      )}

      {tasks.length === 0 ? (
        <EmptyState title="Create your first task." cta="+ Create Task" onClick={() => setShowForm(true)} />
      ) : (
        <div className="space-y-2">
          {tasks.map((t) => (
            <Link key={t.id} to={`/tasks/${t.id}`} className="card flex items-center gap-3 block">
              <PriorityDot priority={t.priority} />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{t.title}</div>
                <div className="text-xs text-gray-400">
                  {t.business_members?.full_name ?? t.business_members?.[0]?.full_name} · Due{' '}
                  {new Date(t.due_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <StatusBadge status={t.status} overdue={isOverdue(t)} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
