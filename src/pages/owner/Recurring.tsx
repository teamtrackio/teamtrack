import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { listRecurringTasks, createRecurringTask, toggleRecurringTask, deleteRecurringTask } from '@/services/recurring'
import { getEmployees } from '@/services/business'
import { ErrorBanner, EmptyState } from '@/components/StatusBits'
import FullScreenLoader from '@/components/FullScreenLoader'
import type { RecurrenceType, TaskPriority } from '@/types/database'

export default function OwnerRecurring() {
  const { business, user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [title, setTitle] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('daily')
  const [dueTime, setDueTime] = useState('18:00')
  const [priority, setPriority] = useState<TaskPriority>('normal')
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10))

  async function load() {
    if (!business) return
    setLoading(true)
    const [r, e] = await Promise.all([listRecurringTasks(business.id), getEmployees(business.id)])
    setItems(r ?? [])
    const active = (e ?? []).filter((x) => x.active)
    setEmployees(active)
    if (!assignedTo && active.length > 0) setAssignedTo(active[0].id)
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
      await createRecurringTask({
        businessId: business.id,
        title: title.trim(),
        assignedTo,
        createdBy: user.id,
        priority,
        recurrenceType,
        dueTime,
        startDate
      })
      setTitle('')
      setShowForm(false)
      await load()
    } catch {
      setError('Couldn\u2019t create the recurring task. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <FullScreenLoader />

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Recurring Tasks</h1>
        <button className="btn-primary text-sm py-2" onClick={() => setShowForm((s) => !s)}>
          + New Recurring Task
        </button>
      </div>

      {showForm && (
        <div className="card space-y-3">
          <ErrorBanner message={error} />
          <div>
            <label className="label">Title</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Check pending leads" />
          </div>
          <div>
            <label className="label">Assign to</label>
            <select className="input" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.full_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Repeat</label>
            <div className="flex gap-2">
              {(['daily', 'weekly', 'monthly'] as RecurrenceType[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRecurrenceType(r)}
                  className={`px-3 py-2 rounded-xl text-sm border capitalize ${recurrenceType === r ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600'}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Start date</label>
              <input className="input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
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
            {saving ? 'Creating…' : 'Create recurring task'}
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState title="No recurring tasks yet." cta="+ New Recurring Task" onClick={() => setShowForm(true)} />
      ) : (
        <div className="space-y-2">
          {items.map((r) => (
            <div key={r.id} className="card flex items-center justify-between">
              <div>
                <div className="font-medium">{r.title}</div>
                <div className="text-xs text-gray-400 capitalize">
                  {r.recurrence_type} · {r.due_time} · {r.business_members?.full_name ?? r.business_members?.[0]?.full_name}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="text-sm text-gray-500"
                  onClick={async () => {
                    await toggleRecurringTask(r.id, !r.active)
                    load()
                  }}
                >
                  {r.active ? 'Pause' : 'Resume'}
                </button>
                <button
                  className="text-sm text-danger"
                  onClick={async () => {
                    if (confirm('Delete this recurring task?')) {
                      await deleteRecurringTask(r.id)
                      load()
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
