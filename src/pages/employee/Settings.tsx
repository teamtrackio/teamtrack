import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabaseClient'

export default function EmployeeSettings() {
  const { profile, membership, signOut, user, refresh } = useAuth()

  async function restartTour() {
    if (!user) return
    await supabase.from('profiles').update({ tour_employee_completed: false }).eq('id', user.id)
    await refresh()
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      <h1 className="text-xl font-bold">Settings</h1>
      <section className="card space-y-1">
        <p className="text-sm text-gray-500">Name</p>
        <p className="font-medium">{membership?.full_name ?? profile?.full_name}</p>
        <p className="text-sm text-gray-500 mt-2">Email</p>
        <p className="font-medium">{profile?.email}</p>
      </section>
      <section className="card">
        <button className="text-brand-600 font-medium text-sm" onClick={restartTour}>
          Restart tour
        </button>
      </section>
      <section className="card">
        <Link to="/help" className="text-brand-600 font-medium text-sm">
          Help Centre
        </Link>
      </section>
      <button className="btn-secondary w-full" onClick={signOut}>
        Log out
      </button>
    </div>
  )
}
