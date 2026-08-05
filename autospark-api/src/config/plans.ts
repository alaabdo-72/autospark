export const CYCLE_MINUTES = 7
export const BUFFER_SECONDS = 75
export const POINTS_PER_WASH = 10
export const CHECK_IN_WINDOW_MINUTES = 3
export const CANCEL_CUTOFF_MINUTES = 60

export const PLAN_IDS = ['payg', 'monthly', 'yearly'] as const
export type PlanId = (typeof PLAN_IDS)[number]

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
