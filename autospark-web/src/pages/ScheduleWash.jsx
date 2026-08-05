import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import DateStrip from '../components/DateStrip'
import TimeChips from '../components/TimeChips'
import WashInfoCard from '../components/WashInfoCard'
import WaxOption from '../components/WaxOption'
import WashesRemainingBanner from '../components/WashesRemainingBanner'
import FreeWashProgress from '../components/FreeWashProgress'
import BottomBar from '../components/BottomBar'
import PaymentModal from '../components/PaymentModal'
import { useBooking } from '../context/BookingContext'
import { useSubscription } from '../context/SubscriptionContext'
import { useServiceConfig } from '../context/ServiceConfigContext'
import { PLANS } from '../mock/services'
import { formatDateLabel, toBusinessISODate } from '../lib/format'
import { useNow } from '../hooks/useNow'

export default function ScheduleWash() {
  const navigate = useNavigate()
  const {
    loading: subscriptionLoading,
    hasActiveSubscription,
    plan,
    paidWashesRemaining,
    freeWashesRemaining,
    canBookPaid,
    canBookFree,
    nextEligibleAt,
    waxUnlockedFree,
    paygCreditJD,
    freeWashesUnlocked,
    paidWashesUntilNextFreeUnlock,
  } = useSubscription()
  const {
    booking,
    bookingLoaded,
    draft,
    setDate,
    setTime,
    toggleWax,
    washSource,
    totalPrice,
    creditApplied,
    previewBayNumber,
    slots,
    canConfirm,
    confirmBooking,
  } = useBooking()
  const { paygWashPriceJD } = useServiceConfig()
  const [showPayment, setShowPayment] = useState(false)
  const [error, setError] = useState(null)
  const now = useNow(60000)

  useEffect(() => {
    if (!subscriptionLoading && !hasActiveSubscription) navigate('/subscription', { replace: true })
  }, [subscriptionLoading, hasActiveSubscription, navigate])

  useEffect(() => {
    if (bookingLoaded && booking) navigate('/confirmation', { replace: true })
  }, [bookingLoaded, booking, navigate])

  if (subscriptionLoading || !hasActiveSubscription) return null
  if (!bookingLoaded || booking) return null

  async function doConfirm() {
    setError(null)
    try {
      const booking = await confirmBooking()
      if (booking) navigate('/confirmation')
    } catch (err) {
      setError(err.message)
    }
  }

  function handlePrimaryAction() {
    if (totalPrice > 0) {
      setShowPayment(true)
    } else {
      doConfirm()
    }
  }

  function handlePaymentSuccess() {
    setShowPayment(false)
    doConfirm()
  }

  const isBlocked = !canBookPaid && !canBookFree

  if (isBlocked) {
    const isCadenceBlocked = Boolean(nextEligibleAt)
    const daysRemaining = isCadenceBlocked ? Math.max(1, Math.ceil((nextEligibleAt.getTime() - now) / 86400000)) : 0
    return (
      <div className="app-shell">
        <AppHeader title="Schedule a Wash" subtitle="Book your next visit in seconds" />
        <div className="flex-1 px-6 flex flex-col items-center justify-center text-center">
          <p className="text-lg font-semibold text-brand-950">
            {isCadenceBlocked ? 'Not Yet Available' : 'No Washes Remaining'}
          </p>
          {isCadenceBlocked ? (
            <>
              <p className="text-6xl font-bold text-brand-600 mt-4">
                {daysRemaining}
                <span className="text-2xl font-semibold text-brand-400 ml-2">
                  {daysRemaining === 1 ? 'day' : 'days'}
                </span>
              </p>
              <p className="text-sm text-slate-500 mt-3 max-w-xs">
                until your next booking — available {formatDateLabel(toBusinessISODate(nextEligibleAt))}.
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-500 mt-2 max-w-xs">
              You've used all the washes in your current plan. Upgrade or wait for your plan to renew.
            </p>
          )}
          <button
            type="button"
            onClick={() => navigate('/subscription')}
            className="mt-6 rounded-2xl py-3 px-6 text-sm font-semibold text-white bg-brand-600 active:bg-brand-700 transition-colors"
          >
            View Subscription Plans
          </button>
        </div>
      </div>
    )
  }

  const bannerStats = []
  if (plan === 'monthly') bannerStats.push({ value: paidWashesRemaining, label: 'Washes Remaining' })
  if (plan === 'yearly') {
    bannerStats.push({ value: paidWashesRemaining, label: 'Paid Washes' })
    bannerStats.push({ value: freeWashesRemaining, label: 'Free Washes' })
  }
  if (plan === 'payg' && paygCreditJD > 0) {
    bannerStats.push({ value: `${paygCreditJD} JD`, label: 'Wash Credit' })
  }

  let washStatusLabel = 'Included in your subscription'
  if (plan === 'payg') washStatusLabel = `${paygWashPriceJD} JD`
  else if (washSource === 'free') washStatusLabel = 'Using a free wash — included'

  return (
    <div className="app-shell">
      <AppHeader title="Schedule a Wash" subtitle="Book your next visit in seconds" />

      <div className="flex-1 pb-4">
        {bannerStats.length > 0 && (
          <div className="mt-5">
            <WashesRemainingBanner stats={bannerStats} />
          </div>
        )}
        {plan === 'yearly' && (
          <FreeWashProgress
            total={PLANS.yearly.freeWashesIncluded}
            unlocked={freeWashesUnlocked}
            used={PLANS.yearly.freeWashesIncluded - freeWashesRemaining}
            paidWashesUntilNext={paidWashesUntilNextFreeUnlock}
          />
        )}
        <div className="mt-5">
          <DateStrip value={draft.date} onChange={setDate} />
        </div>
        <TimeChips value={draft.time} onChange={setTime} slots={slots} date={draft.date} />
        {previewBayNumber && (
          <div className="px-5 mt-3">
            <div className="flex items-center justify-between rounded-2xl bg-brand-50 border border-brand-100 px-4 py-2.5">
              <span className="text-sm font-semibold text-slate-700">Assigned Bay</span>
              <span className="text-sm font-bold text-brand-700">Bay {previewBayNumber}</span>
            </div>
          </div>
        )}
        <WashInfoCard statusLabel={washStatusLabel} />
        <WaxOption included={waxUnlockedFree} checked={draft.waxAdded} onToggle={toggleWax} />

        {creditApplied > 0 && (
          <div className="mx-5 mt-4 rounded-xl bg-brand-50 border border-brand-100 px-4 py-2.5 text-sm text-brand-700 font-medium">
            {creditApplied} JD credit applied
          </div>
        )}

        {error && (
          <div className="mx-5 mt-4 rounded-xl bg-red-50 border border-red-100 px-4 py-2.5 text-sm text-red-600">
            {error}
          </div>
        )}
      </div>

      <BottomBar
        total={totalPrice}
        disabled={!canConfirm}
        label={totalPrice > 0 ? `Pay ${totalPrice} JD` : 'Confirm'}
        onConfirm={handlePrimaryAction}
      />

      {showPayment && (
        <PaymentModal
          amount={totalPrice}
          description="Wash booking"
          onSuccess={handlePaymentSuccess}
          onCancel={() => setShowPayment(false)}
        />
      )}
    </div>
  )
}
