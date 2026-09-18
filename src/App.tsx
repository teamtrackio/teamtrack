import { Route, Routes } from 'react-router-dom'
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
import { DashboardDispatch, SettingsDispatch } from '@/pages/RoleDispatch'

import OwnerLayout from '@/layouts/OwnerLayout'
import OwnerTasks from '@/pages/owner/Tasks'
import OwnerEmployees from '@/pages/owner/Employees'
import OwnerRecurring from '@/pages/owner/Recurring'
import OwnerReports from '@/pages/owner/Reports'

import EmployeeLayout from '@/layouts/EmployeeLayout'
import EmployeeHistory from '@/pages/employee/History'

// Routes here mirror the product spec's routing list. Role protection is
// defense-in-depth for UX only — the real security boundary is the Row
// Level Security policies in supabase/schema.sql, which the frontend cannot
// bypass regardless of what routes or state it exposes.
//
// /dashboard and /settings are each declared ONCE (via DashboardDispatch /
// SettingsDispatch) rather than once per role — see the comment in
// src/pages/RoleDispatch.tsx for why duplicating a path across two role
// branches doesn't work the way it looks like it should.
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
          <Route path="/dashboard" element={<DashboardDispatch />} />
          <Route path="/settings" element={<SettingsDispatch />} />

          {/* Owner-only area */}
          <Route element={<RequireOwner />}>
            <Route element={<OwnerLayout />}>
              <Route path="/tasks" element={<OwnerTasks />} />
              <Route path="/employees" element={<OwnerEmployees />} />
              <Route path="/recurring" element={<OwnerRecurring />} />
              <Route path="/reports" element={<OwnerReports />} />
            </Route>
          </Route>

          {/* Employee-only area */}
          <Route element={<RequireEmployee />}>
            <Route element={<EmployeeLayout />}>
              <Route path="/history" element={<EmployeeHistory />} />
            </Route>
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

