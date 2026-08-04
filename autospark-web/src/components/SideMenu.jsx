import { useLocation, useNavigate } from 'react-router-dom'
import Logo from './Logo'
import { useAuth } from '../context/AuthContext'
import { useBooking } from '../context/BookingContext'
import { useNow } from '../hooks/useNow'

const CHECK_IN_WINDOW_MS = 3 * 60 * 1000

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M4 11 12 4l8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function QrIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="4" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.8" />
      <rect x="14" y="4" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.8" />
      <rect x="4" y="14" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.8" />
      <path d="M15 15h2v2h-2zM18 18h2v2h-2zM15 19h1M19 15h1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function HistoryIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M3 12a9 9 0 1 0 3-6.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M3 4v4h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3.5 14.6 9l6 .9-4.3 4.2 1 6-5.3-2.8-5.3 2.8 1-6L3.4 9.9l6-.9Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 16l4-4-4-4M20 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const MENU_ITEMS = [
  { label: 'Schedule a Wash', path: '/schedule', icon: HomeIcon },
  { label: 'Live Queue Tracker', path: '/tracker', icon: ClockIcon },
  { label: 'Check-In', path: '/checkin', icon: QrIcon },
  { label: 'Booking History', path: '/history', icon: HistoryIcon },
  { label: 'Subscription Plans', path: '/subscription', icon: StarIcon },
]

export default function SideMenu({ open, onClose }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()
  const { booking } = useBooking()
  const now = useNow(1000)

  const isCheckedIn = booking?.status === 'checked_in'
  const remainingMs = booking ? new Date(booking.estimatedStartAt).getTime() - now : Infinity
  const canCheckIn = Boolean(booking) && (isCheckedIn || remainingMs <= CHECK_IN_WINDOW_MS)

  function goTo(path) {
    onClose()
    navigate(path)
  }

  function handleLogout() {
    onClose()
    logout()
    navigate('/')
  }

  return (
    <>
      <div
        onClick={onClose}
        className={`absolute inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      <div
        className={`absolute inset-y-0 left-0 z-50 w-[78%] max-w-[300px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 pt-6 pb-4">
          <Logo size={40} />
          <button type="button" onClick={onClose} aria-label="Close menu" className="p-1 -mr-1">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6 6 18" stroke="#0a2e4f" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-3 mt-2 flex flex-col gap-1">
          {MENU_ITEMS.map(({ label, path, icon: Icon }) => {
            const isActive = location.pathname === path
            const isCheckInItem = path === '/checkin'
            const isDisabled = isCheckInItem && !canCheckIn
            return (
              <button
                key={path}
                type="button"
                disabled={isDisabled}
                onClick={() => goTo(path)}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-left font-semibold transition-colors ${
                  isDisabled
                    ? 'text-slate-300 cursor-not-allowed'
                    : isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-700 active:bg-brand-50'
                }`}
              >
                <span className={isDisabled ? 'text-slate-300' : 'text-brand-600'}>
                  <Icon />
                </span>
                <span className="flex flex-col">
                  {label}
                  {isDisabled && (
                    <span className="text-xs font-normal text-slate-300">Opens 3 min before your turn</span>
                  )}
                </span>
              </button>
            )
          })}
        </nav>

        <div className="px-3 pb-8 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-red-600 font-semibold active:bg-red-50 transition-colors"
          >
            <LogoutIcon />
            Log Out
          </button>
        </div>
      </div>
    </>
  )
}
