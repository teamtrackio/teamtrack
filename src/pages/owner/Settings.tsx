import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabaseClient'
import { ErrorBanner, SuccessBanner } from '@/components/StatusBits'

export default function OwnerSettings() {
  const { business, profile, user, signOut, refresh } = useAuth()
  const [name, setName] = useState(business?.name ?? '')
  const [timezone, setTimezone] = useState(business?.timezone ?? 'Asia/Kolkata')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [usage, setUsage] = useState<{ employees: number; tasksThisMonth: number } | null>(null)

  useEffect(() => {
    if (!business) return
    setName(business.name)
    setTimezone(business.timezone)
    ;(async () => {
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)
      const [{ count: empCount }, { count: taskCount }] = await Promise.all([
        supabase.from('business_members').select('id', { count: 'exact', head: true }).eq('business_id', business.id).eq('role', 'employee'),
        supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('business_id', business.id).gte('created_at', startOfMonth.toISOString())
      ])
      setUsage({ employees: empCount ?? 0, tasksThisMonth: taskCount ?? 0 })
    })()
  }, [business])

  async function handleSave() {
    if (!business) return
    setSaving(true)
    setError(null)
    setSuccess(null)
    const { error } = await supabase.from('businesses').update({ name, timezone }).eq('id', business.id)
    setSaving(false)
    if (error) {
      setError('Couldn\u2019t save changes. Please try again.')
      return
    }
    setSuccess('Saved.')
    await refresh()
  }

  async function restartTour() {
    if (!user) return
    await supabase.from('profiles').update({ tour_owner_completed: false }).eq('id', user.id)
    await refresh()
    setSuccess('Tour will show again next time you open the dashboard.')
  }

  return (
    <div className="max-w-xl mx-auto p-4 space-y-6">
      <h1 className="text-xl font-bold">Settings</h1>

      <section className="card space-y-3">
        <h2 className="font-semibold">Business</h2>
        <ErrorBanner message={error} />
        <SuccessBanner message={success} />
        <div>
          <label className="label">Business name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="label">Timezone</label>
          <input className="input" value={timezone} onChange={(e) => setTimezone(e.target.value)} />
          <p className="text-xs text-gray-400 mt-1">Task deadlines and overdue calculations use this timezone.</p>
        </div>
        <button className="btn-primary" disabled={saving} onClick={handleSave}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </section>

      <section className="card space-y-2">
        <h2 className="font-semibold">Owner profile</h2>
        <p className="text-sm text-gray-500">{profile?.full_name}</p>
        <p className="text-sm text-gray-500">{profile?.email}</p>
      </section>

      {usage && (
        <section className="card space-y-1">
          <h2 className="font-semibold mb-1">Usage</h2>
          <p className="text-sm text-gray-500">Employees: {usage.employees}</p>
          <p className="text-sm text-gray-500">Tasks this month: {usage.tasksThisMonth}</p>
        </section>
      )}

      <section className="card">
        <button className="text-brand-600 font-medium text-sm" onClick={restartTour}>
          Restart product tour
        </button>
      </section>

      <section className="card">
        <Link to="/help" className="text-brand-600 font-medium text-sm">
          Help Centre
        </Link>
      </section>

      <button className="btn-secondary w-full" onClick={signOut}>
        Log out
      </button>
    </div>
  )
}
