import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import { useAdminAuth } from '../context/AdminAuthContext'

const SECTIONS = [
  { label: 'Bay Board', path: '/admin/bays', available: true },
  { label: 'Walk-In Booking', path: '/admin/walkin', available: true },
  { label: 'Service & Pricing', path: '/admin/service-config', available: true },
  { label: 'Subscription Plans', path: '/admin/subscription-plans', available: true },
  { label: 'Cooldown Settings', available: false },
  { label: 'Loyalty Program', available: false },
  { label: 'Reports', available: false },
]

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { admin, logout } = useAdminAuth()

  function handleLogout() {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="app-shell">
      <header className="flex items-center justify-between gap-3 px-5 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <Logo size={56} />
          <div className="text-left">
            <h1 className="text-lg font-semibold text-brand-950 leading-tight">Admin</h1>
            {admin && (
              <p className="text-sm text-slate-500 leading-tight">
                {admin.name} · {admin.role}
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Log out"
          className="p-2 -mr-2 rounded-full active:bg-slate-100 transition-colors"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3"
              stroke="#0a2e4f"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M16 16l4-4-4-4M20 12H9" stroke="#0a2e4f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </header>

      <nav className="flex-1 px-4 flex flex-col gap-2 pb-6">
        {SECTIONS.map(({ label, path, available }) => (
          <button
            key={label}
            type="button"
            disabled={!available}
            onClick={() => available && navigate(path)}
            className={`flex items-center justify-between px-4 py-3.5 rounded-2xl border text-left font-semibold transition-colors ${
              available
                ? 'bg-white border-slate-200 text-slate-800 active:bg-slate-50'
                : 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
            }`}
          >
            <span>{label}</span>
            {!available && <span className="text-xs font-normal text-slate-300">Coming soon</span>}
          </button>
        ))}
      </nav>
    </div>
  )
}
