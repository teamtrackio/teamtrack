import { NavLink, Outlet } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { APP_CONFIG } from '@/config'

// See the comment in OwnerLayout.tsx — same reasoning: children is optional
// so this layout works both as a nested-route Outlet wrapper (/history) and
// as a direct wrapper for the shared /dashboard and /settings paths.
export default function EmployeeLayout({ children }: { children?: ReactNode }) {
  const { signOut } = useAuth()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sm:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
        <span className="font-bold">{APP_CONFIG.productName}</span>
        <button onClick={signOut} className="text-sm text-gray-400">
          Log out
        </button>
      </header>
      <main className="flex-1 pb-20">
        {children ?? <Outlet />}
      </main>
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 flex justify-around py-2">
        <NavLink to="/dashboard" className={({ isActive }) => `text-xs font-medium px-3 py-1 ${isActive ? 'text-brand-600' : 'text-gray-400'}`}>
          Today
        </NavLink>
        <NavLink to="/history" className={({ isActive }) => `text-xs font-medium px-3 py-1 ${isActive ? 'text-brand-600' : 'text-gray-400'}`}>
          History
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `text-xs font-medium px-3 py-1 ${isActive ? 'text-brand-600' : 'text-gray-400'}`}>
          Settings
        </NavLink>
      </nav>
    </div>
  )
}
