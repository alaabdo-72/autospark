import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import CancelReservationModal from '../components/CancelReservationModal'
import { useBooking } from '../context/BookingContext'
import { useServiceConfig } from '../context/ServiceConfigContext'
import { formatDateLabel, formatClockTime } from '../lib/format'
import { formatCountdown } from '../lib/countdown'
import { useNow } from '../hooks/useNow'

const CHECK_IN_WINDOW_MS = 3 * 60 * 1000
const CANCEL_CUTOFF_MS = 60 * 60 * 1000

export default function LiveTracker() {
  const navigate = useNavigate()
  const { booking, bookingLoaded, cancelBooking } = useBooking()
  const { washName, waxName } = useServiceConfig()
  const now = useNow(1000)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (bookingLoaded && !booking) navigate('/schedule', { replace: true })
  }, [bookingLoaded, booking, navigate])

  if (!booking) return null

  const { label: countdownLabel, isDue } = formatCountdown(booking.estimatedStartAt, now)
  const isCheckedIn = booking.status === 'checked_in'
  const remainingMs = new Date(booking.estimatedStartAt).getTime() - now
  const canCheckIn = isCheckedIn || remainingMs <= CHECK_IN_WINDOW_MS
  const canCancel = remainingMs >= CANCEL_CUTOFF_MS

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

  return (
    <div className="app-shell">
      <AppHeader title="Live Queue Tracker" subtitle={`Bay #${booking.bayNumber}`} />

      <div className="flex-1 px-5 pb-4 flex flex-col items-center">
        <div className="w-full bg-brand-950 rounded-3xl px-6 py-8 text-center text-white">
          <p className="text-xs uppercase tracking-wide text-brand-200">Time Until Wash</p>
          <p className={`text-5xl font-bold mt-2 tabular-nums ${isDue ? 'text-spark-400' : 'text-white'}`}>
            {isDue ? "It's your turn!" : countdownLabel}
          </p>
          <p className="text-sm text-brand-200 mt-3">
            {isDue ? 'Head to the bay now' : `Estimated start at ${formatClockTime(booking.estimatedStartAt)}`}
          </p>
        </div>

        <div className="w-full grid grid-cols-2 gap-3 mt-4">
          <div className="rounded-2xl border border-slate-200 px-4 py-3 text-center">
            <p className="text-2xl font-bold text-brand-700">{booking.bayNumber}</p>
            <p className="text-xs text-slate-500 mt-0.5">Bay</p>
          </div>
          <div className="rounded-2xl border border-slate-200 px-4 py-3 text-center">
            <p className="text-2xl font-bold text-brand-700 capitalize">
              {isCheckedIn ? 'Checked In' : 'Confirmed'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Status</p>
          </div>
        </div>

        <div className="w-full mt-4 rounded-2xl border border-slate-200 px-4 py-3">
          <div className="flex justify-between text-sm py-1">
            <span className="text-slate-500">Date</span>
            <span className="font-semibold text-slate-800">{formatDateLabel(booking.date)}</span>
          </div>
          <div className="flex justify-between text-sm py-1">
            <span className="text-slate-500">Time</span>
            <span className="font-semibold text-slate-800">{booking.time}</span>
          </div>
          <div className="flex justify-between text-sm py-1">
            <span className="text-slate-500">Wash</span>
            <span className="font-semibold text-slate-800">
              {washName}
              {booking.waxAdded && ` + ${waxName}`}
            </span>
          </div>
        </div>

        <div className="w-full mt-auto pt-6 flex flex-col gap-3">
          {!canCheckIn && (
            <p className="text-xs text-slate-400 text-center -mb-1">
              Check-in opens 3 minutes before your turn
            </p>
          )}
          <button
            type="button"
            disabled={!canCheckIn}
            onClick={() => navigate('/checkin')}
            className="w-full rounded-2xl py-3 text-sm font-semibold text-white bg-brand-600 disabled:bg-slate-300 disabled:text-slate-500 active:bg-brand-700 transition-colors"
          >
            {isCheckedIn ? 'View Check-In QR' : "I've Arrived — Check In"}
          </button>
          {!isCheckedIn && (
            <>
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
            </>
          )}
          {error && <p className="text-xs text-red-500 text-center">{error}</p>}
        </div>
      </div>

      {showCancelConfirm && (
        <CancelReservationModal
          onKeep={() => setShowCancelConfirm(false)}
          onConfirmCancel={handleConfirmCancel}
        />
      )}
    </div>
  )
}
