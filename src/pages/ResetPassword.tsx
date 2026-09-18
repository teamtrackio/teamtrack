import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { ErrorBanner, SuccessBanner } from '@/components/StatusBits'

export default function ResetPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`
    })
    setLoading(false)
    if (error) {
      setError('Couldn\u2019t send reset email. Please try again.')
      return
    }
    setSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-1">Reset password</h1>
        <p className="text-gray-500 mb-6">We\u2019ll email you a link to reset it.</p>
        <ErrorBanner message={error} />
        <SuccessBanner message={sent ? 'Check your email for a reset link.' : null} />
        {!sent && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input className="input" type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button className="btn-primary w-full" disabled={loading}>
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}
        <Link to="/login" className="text-sm text-brand-600 font-medium block mt-4">
          Back to login
        </Link>
      </div>
    </div>
  )
}
