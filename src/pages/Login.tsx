import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/hooks/useAuth'
import { ErrorBanner } from '@/components/StatusBits'
import { APP_CONFIG } from '@/config'

export default function Login() {
  const { refresh } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setLoading(false)
      setError('Couldn\u2019t log in. Check your email and password and try again.')
      return
    }
    // Without this, navigating immediately can race the auth-state listener
    // that's still loading which business this user belongs to — landing
    // them on /setup instead of their actual dashboard (see the longer
    // explanation in JoinInvite.tsx, which hits the same underlying issue).
    await refresh()
    setLoading(false)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-1">{APP_CONFIG.productName}</h1>
        <p className="text-gray-500 mb-6">Log in to your account</p>
        <ErrorBanner message={error} />
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>
        <div className="flex justify-between mt-4 text-sm">
          <Link to="/reset-password" className="text-gray-500">
            Forgot password?
          </Link>
          <Link to="/signup" className="text-brand-600 font-medium">
            Create account
          </Link>
        </div>
      </div>
    </div>
  )
}
