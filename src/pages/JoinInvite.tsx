import { useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { acceptInvite } from '@/services/business'
import { ErrorBanner } from '@/components/StatusBits'
import { APP_CONFIG } from '@/config'

export default function JoinInvite() {
  const { token } = useParams<{ token: string }>()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!token) return
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    try {
      // Create the auth account first...
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password })
      if (signUpError) throw signUpError

      // If email confirmation is on, there is no session yet — the invite
      // can't be claimed until they confirm and log in. We handle both paths.
      if (!signUpData.session) {
        // Try logging in immediately in case confirmation isn't required,
        // otherwise ask them to confirm their email first.
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) {
          setLoading(false)
          setError('Account created. Please check your email to confirm it, then open this invite link again to finish joining.')
          return
        }
      }

      // ...then attach this user to the invited business_members row.
      await acceptInvite(token)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message?.includes('expired') || err.message?.includes('invalid')
        ? 'This invite link is invalid or has expired. Ask your manager to send a new one.'
        : 'Couldn\u2019t complete sign-up. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-1">Join {APP_CONFIG.productName}</h1>
        <p className="text-gray-500 mb-6">Create your password to finish joining your team.</p>
        <ErrorBanner message={error} />
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label">Choose a password</label>
            <input className="input" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? 'Joining…' : 'Join team'}
          </button>
        </form>
      </div>
    </div>
  )
}
