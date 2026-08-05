import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import CancelReservationModal from '../components/CancelReservationModal'
import SideMenu from '../components/SideMenu'
import { useBooking } from '../context/BookingContext'
import { useServiceConfig } from '../context/ServiceConfigContext'
import { formatDateLabel } from '../lib/format'
import { formatDurationHM } from '../lib/countdown'
import { useNow } from '../hooks/useNow'

const CANCEL_CUTOFF_MS = 60 * 60 * 1000

export default function WaitingConfirmation() {
  const navigate = useNavigate()
  const { booking, bookingLoaded, cancelBooking } = useBooking()
  const { washName, waxName } = useServiceConfig()
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [error, setError] = useState(null)
  const now = useNow(1000)

  useEffect(() => {
    if (bookingLoaded && !booking) navigate('/schedule', { replace: true })
  }, [bookingLoaded, booking, navigate])

  if (!booking) return null

  async function handleConfirmCancel() {
    setError(null)
    try {
      await cancelBooking()
      navigate('/schedule', { replace: true })
    } catch (err) {
      setShowCancelConfirm(false)
      setError(err.message)
    }
  }

  function handleTrack() {
    navigate('/tracker')
  }

  const { hours, minutes } = formatDurationHM(booking.waitMinutes)
  const remainingMs = new Date(booking.estimatedStartAt).getTime() - now
  const canCancel = remainingMs >= CANCEL_CUTOFF_MS

  return (
    <div className="app-shell items-center justify-center px-6 py-10 text-center">
      <button
        type="button"
        onClick={() => setMenuOpen(true)}
        aria-label="Open menu"
        className="absolute top-6 right-6 p-2 rounded-full active:bg-slate-100 transition-colors"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M4 6h16M4 12h16M4 18h16" stroke="#0a2e4f" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      <Logo size={112} />
      <h1 className="text-lg font-semibold text-brand-950 mt-4">Booking Confirmed</h1>
      <p className="text-sm text-slate-500 mt-1">We'll see you soon!</p>

      <div className="mt-8 flex flex-col items-center">
        <p className="text-xs uppercase tracking-wide text-slate-400">Estimated Waiting Time</p>
        {hours > 0 ? (
          <p className="text-6xl font-bold text-brand-600 mt-1">
            {hours}
            <span className="text-2xl font-semibold text-brand-400 ml-1 mr-3">hr</span>
            {minutes}
            <span className="text-2xl font-semibold text-brand-400 ml-1">min</span>
          </p>
        ) : (
          <p className="text-6xl font-bold text-brand-600 mt-1">
            {minutes}
            <span className="text-2xl font-semibold text-brand-400 ml-1">min</span>
          </p>
        )}
      </div>

      <div className="mt-8 w-full bg-brand-50 rounded-2xl border border-brand-100 px-5 py-4 text-left">
        <div className="flex justify-between text-sm py-1">
          <span className="text-slate-500">Date</span>
          <span className="font-semibold text-slate-800">{formatDateLabel(booking.date)}</span>
        </div>
        <div className="flex justify-between text-sm py-1">
          <span className="text-slate-500">Time</span>
          <span className="font-semibold text-slate-800">{booking.time}</span>
        </div>
        <div className="flex justify-between text-sm py-1">
          <span className="text-slate-500">Bay</span>
          <span className="font-semibold text-slate-800">Bay {booking.bayNumber}</span>
        </div>
        <div className="flex justify-between text-sm py-1">
          <span className="text-slate-500">Wash</span>
          <span className="font-semibold text-slate-800">
            {washName}
            {booking.waxAdded && ` + ${waxName}`}
          </span>
        </div>
      </div>

      {error && <p className="text-xs text-red-500 mt-4 max-w-xs">{error}</p>}

      <div className="mt-10 w-full flex flex-col gap-3">
        <button
          type="button"
          onClick={handleTrack}
          className="w-full rounded-2xl py-3 text-sm font-semibold text-white bg-brand-600 active:bg-brand-700 transition-colors"
        >
          Track My Wash
        </button>
        {!canCancel && (
          <p className="text-xs text-slate-400 text-center -mb-1">
            Cancellation closes 60 minutes before your turn
          </p>
        )}
        <button
          type="button"
          disabled={!canCancel}
          onClick={() => setShowCancelConfirm(true)}
          className="w-full rounded-2xl py-3 text-sm font-semibold text-red-600 bg-red-50 disabled:text-slate-400 disabled:bg-slate-100 active:bg-red-100 transition-colors"
        >
          Cancel Booking
        </button>
      </div>

      {showCancelConfirm && (
        <CancelReservationModal
          onKeep={() => setShowCancelConfirm(false)}
          onConfirmCancel={handleConfirmCancel}
        />
      )}

      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  )
}
