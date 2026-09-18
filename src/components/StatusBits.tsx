export function PriorityDot({ priority }: { priority: string }) {
  const color = priority === 'high' ? 'bg-danger' : priority === 'low' ? 'bg-gray-300' : 'bg-warn'
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${color}`} />
}

export function StatusBadge({ status, overdue }: { status: string; overdue?: boolean }) {
  if (overdue) return <span className="text-xs font-medium text-danger bg-red-50 px-2 py-1 rounded-full">Overdue</span>
  const map: Record<string, string> = {
    completed: 'text-ok bg-green-50',
    in_progress: 'text-warn bg-amber-50',
    pending: 'text-gray-500 bg-gray-100'
  }
  const label: Record<string, string> = {
    completed: 'Completed',
    in_progress: 'In progress',
    pending: 'Pending'
  }
  return <span className={`text-xs font-medium px-2 py-1 rounded-full ${map[status] ?? map.pending}`}>{label[status] ?? status}</span>
}

export function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null
  return <div className="bg-red-50 text-danger text-sm rounded-xl px-3 py-2 mb-3">{message}</div>
}

export function SuccessBanner({ message }: { message: string | null }) {
  if (!message) return null
  return <div className="bg-green-50 text-ok text-sm rounded-xl px-3 py-2 mb-3">{message}</div>
}

export function EmptyState({ title, cta, onClick }: { title: string; cta?: string; onClick?: () => void }) {
  return (
    <div className="card text-center py-10 text-gray-500">
      <p className="mb-3">{title}</p>
      {cta && onClick && (
        <button onClick={onClick} className="btn-primary inline-block">
          {cta}
        </button>
      )}
    </div>
  )
}
