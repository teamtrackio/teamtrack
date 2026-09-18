import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { ErrorBanner } from '@/components/StatusBits'
import { APP_CONFIG } from '@/config'

export default function Signup() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [checkEmail, setCheckEmail] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    })
    setLoading(false)
    if (error) {
      setError(error.message.includes('already registered') ? 'An account with this email already exists.' : 'Couldn\u2019t create your account. Please try again.')
      return
    }
    // If email confirmation is required by the Supabase project settings,
    // there will be no session yet.
    if (!data.session) {
      setCheckEmail(true)
      return
    }
    navigate('/setup')
  }

  if (checkEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-center">
        <div>
          <h2 className="text-xl font-semibold mb-2">Check your email</h2>
          <p className="text-gray-500 max-w-sm">We\u2019ve sent a confirmation link to {email}. Click it, then come back and log in.</p>
          <Link to="/login" className="btn-primary inline-block mt-6">
            Go to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-1">{APP_CONFIG.productName}</h1>
        <p className="text-gray-500 mb-6">Create your owner account</p>
        <ErrorBanner message={error} />
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Your name</label>
            <input className="input" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className="text-sm mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
