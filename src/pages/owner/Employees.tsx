import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getEmployees, createInvite, getEmployeeCompletion } from '@/services/business'
import { ErrorBanner, EmptyState } from '@/components/StatusBits'
import FullScreenLoader from '@/components/FullScreenLoader'
import InviteShareBox from '@/components/InviteShareBox'
import { getInviteLink } from '@/utils/url'

export default function OwnerEmployees() {
  const { business } = useAuth()
  const [loading, setLoading] = useState(true)
  const [employees, setEmployees] = useState<any[]>([])
  const [stats, setStats] = useState<Record<string, { total: number; completed: number; overdue: number }>>({})
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [invitedName, setInvitedName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    if (!business) return
    setLoading(true)
    const [emp, completion] = await Promise.all([getEmployees(business.id), getEmployeeCompletion(business.id)])
    setEmployees(emp ?? [])
    const map: Record<string, any> = {}
    for (const c of completion) map[c.member_id] = c
    setStats(map)
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business])

  async function handleInvite() {
    if (!business || !name.trim()) return
    setSaving(true)
    setError(null)
    try {
      const invite = await createInvite(business.id, name.trim())
      setInviteLink(getInviteLink(invite.invite_token))
      setInvitedName(name.trim())
      setName('')
      await load()
    } catch {
      setError('Couldn\u2019t create the invite. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <FullScreenLoader />

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Employees</h1>
        <button className="btn-primary text-sm py-2" onClick={() => setShowForm((s) => !s)}>
          + Add Employee
        </button>
      </div>

      {showForm && (
        <div className="card space-y-3">
          <ErrorBanner message={error} />
          <div>
            <label className="label">Employee name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rahul Kumar" />
          </div>
          <button className="btn-primary w-full" disabled={saving || !name.trim()} onClick={handleInvite}>
            {saving ? 'Creating invite…' : 'Create invite link'}
          </button>
          {inviteLink && <InviteShareBox link={inviteLink} employeeName={invitedName ?? undefined} />}
        </div>
      )}

      {employees.length === 0 ? (
        <EmptyState title="Your team is empty." cta="+ Add Employee" onClick={() => setShowForm(true)} />
      ) : (
        <div className="space-y-2">
          {employees.map((e) => {
            const s = stats[e.id]
            return (
              <div key={e.id} className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{e.full_name}</div>
                    <div className="text-xs text-gray-400">
                      {e.invite_used ? 'Active' : e.invite_expires_at && new Date(e.invite_expires_at) < new Date() ? 'Invite expired' : 'Invite pending'}
                    </div>
                  </div>
                  {s && (
                    <div className="text-sm text-gray-500 text-right">
                      <div>
                        {s.completed}/{s.total} completed
                      </div>
                      {s.overdue > 0 && <div className="text-danger text-xs">{s.overdue} overdue</div>}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
