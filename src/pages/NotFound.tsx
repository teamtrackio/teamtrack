import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center text-center px-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Page not found</h1>
        <Link to="/" className="text-brand-600 font-medium">
          Go home
        </Link>
      </div>
    </div>
  )
}
