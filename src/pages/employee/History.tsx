import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getTaskHistory } from '@/services/tasks'
import { StatusBadge } from '@/components/StatusBits'
import FullScreenLoader from '@/components/FullScreenLoader'
import { Link } from 'react-router-dom'

export default function EmployeeHistory() {
  const { business, membership } = useAuth()
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<any[]>([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(0)
  const pageSize = 20

  useEffect(() => {
    if (!business || !membership) return
    ;(async () => {
      setLoading(true)
      const res = await getTaskHistory({ businessId: business.id, memberId: membership.id, page })
      setItems(res.data ?? [])
      setCount(res.count)
      setLoading(false)
    })()
  }, [business, membership, page])

  if (loading) return <FullScreenLoader />

  return (
    <div className="max-w-lg mx-auto p-4 space-y-3">
      <h1 className="text-xl font-bold">History</h1>
      {items.length === 0 ? (
        <div className="card text-gray-500 text-sm">No task history yet.</div>
      ) : (
        <div className="space-y-2">
          {items.map((t) => (
            <Link key={t.id} to={`/tasks/${t.id}`} className="card flex items-center justify-between block">
              <div className="min-w-0">
                <div className="font-medium truncate">{t.title}</div>
                <div className="text-xs text-gray-400">{new Date(t.due_at).toLocaleDateString()}</div>
              </div>
              <StatusBadge status={t.status} />
            </Link>
          ))}
        </div>
      )}
      <div className="flex justify-between items-center text-sm pt-2">
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
    </div>
  )
}
