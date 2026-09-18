import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { getTodaySummary, getEmployeeCompletion, generateDueRecurringTasks } from '@/services/business'
import { getOverdueTasksForBusiness } from '@/services/tasks'
import { supabase } from '@/lib/supabaseClient'
import FullScreenLoader from '@/components/FullScreenLoader'
import GuidedTour from '@/components/GuidedTour'
import { updateTourCompleted } from '@/services/business'
import { APP_CONFIG } from '@/config'

const OWNER_TOUR_STEPS = [
  { title: 'Dashboard', text: 'This is your command centre. See what your team completed, what\u2019s pending and what needs your attention.' },
  { title: 'Employees', text: 'Add your employees here. Each employee gets their own secure login.' },
  { title: 'Create Task', text: 'Assign work in seconds. Choose an employee, set a deadline and you\u2019re done.' },
  { title: 'Tasks', text: 'See everything your team needs to do today.' },
  { title: 'Overdue', text: 'Tasks that pass their deadline automatically appear here.' },
  { title: 'Team performance', text: 'See who is on track and where you need to step in.' },
  { title: 'That\u2019s it', text: `Assign the work and let ${APP_CONFIG.productName} keep track.` }
]

interface OverdueRow {
  id: string
  title: string
  due_at: string
  business_members: { full_name: string } | { full_name: string }[] | null
}

function memberName(row: OverdueRow) {
  const m = row.business_members
  if (!m) return 'Unassigned'
  return Array.isArray(m) ? m[0]?.full_name ?? 'Unassigned' : m.full_name
}

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'}`
  const hrs = Math.floor(mins / 60)
  return `${hrs} hour${hrs === 1 ? '' : 's'}`
}

export default function OwnerDashboard() {
  const { business, profile, user, refresh } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<{ total: number; completed: number; pending: number; overdue: number } | null>(null)
  const [overdue, setOverdue] = useState<OverdueRow[]>([])
  const [team, setTeam] = useState<{ member_id: string; full_name: string; total: number; completed: number; overdue: number }[]>([])
  const [recentActivity, setRecentActivity] = useState<{ id: string; action: string; note: string | null; created_at: string; task_title: string; user_name: string }[]>([])
  const [showTour, setShowTour] = useState(false)

  useEffect(() => {
    if (!business) return
    ;(async () => {
      setLoading(true)
      await generateDueRecurringTasks(business.id).catch(() => null)
      const [s, ov, emp] = await Promise.all([
        getTodaySummary(business.id),
        getOverdueTasksForBusiness(business.id),
        getEmployeeCompletion(business.id)
      ])
      setSummary(s)
      setOverdue(ov as unknown as OverdueRow[])
      setTeam(emp)

      const { data: activity } = await supabase
        .from('task_activity')
        .select('id, action, note, created_at, tasks(title), profiles(full_name)')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false })
        .limit(8)

      setRecentActivity(
        (activity ?? []).map((a: any) => ({
          id: a.id,
          action: a.action,
          note: a.note,
          created_at: a.created_at,
          task_title: a.tasks?.title ?? 'a task',
          user_name: a.profiles?.full_name ?? 'Someone'
        }))
      )

      setLoading(false)
      if (profile && !profile.tour_owner_completed) setShowTour(true)
    })()
  }, [business]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading || !business) return <FullScreenLoader />

  async function finishTour() {
    setShowTour(false)
    if (user) {
      await updateTourCompleted(user.id, 'tour_owner_completed')
      await refresh()
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      {showTour && <GuidedTour steps={OWNER_TOUR_STEPS} onFinish={finishTour} finalButtonLabel={`Start using ${APP_CONFIG.productName}`} />}

      <div>
        <h1 className="text-xl font-bold">Good morning, {profile?.full_name?.split(' ')[0] || 'there'} 👋</h1>
        <p className="text-gray-400 text-sm">{business.name}</p>
      </div>

      <section>
        <h2 className="text-sm font-semibold text-gray-500 mb-2">TODAY</h2>
        <div className="grid grid-cols-4 gap-2">
          <div className="card text-center py-3">
            <div className="text-xl font-bold">{summary?.total ?? 0}</div>
            <div className="text-xs text-gray-400">Tasks</div>
          </div>
          <div className="card text-center py-3">
            <div className="text-xl font-bold text-ok">{summary?.completed ?? 0}</div>
            <div className="text-xs text-gray-400">Completed</div>
          </div>
          <div className="card text-center py-3">
            <div className="text-xl font-bold text-warn">{summary?.pending ?? 0}</div>
            <div className="text-xs text-gray-400">Pending</div>
          </div>
          <div className="card text-center py-3">
            <div className="text-xl font-bold text-danger">{summary?.overdue ?? 0}</div>
            <div className="text-xs text-gray-400">Overdue</div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-gray-500 mb-2">NEEDS ATTENTION</h2>
        {overdue.length === 0 ? (
          <div className="card text-gray-500 text-sm">Everything is on track. 🎉</div>
        ) : (
          <div className="space-y-2">
            {overdue.slice(0, 5).map((t) => (
              <div key={t.id} className="card flex items-start gap-2">
                <span className="text-danger">🔴</span>
                <div className="flex-1">
                  <div className="font-medium">{memberName(t)}</div>
                  <div className="text-sm text-gray-600">{t.title}</div>
                  <div className="text-xs text-danger mt-0.5">Overdue by {timeAgo(t.due_at)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold text-gray-500 mb-2">TEAM TODAY</h2>
        {team.length === 0 ? (
          <div className="card text-gray-500 text-sm">
            Your team is empty.{' '}
            <button className="text-brand-600 font-medium" onClick={() => navigate('/employees')}>
              + Add Employee
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {team.map((m) => (
              <div key={m.member_id} className="card flex items-center justify-between">
                <span className="font-medium">{m.full_name}</span>
                <span className="text-sm text-gray-500">
                  {m.completed}/{m.total} completed{m.overdue > 0 ? ` · ${m.overdue} overdue` : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold text-gray-500 mb-2">RECENT ACTIVITY</h2>
        {recentActivity.length === 0 ? (
          <div className="card text-gray-500 text-sm">No activity yet today.</div>
        ) : (
          <div className="space-y-1">
            {recentActivity.map((a) => (
              <div key={a.id} className="text-sm text-gray-600">
                <span className="font-medium text-gray-800">{a.user_name}</span>{' '}
                {a.action === 'task_completed' ? 'completed' : a.action === 'task_started' ? 'started' : 'updated'}: "{a.task_title}"
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
