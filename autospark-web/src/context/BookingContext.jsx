import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../lib/api'
import { useAuth } from './AuthContext'
import { useSubscription } from './SubscriptionContext'
import { PAYG_WASH_PRICE_JD, WAX_PRICE_JD } from '../mock/services'

const BookingContext = createContext(null)

export function BookingProvider({ children }) {
  const { isAuthed } = useAuth()
  const { plan, canBookPaid, canBookFree, waxUnlockedFree, paygCreditJD, refresh: refreshSubscription } =
    useSubscription()

  const [draft, setDraft] = useState({ date: null, time: null, waxAdded: false })
  const [booking, setBooking] = useState(null)
  const [bookingLoaded, setBookingLoaded] = useState(false)
  const [slots, setSlots] = useState([])

  useEffect(() => {
    if (!isAuthed) {
      setBooking(null)
      setBookingLoaded(true)
      return
    }
    apiFetch('/bookings/active')
      .then((data) => setBooking(data.booking))
      .finally(() => setBookingLoaded(true))
  }, [isAuthed])

  useEffect(() => {
    if (!isAuthed || !draft.date) {
      setSlots([])
      return
    }
    let cancelled = false
    apiFetch(`/slots?date=${draft.date}`).then((data) => {
      if (!cancelled) setSlots(data.slots)
    })
    return () => {
      cancelled = true
    }
  }, [isAuthed, draft.date])

  const setDate = (date) => setDraft((d) => ({ ...d, date, time: null }))
  const setTime = (time) => setDraft((d) => ({ ...d, time }))
  const toggleWax = () => setDraft((d) => ({ ...d, waxAdded: !d.waxAdded }))

  const washSource = useMemo(() => {
    if (plan === 'payg') return canBookPaid ? 'payg' : null
    if (plan === 'yearly') return canBookFree ? 'free' : canBookPaid ? 'paid' : null
    if (plan === 'monthly') return canBookPaid ? 'paid' : null
    return null
  }, [plan, canBookPaid, canBookFree])

  const waxSource = useMemo(() => {
    if (!draft.waxAdded) return null
    return waxUnlockedFree ? 'free' : 'paid'
  }, [draft.waxAdded, waxUnlockedFree])

  const washPrice = washSource === 'payg' ? PAYG_WASH_PRICE_JD : 0
  const waxPrice = waxSource === 'paid' ? WAX_PRICE_JD : 0
  const rawTotal = washPrice + waxPrice
  const creditApplied = washSource === 'payg' ? Math.min(paygCreditJD, rawTotal) : 0
  const totalPrice = rawTotal - creditApplied

  const selectedSlot = slots.find((s) => s.time === draft.time)
  const previewBayNumber = selectedSlot && !selectedSlot.isFull ? selectedSlot.reservedCount + 1 : null

  const canConfirm = Boolean(draft.date && draft.time && selectedSlot && !selectedSlot.isFull && washSource)

  async function confirmBooking() {
    if (!canConfirm) return null
    const data = await apiFetch('/bookings', {
      method: 'POST',
      body: { date: draft.date, time: draft.time, waxAdded: draft.waxAdded },
    })
    setBooking(data.booking)
    await refreshSubscription()
    return data.booking
  }

  async function cancelBooking() {
    if (!booking) return
    await apiFetch(`/bookings/${booking.id}`, { method: 'DELETE' })
    setBooking(null)
    setDraft({ date: null, time: null, waxAdded: false })
    await refreshSubscription()
  }

  async function checkInBooking() {
    if (!booking) return
    const data = await apiFetch(`/bookings/${booking.id}/checkin`, { method: 'POST' })
    setBooking(data.booking)
    await refreshSubscription()
  }

  const value = {
    draft,
    setDate,
    setTime,
    toggleWax,
    washSource,
    waxSource,
    washPrice,
    waxPrice,
    creditApplied,
    totalPrice,
    previewBayNumber,
    slots,
    canConfirm,
    confirmBooking,
    booking,
    bookingLoaded,
    cancelBooking,
    checkInBooking,
  }

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
}

export function useBooking() {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error('useBooking must be used within BookingProvider')
  return ctx
}
