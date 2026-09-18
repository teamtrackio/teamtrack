import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { ErrorBanner } from '@/components/StatusBits'

export default function UpdatePassword() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) {
      setError('Couldn\u2019t update password. The reset link may have expired — request a new one.')
      return
    }
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-1">Set a new password</h1>
        <ErrorBanner message={error} />
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <input className="input" type="password" required minLength={6} placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? 'Saving…' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  )
}
