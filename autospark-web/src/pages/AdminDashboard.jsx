import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import { useAdminAuth } from '../context/AdminAuthContext'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { admin, logout } = useAdminAuth()

  function handleLogout() {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="app-shell">
      <header className="flex items-center gap-3 px-5 pt-6 pb-4">
        <Logo size={56} />
        <div className="text-left">
          <h1 className="text-lg font-semibold text-brand-950 leading-tight">Admin</h1>
          {admin && (
            <p className="text-sm text-slate-500 leading-tight">
              {admin.name} · {admin.role}
            </p>
          )}
        </div>
      </header>

      <div className="flex-1 px-6 flex flex-col items-center justify-center text-center">
        <p className="text-lg font-semibold text-brand-950">You're logged in</p>
        <p className="text-sm text-slate-500 mt-2 max-w-xs">
          The full admin dashboard — bay board, live queue, subscription management, loyalty program, and
          reports — isn't built yet. This confirms admin login is working end to end.
        </p>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 rounded-2xl py-3 px-6 text-sm font-semibold text-white bg-red-600 active:bg-red-700 transition-colors"
        >
          Log Out
        </button>
      </div>
    </div>
  )
}
