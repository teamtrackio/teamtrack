import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { APP_CONFIG } from '@/config'

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/tasks', label: 'Tasks' },
  { to: '/employees', label: 'Employees' },
  { to: '/recurring', label: 'Recurring', desktopOnly: true },
  { to: '/reports', label: 'Reports', desktopOnly: true },
  { to: '/settings', label: 'Settings', mobileLabel: 'More' }
]

export default function OwnerLayout() {
  const { signOut, business } = useAuth()

  return (
    <div className="min-h-screen flex flex-col sm:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden sm:flex sm:flex-col w-56 border-r border-gray-100 bg-white p-4">
        <div className="font-bold text-lg mb-1">{APP_CONFIG.productName}</div>
        <div className="text-xs text-gray-400 mb-6 truncate">{business?.name}</div>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button onClick={signOut} className="mt-auto text-sm text-gray-400 text-left">
          Log out
        </button>
      </aside>

      <main className="flex-1 pb-20 sm:pb-6">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 flex justify-around py-2">
        {navItems
          .filter((n) => !n.desktopOnly)
          .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `text-xs font-medium px-3 py-1 ${isActive ? 'text-brand-600' : 'text-gray-400'}`}
            >
              {item.mobileLabel ?? item.label}
            </NavLink>
          ))}
      </nav>
    </div>
  )
}
