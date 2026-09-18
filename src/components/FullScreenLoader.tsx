export default function FullScreenLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center text-gray-500">
      <div className="animate-pulse">{label}</div>
    </div>
  )
}
