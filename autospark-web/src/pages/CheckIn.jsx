import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import QRCodeImage from '../components/QRCode'
import { useBooking } from '../context/BookingContext'
import { formatClockTime } from '../lib/format'

export default function CheckIn() {
  const navigate = useNavigate()
  const { booking, bookingLoaded, checkInBooking } = useBooking()

  useEffect(() => {
    if (bookingLoaded && !booking) navigate('/schedule', { replace: true })
  }, [bookingLoaded, booking, navigate])

  if (!booking) return null

  const isCheckedIn = booking.status === 'checked_in'
  // Stand-in for a server-issued signed/expiring token (spec 9.1); a real
  // backend would mint this per-booking so it can't be replayed or shared.
  const qrValue = `autospark:booking:${booking.id}`

  function handleScan() {
    checkInBooking()
  }

  return (
    <div className="app-shell items-center px-6 py-10 text-center">
      <AppHeader title="Check-In" subtitle={`Bay #${booking.bayNumber}`} />

      <div className="flex-1 w-full flex flex-col items-center justify-center">
        {isCheckedIn ? (
          <>
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <path d="M4 12.5 9.5 18 20 6" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="text-lg font-semibold text-brand-950 mt-4">You're Checked In</h1>
            <p className="text-sm text-slate-500 mt-1 max-w-xs">
              Please wait nearby — your bay will be ready around {formatClockTime(booking.estimatedStartAt)}.
            </p>
          </>
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-5 max-w-xs">
              Show this code to staff at the entrance, or scan the station code yourself.
            </p>
            <QRCodeImage value={qrValue} />
            <p className="text-xs text-slate-400 mt-4">Booking #{booking.id.slice(-6)}</p>
          </>
        )}
      </div>

      <div className="w-full flex flex-col gap-3">
        {!isCheckedIn && (
          <button
            type="button"
            onClick={handleScan}
            className="w-full rounded-2xl py-3 text-sm font-semibold text-white bg-brand-600 active:bg-brand-700 transition-colors"
          >
            Scan Now
          </button>
        )}
        <button
          type="button"
          onClick={() => navigate('/tracker')}
          className="w-full rounded-2xl py-3 text-sm font-semibold text-brand-700 bg-brand-50 active:bg-brand-100 transition-colors"
        >
          Back to Tracker
        </button>
      </div>
    </div>
  )
}
