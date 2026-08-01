export const BASIC_WASH = {
  name: 'Basic Wash',
  exteriorMinutes: 7,
  interiorMinutes: 8,
  exteriorDescription: 'Exterior wash by machine',
  interiorDescription: 'Vacuuming & Interior Detailing',
}

export const WAX_PRICE_JD = 4
export const PAYG_WASH_PRICE_JD = 3.5

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

// A "paid wash" cooldown of 10 days applies to Monthly and Yearly's paid quota.
// Yearly's free washes/wax unlock after 3 paid washes, and each free wash
// additionally needs 3 days since the last PAID wash.
export const PLANS = {
  payg: {
    id: 'payg',
    label: 'Pay As You Go',
    priceLabel: `${PAYG_WASH_PRICE_JD} JD`,
    priceSuffix: '/ wash',
    perk: `${PAYG_WASH_PRICE_JD} JD for each wash`,
  },
  monthly: {
    id: 'monthly',
    label: 'Monthly',
    price: 9,
    priceLabel: '9 JD',
    priceSuffix: '/ 3 washes',
    perk: '3 washes for 9 JD',
    washesIncluded: 3,
    paidWashCooldownDays: 10,
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
    paidWashCooldownDays: 10,
    freePerkUnlockAfterPaidWashes: 3,
    freeWashCooldownAfterPaidDays: 3,
  },
}
