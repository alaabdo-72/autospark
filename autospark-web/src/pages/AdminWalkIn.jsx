import { useEffect, useState } from 'react'
import AdminHeader from '../components/AdminHeader'
import DateStrip from '../components/DateStrip'
import TimeChips from '../components/TimeChips'
import { adminApiFetch } from '../lib/adminApi'

export default function AdminWalkIn() {
  const [name, setName] = useState('')
  const [emailOrPhone, setEmailOrPhone] = useState('')
  const [waxAdded, setWaxAdded] = useState(false)
  const [date, setDate] = useState(null)
  const [time, setTime] = useState(null)
  const [slots, setSlots] = useState([])
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!date) {
      setSlots([])
      return
    }
    let cancelled = false
    adminApiFetch(`/admin/walkin/slots?date=${date}`).then((data) => {
      if (!cancelled) setSlots(data.slots)
    })
    return () => {
      cancelled = true
    }
  }, [date])

  function handleDateChange(d) {
    setDate(d)
    setTime(null)
  }

  const selectedSlot = slots.find((s) => s.time === time)
  const canSubmit =
    name.trim().length > 0 && emailOrPhone.trim().length > 0 && Boolean(date) && Boolean(selectedSlot) && !selectedSlot?.isFull && !submitting

  async function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return
    setError(null)
    setSuccess(null)
    setSubmitting(true)
    try {
      const data = await adminApiFetch('/admin/walkin', {
        method: 'POST',
        body: { name, emailOrPhone, date, time, waxAdded },
      })
      setSuccess(`Booked ${data.customer.name} — Bay ${data.booking.bayNumber} at ${data.booking.time}`)
      setName('')
      setEmailOrPhone('')
      setWaxAdded(false)
      setDate(null)
      setTime(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="app-shell">
      <AdminHeader title="Walk-In Booking" subtitle="For customers without the app" />

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col pb-6">
        <div className="px-5 flex flex-col gap-3">
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1 block">Customer Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1 block">Phone or Email</label>
            <input
              type="text"
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              placeholder="07XXXXXXXX"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            />
          </div>
        </div>

        <div className="mt-5">
          <DateStrip value={date} onChange={handleDateChange} />
        </div>
        <TimeChips value={time} onChange={setTime} slots={slots} date={date} />

        <div className="px-5 mt-5">
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
            <input
              type="checkbox"
              checked={waxAdded}
              onChange={(e) => setWaxAdded(e.target.checked)}
              className="w-5 h-5 accent-brand-600"
            />
            <span className="text-sm font-semibold text-slate-800">Add Wax</span>
          </label>
        </div>

        {error && (
          <div className="mx-5 mt-4 rounded-xl bg-red-50 border border-red-100 px-4 py-2.5 text-sm text-red-600">{error}</div>
        )}
        {success && (
          <div className="mx-5 mt-4 rounded-xl bg-green-50 border border-green-100 px-4 py-2.5 text-sm text-green-700">
            {success}
          </div>
        )}

        <div className="px-5 pt-4 mt-auto">
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-2xl py-3 text-sm font-semibold text-white bg-brand-600 disabled:bg-slate-300 disabled:text-slate-500 active:bg-brand-700 transition-colors"
          >
            {submitting ? 'Booking…' : 'Create Booking'}
          </button>
        </div>
      </form>
    </div>
  )
}
