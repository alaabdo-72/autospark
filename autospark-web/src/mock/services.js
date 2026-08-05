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

// A minimum-7-day cooldown applies between any two washes (paid or free) on
// Monthly and Yearly. Yearly's free washes unlock one at a time, one per
// every 3 paid washes booked, up to freeWashesIncluded.
export const PLANS = {
  payg: {
    id: 'payg',
    label: 'Pay As You Go',
    // priceLabel/perk are overridden at render time with the live
    // service-config price — see Subscription.jsx's displayPlans.
    priceSuffix: '/ wash',
  },
  monthly: {
    id: 'monthly',
    label: 'Monthly',
    price: 9,
    priceLabel: '9 JD',
    priceSuffix: '/ 3 washes',
    perk: '3 washes for 9 JD',
    washesIncluded: 3,
    minDaysBetweenWashes: 7,
  },
  yearly: {
    id: 'yearly',
    label: 'Yearly',
    price: 90,
    priceLabel: '90 JD',
    priceSuffix: '/ year',
    perk: '36 washes + 4 free washes + 1 wax for 90 JD',
    washesIncluded: 36,
    freeWashesIncluded: 4,
    freeWaxIncluded: 1,
    minDaysBetweenWashes: 7,
    freePerkUnlockAfterPaidWashes: 3,
  },
}
