import { useEffect, useState } from 'react'
import AdminHeader from '../components/AdminHeader'
import { adminApiFetch, getAdminToken } from '../lib/adminApi'
import { API_URL } from '../lib/api'

const RANGE_OPTIONS = [
  { id: 'today', label: 'Today' },
  { id: '7d', label: '7 Days' },
  { id: '30d', label: '30 Days' },
  { id: 'custom', label: 'Custom' },
]

function StatCard({ value, label }) {
  return (
    <div className="rounded-2xl border border-slate-200 px-4 py-3 text-center">
      <p className="text-2xl font-bold text-brand-700">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  )
}

export default function AdminReports() {
  const [range, setRange] = useState('today')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [report, setReport] = useState(null)
  const [error, setError] = useState(null)
  const [exporting, setExporting] = useState(false)

  function buildQuery() {
    if (range === 'custom') {
      if (!customFrom || !customTo) return null
      return `range=custom&from=${customFrom}&to=${customTo}`
    }
    return `range=${range}`
  }

  useEffect(() => {
    const query = buildQuery()
    if (!query) return
    setError(null)
    adminApiFetch(`/admin/reports?${query}`)
      .then(setReport)
      .catch((err) => setError(err.message))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range, customFrom, customTo])

  async function handleExport() {
    const query = buildQuery()
    if (!query) return
    setError(null)
    setExporting(true)
    try {
      const res = await fetch(`${API_URL}/admin/reports/export?${query}`, {
        headers: { Authorization: `Bearer ${getAdminToken()}` },
      })
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `autospark-report-${report?.range?.from}_to_${report?.range?.to}.csv`
      link.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err.message)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="app-shell">
      <AdminHeader title="Reports" subtitle="Business overview" />

      <div className="flex-1 px-5 pb-6 flex flex-col gap-4">
        <div className="flex gap-2">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setRange(opt.id)}
              className={`flex-1 rounded-xl py-2 text-xs font-semibold transition-colors ${
                range === opt.id ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {range === 'custom' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">From</label>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">To</label>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-2.5 text-sm text-red-600">{error}</div>
        )}

        {!report ? (
          <p className="text-sm text-slate-400 text-center mt-8">
            {range === 'custom' ? 'Pick a date range above.' : 'Loading…'}
          </p>
        ) : (
          <>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Bookings</h2>
            <div className="grid grid-cols-2 gap-3">
              <StatCard value={report.bookings.total} label="Total Bookings" />
              <StatCard value={report.bookings.byStatus.cancelled} label="Cancelled" />
              <StatCard value={`${report.bookings.averageWaitMinutes} min`} label="Avg Wait" />
              <StatCard value={`${report.bookings.bayUtilizationPercent}%`} label="Bay Utilization" />
            </div>
            <div className="rounded-2xl border border-slate-200 px-4 py-3">
              <p className="text-xs font-semibold text-slate-500 mb-2">Busiest Time Slots</p>
              {report.bookings.busiestTimeSlots.length === 0 ? (
                <p className="text-sm text-slate-400">No bookings in this range.</p>
              ) : (
                report.bookings.busiestTimeSlots.map((slot) => (
                  <div key={slot.time} className="flex justify-between text-sm py-1">
                    <span className="text-slate-600">{slot.time}</span>
                    <span className="font-semibold text-slate-800">{slot.count} bookings</span>
                  </div>
                ))
              )}
            </div>

            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mt-2">Revenue</h2>
            <div className="grid grid-cols-3 gap-3">
              <StatCard value={`${report.revenue.total} JD`} label="Total" />
              <StatCard value={`${report.revenue.wash} JD`} label="Wash" />
              <StatCard value={`${report.revenue.wax} JD`} label="Wax" />
            </div>
            <div className="rounded-2xl border border-slate-200 px-4 py-3">
              <p className="text-xs font-semibold text-slate-500 mb-2">Top Customers</p>
              {report.revenue.topCustomers.length === 0 ? (
                <p className="text-sm text-slate-400">No revenue in this range.</p>
              ) : (
                report.revenue.topCustomers.map((c) => (
                  <div key={c.name} className="flex justify-between text-sm py-1">
                    <span className="text-slate-600">
                      {c.name} · {c.visits} visit{c.visits === 1 ? '' : 's'}
                    </span>
                    <span className="font-semibold text-slate-800">{c.spend} JD</span>
                  </div>
                ))
              )}
            </div>

            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mt-2">Subscriptions</h2>
            <div className="grid grid-cols-2 gap-3">
              <StatCard value={report.subscriptions.totalActive} label="Total Active" />
              <StatCard value={report.subscriptions.newInPeriod} label="New in Period" />
              <StatCard value={report.subscriptions.byPlan.payg} label="Pay As You Go" />
              <StatCard value={report.subscriptions.byPlan.monthly} label="Monthly" />
              <StatCard value={report.subscriptions.byPlan.yearly} label="Yearly" />
            </div>

            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
              className="rounded-2xl py-3 text-sm font-semibold text-white bg-brand-600 disabled:opacity-60 active:bg-brand-700 transition-colors mt-2"
            >
              {exporting ? 'Exporting…' : 'Export CSV'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
