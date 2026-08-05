import { businessNow, parseSlotDateTime } from './queue'

function toISO(d: Date) {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

// Bookings/reports are keyed by business-date strings (YYYY-MM-DD), so a
// plain string range comparison ("2026-08-01" <= date <= "2026-08-07") is
// enough — no need to parse into Date objects for filtering.
export function resolveReportRange(query: { range?: unknown; from?: unknown; to?: unknown }): { from: string; to: string } | null {
  const today = toISO(businessNow())

  if (query.range === 'custom') {
    const from = String(query.from ?? '')
    const to = String(query.to ?? '')
    if (!DATE_RE.test(from) || !DATE_RE.test(to) || from > to) return null
    return { from, to }
  }

  const days = query.range === '30d' ? 30 : query.range === '7d' ? 7 : 1
  const [y, m, d] = today.split('-').map(Number)
  const fromDate = new Date(Date.UTC(y, m - 1, d - (days - 1)))
  return { from: toISO(fromDate), to: today }
}

// Converts a business-date-string range into real instants, for comparing
// against timestamp fields like Subscription.createdAt.
export function businessDateRangeToInstants(from: string, to: string) {
  const start = parseSlotDateTime(from, '00:00')
  const [y, m, d] = to.split('-').map(Number)
  // Date.UTC normalizes an out-of-range day (e.g. day 32) into the correct
  // following month/year, so this handles month/year rollover correctly.
  const dayAfterTo = new Date(Date.UTC(y, m - 1, d + 1))
  const dayAfterToISO = toISO(dayAfterTo)
  const end = new Date(parseSlotDateTime(dayAfterToISO, '00:00').getTime() - 1)
  return { start, end }
}

export function daysBetween(from: string, to: string) {
  const [y1, m1, d1] = from.split('-').map(Number)
  const [y2, m2, d2] = to.split('-').map(Number)
  const a = Date.UTC(y1, m1 - 1, d1)
  const b = Date.UTC(y2, m2 - 1, d2)
  return Math.round((b - a) / 86400000) + 1
}
