import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import FullScreenLoader from '@/components/FullScreenLoader'
import { RequireAuth, RequireBusiness, RequireOwner, RequireEmployee } from '@/components/RouteGuards'

import Landing from '@/pages/Landing'
import Login from '@/pages/Login'
import Signup from '@/pages/Signup'
import ResetPassword from '@/pages/ResetPassword'
import UpdatePassword from '@/pages/UpdatePassword'
import JoinInvite from '@/pages/JoinInvite'
import SetupWizard from '@/pages/SetupWizard'
import Help from '@/pages/Help'
import TaskDetail from '@/pages/TaskDetail'
import NotFound from '@/pages/NotFound'

import OwnerLayout from '@/layouts/OwnerLayout'
import OwnerDashboard from '@/pages/owner/Dashboard'
import OwnerTasks from '@/pages/owner/Tasks'
import OwnerEmployees from '@/pages/owner/Employees'
import OwnerRecurring from '@/pages/owner/Recurring'
import OwnerReports from '@/pages/owner/Reports'
import OwnerSettings from '@/pages/owner/Settings'

import EmployeeLayout from '@/layouts/EmployeeLayout'
import EmployeeDashboard from '@/pages/employee/Dashboard'
import EmployeeHistory from '@/pages/employee/History'
import EmployeeSettings from '@/pages/employee/Settings'

// Routes here mirror the product spec's routing list. Role protection is
// defense-in-depth for UX only — the real security boundary is the Row
// Level Security policies in supabase/schema.sql, which the frontend cannot
// bypass regardless of what routes or state it exposes.
export default function App() {
  const { loading } = useAuth()
  if (loading) return <FullScreenLoader />

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/update-password" element={<UpdatePassword />} />
      <Route path="/join/:token" element={<JoinInvite />} />

      <Route element={<RequireAuth />}>
        <Route path="/setup" element={<SetupWizard />} />
        <Route path="/help" element={<Help />} />

        <Route element={<RequireBusiness />}>
          <Route path="/tasks/:id" element={<TaskDetail />} />

          {/* Owner-only area */}
          <Route element={<RequireOwner />}>
            <Route element={<OwnerLayout />}>
              <Route path="/dashboard" element={<OwnerDashboard />} />
              <Route path="/tasks" element={<OwnerTasks />} />
              <Route path="/employees" element={<OwnerEmployees />} />
              <Route path="/recurring" element={<OwnerRecurring />} />
              <Route path="/reports" element={<OwnerReports />} />
              <Route path="/settings" element={<OwnerSettings />} />
            </Route>
          </Route>

          {/* Employee-only area. Note: /dashboard and /settings paths are
              shared across roles — RequireOwner/RequireEmployee route to the
              correct implementation, so an employee never sees the owner's
              dashboard component and vice versa. */}
          <Route element={<RequireEmployee />}>
            <Route element={<EmployeeLayout />}>
              <Route path="/dashboard" element={<EmployeeDashboard />} />
              <Route path="/history" element={<EmployeeHistory />} />
              <Route path="/settings" element={<EmployeeSettings />} />
            </Route>
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
