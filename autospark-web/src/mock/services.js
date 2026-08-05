function generateTimeSlots() {
  const slots = []
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

export const TIME_CHIPS = generateTimeSlots()

// Just the static marketing labels — price, perk text, and quotas all come
// from the live plan config (admin-editable) instead. See Subscription.jsx's
// displayPlans.
export const PLANS = {
  payg: {
    id: 'payg',
    label: 'Pay As You Go',
    priceSuffix: '/ wash',
  },
  monthly: {
    id: 'monthly',
    label: 'Monthly',
  },
  yearly: {
    id: 'yearly',
    label: 'Yearly',
    priceSuffix: '/ year',
  },
}
