import { PLANS, PlanId } from '../config/plans'

export interface SubscriptionLike {
  plan: string
  paidWashesRemaining: number
  paidWashesUsed: number
  freeWashesRemaining: number
  freeWaxRemaining: number
  lastWashDate: Date | null
}

function daysSince(date: Date | null, now: number) {
  if (!date) return Infinity
  return (now - date.getTime()) / (1000 * 60 * 60 * 24)
}

export function evaluateEligibility(sub: SubscriptionLike, now = Date.now()) {
  const plan = sub.plan as PlanId
  const config = PLANS[plan]

  let canBookPaid = false
  let canBookFree = false
  let nextEligibleAt: Date | null = null

  // A single cooldown applies between any two washes (paid or free) —
  // there's no separate timer per wash type.
  const cooldownOk = daysSince(sub.lastWashDate, now) >= config.minDaysBetweenWashes

  // One free wash unlocks for every `freePerkUnlockAfterPaidWashes` paid
  // washes booked, up to the plan's total free-wash allotment — repeating,
  // not a one-time threshold.
  const freeWashesUnlocked =
    config.freePerkUnlockAfterPaidWashes > 0
      ? Math.min(
          Math.floor(sub.paidWashesUsed / config.freePerkUnlockAfterPaidWashes),
          config.freeWashesIncluded,
        )
      : 0
  const freeWashesUsed = config.freeWashesIncluded - sub.freeWashesRemaining
  const freeWashAvailable = freeWashesUnlocked > freeWashesUsed
  const paidWashesUntilNextFreeUnlock =
    plan === 'yearly' && freeWashesUnlocked < config.freeWashesIncluded
      ? config.freePerkUnlockAfterPaidWashes - (sub.paidWashesUsed % config.freePerkUnlockAfterPaidWashes)
      : 0

  if (plan === 'payg') {
    canBookPaid = true
  } else if (plan === 'monthly') {
    canBookPaid = sub.paidWashesRemaining > 0 && cooldownOk
  } else if (plan === 'yearly') {
    canBookPaid = sub.paidWashesRemaining > 0 && cooldownOk
    canBookFree = freeWashAvailable && sub.freeWashesRemaining > 0 && cooldownOk
  }

  const hasBookableQuota = sub.paidWashesRemaining > 0 || freeWashAvailable
  if (!cooldownOk && sub.lastWashDate && hasBookableQuota) {
    nextEligibleAt = new Date(sub.lastWashDate.getTime() + config.minDaysBetweenWashes * 86400000)
  }

  const waxUnlockedFree =
    plan === 'yearly' && sub.freeWaxRemaining > 0 && sub.paidWashesUsed >= config.freePerkUnlockAfterPaidWashes

  return { canBookPaid, canBookFree, nextEligibleAt, waxUnlockedFree, freeWashesUnlocked, paidWashesUntilNextFreeUnlock }
}

export function resolveWashSource(plan: PlanId, canBookPaid: boolean, canBookFree: boolean): 'payg' | 'paid' | 'free' | null {
  if (plan === 'payg') return 'payg'
  if (plan === 'yearly') return canBookFree ? 'free' : canBookPaid ? 'paid' : null
  if (plan === 'monthly') return canBookPaid ? 'paid' : null
  return null
}
