import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'
import { useAuth } from './AuthContext'

const SubscriptionContext = createContext(null)

export function SubscriptionProvider({ children }) {
  const { isAuthed } = useAuth()
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!isAuthed) {
      setSubscription(null)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const data = await apiFetch('/subscription')
      setSubscription(data.subscription)
    } finally {
      setLoading(false)
    }
  }, [isAuthed])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function subscribe(planId) {
    const data = await apiFetch('/subscription', { method: 'POST', body: { plan: planId } })
    setSubscription(data.subscription)
  }

  const hasActiveSubscription = Boolean(subscription)

  const value = {
    subscription,
    loading,
    plan: subscription?.plan ?? null,
    hasActiveSubscription,
    paidWashesRemaining: subscription?.paidWashesRemaining ?? 0,
    freeWashesRemaining: subscription?.freeWashesRemaining ?? 0,
    freeWaxRemaining: subscription?.freeWaxRemaining ?? 0,
    points: subscription?.points ?? 0,
    paygCreditJD: subscription?.paygCreditJD ?? 0,
    canBookPaid: subscription?.canBookPaid ?? false,
    canBookFree: subscription?.canBookFree ?? false,
    freeWashesUnlocked: subscription?.freeWashesUnlocked ?? 0,
    paidWashesUntilNextFreeUnlock: subscription?.paidWashesUntilNextFreeUnlock ?? 0,
    nextEligibleAt: subscription?.nextEligibleAt ? new Date(subscription.nextEligibleAt) : null,
    waxUnlockedFree: subscription?.waxUnlockedFree ?? false,
    subscribe,
    refresh,
  }

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext)
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider')
  return ctx
}
