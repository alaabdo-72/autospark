import { toLocalISODate, formatDateLabel } from '../lib/format'

function nextDays(count) {
  const days = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = 0; i < count; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    days.push(d)
  }
  return days
}

const LABELS = ['Today', 'Tomorrow']

export default function DateStrip({ value, onChange }) {
  const days = nextDays(2)

  return (
    <div className="px-5">
      <h2 className="text-sm font-semibold text-slate-700 mb-2">Date</h2>
      <div className="grid grid-cols-2 gap-2">
        {days.map((d, i) => {
          const iso = toLocalISODate(d)
          const isSelected = value === iso
          return (
            <button
              key={iso}
              type="button"
              onClick={() => onChange(iso)}
              className={`flex flex-col items-center justify-center py-3 rounded-2xl border transition-colors ${
                isSelected
                  ? 'bg-brand-600 border-brand-600 text-white'
                  : 'bg-white border-slate-200 text-slate-700 active:bg-slate-50'
              }`}
            >
              <span className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                {LABELS[i]}
              </span>
              <span className={`text-xs mt-0.5 ${isSelected ? 'text-brand-100' : 'text-slate-400'}`}>
                {formatDateLabel(iso)}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
