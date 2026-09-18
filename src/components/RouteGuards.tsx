import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import FullScreenLoader from '@/components/FullScreenLoader'

export function RequireAuth() {
  const { loading, session } = useAuth()
  if (loading) return <FullScreenLoader />
  if (!session) return <Navigate to="/login" replace />
  return <Outlet />
}

export function RequireBusiness() {
  const { loading, business } = useAuth()
  if (loading) return <FullScreenLoader />
  if (!business) return <Navigate to="/setup" replace />
  return <Outlet />
}

export function RequireOwner() {
  const { loading, membership } = useAuth()
  if (loading) return <FullScreenLoader />
  if (membership?.role !== 'owner') return <Navigate to="/dashboard" replace />
  return <Outlet />
}

export function RequireEmployee() {
  const { loading, membership } = useAuth()
  if (loading) return <FullScreenLoader />
  if (membership?.role !== 'employee') return <Navigate to="/dashboard" replace />
  return <Outlet />
}
