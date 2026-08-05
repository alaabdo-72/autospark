export const WAX_PRICE_JD = 4
export const PAYG_WASH_PRICE_JD = 3.5
export const ACTIVE_BAYS = 3
export const CYCLE_MINUTES = 7
export const BUFFER_SECONDS = 75
export const POINTS_PER_WASH = 10
export const CHECK_IN_WINDOW_MINUTES = 3
export const CANCEL_CUTOFF_MINUTES = 60

export const PLAN_IDS = ['payg', 'monthly', 'yearly'] as const
export type PlanId = (typeof PLAN_IDS)[number]

export const PLANS: Record<
  PlanId,
  {
    price: number
    washesIncluded: number
    freeWashesIncluded: number
    freeWaxIncluded: number
    minDaysBetweenWashes: number
    freePerkUnlockAfterPaidWashes: number
  }
> = {
  payg: {
    price: 0,
    washesIncluded: 0,
    freeWashesIncluded: 0,
    freeWaxIncluded: 0,
    minDaysBetweenWashes: 3,
    freePerkUnlockAfterPaidWashes: 0,
  },
  monthly: {
    price: 9,
    washesIncluded: 3,
    freeWashesIncluded: 0,
    freeWaxIncluded: 0,
    minDaysBetweenWashes: 7,
    freePerkUnlockAfterPaidWashes: 0,
  },
  yearly: {
    price: 90,
    washesIncluded: 36,
    freeWashesIncluded: 4,
    freeWaxIncluded: 1,
    minDaysBetweenWashes: 7,
    freePerkUnlockAfterPaidWashes: 3,
  },
}

function generateTimeSlots(): string[] {
  const slots: string[] = []
  let hours = 8
  let minutes = 0
  while (hours < 21 || (hours === 21 && minutes <= 50)) {
    slots.push(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`)
    minutes += 10
    if (minutes >= 60) {
      minutes = 0
      hours += 1
    }
  }
  return slots
}

export const TIME_SLOTS = generateTimeSlots()

export const BASIC_WASH = {
  name: 'Basic Wash',
  exteriorMinutes: 7,
  interiorMinutes: 8,
}

export const WASH_DURATION_MINUTES = BASIC_WASH.exteriorMinutes + BASIC_WASH.interiorMinutes
