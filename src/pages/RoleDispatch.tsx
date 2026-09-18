import { useAuth } from '@/hooks/useAuth'
import FullScreenLoader from '@/components/FullScreenLoader'
import OwnerLayout from '@/layouts/OwnerLayout'
import EmployeeLayout from '@/layouts/EmployeeLayout'
import OwnerDashboard from '@/pages/owner/Dashboard'
import EmployeeDashboard from '@/pages/employee/Dashboard'
import OwnerSettings from '@/pages/owner/Settings'
import EmployeeSettings from '@/pages/employee/Settings'

// THE BUG THIS FIXES:
// /dashboard and /settings previously existed as two separate <Route path="...">
// entries — one under an owner-only branch, one under an employee-only
// branch. React Router resolves which route matches a URL BEFORE any
// component (including a role-check guard) ever renders. With two routes
// declaring the identical path, it always resolves to whichever one was
// declared first in the tree — which was the owner branch — regardless of
// who was actually logged in. An employee hitting /dashboard therefore
// always rendered inside the owner's route tree; the guard would then try
// to redirect them back to /dashboard, which is the same URL, so it just
// looped rather than ever reaching the employee's actual dashboard.
//
// THE FIX:
// There is now exactly one <Route path="/dashboard"> and one
// <Route path="/settings"> (see App.tsx), each pointing at a dispatcher
// below that reads the signed-in user's role and renders the correct page
// and layout directly — no duplicate path, no ambiguity for the router.
export function DashboardDispatch() {
  const { membership, loading } = useAuth()
  if (loading || !membership) return <FullScreenLoader />
  return membership.role === 'owner' ? (
    <OwnerLayout>
      <OwnerDashboard />
    </OwnerLayout>
  ) : (
    <EmployeeLayout>
      <EmployeeDashboard />
    </EmployeeLayout>
  )
}

export function SettingsDispatch() {
  const { membership, loading } = useAuth()
  if (loading || !membership) return <FullScreenLoader />
  return membership.role === 'owner' ? (
    <OwnerLayout>
      <OwnerSettings />
    </OwnerLayout>
  ) : (
    <EmployeeLayout>
      <EmployeeSettings />
    </EmployeeLayout>
  )
}
