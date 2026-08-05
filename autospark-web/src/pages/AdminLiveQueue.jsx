import { useCallback, useEffect, useState } from 'react'
import AdminHeader from '../components/AdminHeader'
import { adminApiFetch } from '../lib/adminApi'

const STATUS_STYLES = {
  confirmed: { label: 'Confirmed', badge: 'bg-slate-100 text-slate-500' },
  checked_in: { label: 'Checked In', badge: 'bg-brand-100 text-brand-700' },
}

export default function AdminLiveQueue() {
  const [queue, setQueue] = useState([])
  const [bays, setBays] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busyId, setBusyId] = useState(null)

  const load = useCallback(async () => {
    try {
      const [queueData, bayData] = await Promise.all([adminApiFetch('/admin/queue'), adminApiFetch('/admin/bays')])
      setQueue(queueData.queue)
      setBays(bayData.bays)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, 10000)
    return () => clearInterval(id)
  }, [load])

  async function runAction(id, path, options) {
    setError(null)
    setBusyId(id)
    try {
      await adminApiFetch(`/admin/queue/${id}${path}`, options)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const activeBayNumbers = bays.filter((b) => b.isActive).map((b) => b.number)

  return (
    <div className="app-shell">
      <AdminHeader title="Live Queue" subtitle="Today's bookings" />

      <div className="flex-1 px-5 pb-6 flex flex-col gap-3">
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-2.5 text-sm text-red-600">{error}</div>
        )}

        {loading ? (
          <p className="text-sm text-slate-400 text-center mt-8">Loading…</p>
        ) : queue.length === 0 ? (
          <p className="text-sm text-slate-400 text-center mt-8">No bookings today.</p>
        ) : (
          queue.map((booking) => {
            const style = STATUS_STYLES[booking.status]
            const isBusy = busyId === booking.id
            return (
              <div key={booking.id} className="rounded-2xl border border-slate-200 px-4 py-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-semibold text-slate-800">{booking.user.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {booking.time} · Bay {booking.bayNumber}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${style.badge}`}>
                    {style.label}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  {booking.status === 'confirmed' && (
                    <>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => runAction(booking.id, '/checkin', { method: 'POST' })}
                        className="rounded-xl py-2 px-3 text-sm font-semibold text-brand-700 bg-brand-50 active:bg-brand-100 disabled:opacity-50 transition-colors"
                      >
                        Check In
                      </button>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => runAction(booking.id, '/no-show', { method: 'POST' })}
                        className="rounded-xl py-2 px-3 text-sm font-semibold text-amber-700 bg-amber-50 active:bg-amber-100 disabled:opacity-50 transition-colors"
                      >
                        No-Show
                      </button>
                    </>
                  )}
                  {booking.status === 'checked_in' && (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => runAction(booking.id, '/complete', { method: 'POST' })}
                      className="rounded-xl py-2 px-3 text-sm font-semibold text-green-700 bg-green-50 active:bg-green-100 disabled:opacity-50 transition-colors"
                    >
                      Complete
                    </button>
                  )}
                  <select
                    disabled={isBusy}
                    value={booking.bayNumber}
                    onChange={(e) =>
                      runAction(booking.id, '/bay', { method: 'PATCH', body: { bayNumber: Number(e.target.value) } })
                    }
                    className="rounded-xl py-2 px-3 text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-200 disabled:opacity-50"
                  >
                    {activeBayNumbers.map((n) => (
                      <option key={n} value={n}>
                        Bay {n}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
