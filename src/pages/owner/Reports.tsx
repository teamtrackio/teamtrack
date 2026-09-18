import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getTodaySummary, getEmployeeCompletion } from '@/services/business'
import { getTaskHistory } from '@/services/tasks'
import FullScreenLoader from '@/components/FullScreenLoader'
import { StatusBadge } from '@/components/StatusBits'

export default function OwnerReports() {
  const { business } = useAuth()
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<any>(null)
  const [team, setTeam] = useState<any[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(0)
  const pageSize = 20

  useEffect(() => {
    if (!business) return
    ;(async () => {
      setLoading(true)
      const [s, t, h] = await Promise.all([
        getTodaySummary(business.id),
        getEmployeeCompletion(business.id),
        getTaskHistory({ businessId: business.id, page })
      ])
      setSummary(s)
      setTeam(t)
      setHistory(h.data ?? [])
      setCount(h.count)
      setLoading(false)
    })()
  }, [business, page])

  if (loading) return <FullScreenLoader />

  const completionPct = summary && summary.total > 0 ? Math.round((summary.completed / summary.total) * 100) : 0

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <h1 className="text-xl font-bold">Reports</h1>

      <section className="card">
        <h2 className="text-sm font-semibold text-gray-500 mb-3">TODAY'S SUMMARY</h2>
        <p className="text-2xl font-bold mb-1">{completionPct}% completed</p>
        <p className="text-sm text-gray-500 mb-4">
          {summary?.total ?? 0} assigned · {summary?.completed ?? 0} completed · {summary?.pending ?? 0} pending · {summary?.overdue ?? 0} overdue
        </p>
        {team.filter((t) => t.overdue > 0).length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Needs attention</p>
            {team
              .filter((t) => t.overdue > 0)
              .map((t) => (
                <p key={t.member_id} className="text-sm text-danger">
                  {t.full_name}: {t.overdue} overdue task{t.overdue === 1 ? '' : 's'}
                </p>
              ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold text-gray-500 mb-2">EMPLOYEE COMPLETION (TODAY)</h2>
        <div className="space-y-2">
          {team.map((t) => (
            <div key={t.member_id} className="card flex items-center justify-between">
              <span className="font-medium">{t.full_name}</span>
              <span className="text-sm text-gray-500">
                {t.completed}/{t.total} · {t.total > 0 ? Math.round((t.completed / t.total) * 100) : 0}%
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-gray-500 mb-2">TASK HISTORY</h2>
        <div className="space-y-2">
          {history.map((t) => (
            <div key={t.id} className="card flex items-center justify-between">
              <div className="min-w-0">
                <div className="font-medium truncate">{t.title}</div>
                <div className="text-xs text-gray-400">{t.business_members?.full_name ?? t.business_members?.[0]?.full_name}</div>
              </div>
              <StatusBadge status={t.status} />
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center mt-3 text-sm">
          <button disabled={page === 0} className="text-gray-500 disabled:opacity-30" onClick={() => setPage((p) => p - 1)}>
            ← Newer
          </button>
          <span className="text-gray-400">
            Page {page + 1} of {Math.max(1, Math.ceil(count / pageSize))}
          </span>
          <button disabled={(page + 1) * pageSize >= count} className="text-gray-500 disabled:opacity-30" onClick={() => setPage((p) => p + 1)}>
            Older →
          </button>
        </div>
      </section>
    </div>
  )
}
