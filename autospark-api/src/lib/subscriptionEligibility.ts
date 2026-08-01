import { PLANS, PlanId } from '../config/plans'

export interface SubscriptionLike {
  plan: string
  paidWashesRemaining: number
  paidWashesUsed: number
  freeWashesRemaining: number
  freeWaxRemaining: number
  lastPaidWashDate: Date | null
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

  if (plan === 'payg') {
    canBookPaid = true
  } else if (plan === 'monthly') {
    const cooldownOk = daysSince(sub.lastPaidWashDate, now) >= config.paidWashCooldownDays
    canBookPaid = sub.paidWashesRemaining > 0 && cooldownOk
    if (sub.paidWashesRemaining > 0 && !cooldownOk && sub.lastPaidWashDate) {
      nextEligibleAt = new Date(sub.lastPaidWashDate.getTime() + config.paidWashCooldownDays * 86400000)
    }
  } else if (plan === 'yearly') {
    const paidCooldownOk = daysSince(sub.lastPaidWashDate, now) >= config.paidWashCooldownDays
    canBookPaid = sub.paidWashesRemaining > 0 && paidCooldownOk

    const freeUnlocked = sub.paidWashesUsed >= config.freePerkUnlockAfterPaidWashes
    const freeCooldownOk = daysSince(sub.lastPaidWashDate, now) >= config.freeWashCooldownAfterPaidDays
    canBookFree = freeUnlocked && sub.freeWashesRemaining > 0 && freeCooldownOk

    if (sub.paidWashesRemaining > 0 && !paidCooldownOk && sub.lastPaidWashDate) {
      nextEligibleAt = new Date(sub.lastPaidWashDate.getTime() + config.paidWashCooldownDays * 86400000)
    }
  }

  const waxUnlockedFree =
    plan === 'yearly' && sub.freeWaxRemaining > 0 && sub.paidWashesUsed >= config.freePerkUnlockAfterPaidWashes

  return { canBookPaid, canBookFree, nextEligibleAt, waxUnlockedFree }
}

export function resolveWashSource(plan: PlanId, canBookPaid: boolean, canBookFree: boolean): 'payg' | 'paid' | 'free' | null {
  if (plan === 'payg') return 'payg'
  if (plan === 'yearly') return canBookFree ? 'free' : canBookPaid ? 'paid' : null
  if (plan === 'monthly') return canBookPaid ? 'paid' : null
  return null
}
