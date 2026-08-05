export function toLocalISODate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const BUSINESS_UTC_OFFSET_HOURS = 3

// The wash is a fixed physical location in Jordan (Asia/Amman, UTC+3) — its
// "today" and its slot times always mean Jordan wall-clock time, regardless
// of what timezone the visitor's own device happens to be set to. Deriving
// "today" from the device's local clock (as toLocalISODate + `new Date()`
// does) lets a device in a different timezone pick the wrong calendar day
// for a booking, so date-picking and past-slot filtering use this instead.
export function businessNow() {
  return new Date(Date.now() + BUSINESS_UTC_OFFSET_HOURS * 3600000)
}

export function toBusinessISODate(date) {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatDateLabel(isoDate) {
  if (!isoDate) return ''
  const [year, month, day] = isoDate.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

export function formatClockTime(isoTimestamp) {
  return new Date(isoTimestamp).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}
