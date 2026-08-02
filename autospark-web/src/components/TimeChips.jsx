import { TIME_CHIPS } from '../mock/services'
import { toLocalISODate } from '../lib/format'

export default function TimeChips({ value, onChange, slots, date }) {
  const fullTimes = new Set(slots.filter((s) => s.isFull).map((s) => s.time))
  const isToday = date === toLocalISODate(new Date())
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes()

  return (
    <div className="px-5 mt-5">
      <h2 className="text-sm font-semibold text-slate-700 mb-2">Time</h2>
      <div className="grid grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1 -mr-1">
        {TIME_CHIPS.map((time) => {
          const isSelected = value === time
          const [h, m] = time.split(':').map(Number)
          const isPast = isToday && h * 60 + m < nowMinutes
          const isUnavailable = fullTimes.has(time) || isPast
          return (
            <button
              key={time}
              type="button"
              disabled={isUnavailable}
              onClick={() => onChange(time)}
              className={`py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                isSelected
                  ? 'bg-brand-600 border-brand-600 text-white'
                  : isUnavailable
                    ? 'bg-slate-50 border-slate-100 text-slate-300 line-through cursor-not-allowed'
                    : 'bg-white border-slate-200 text-slate-700 active:bg-slate-50'
              }`}
            >
              {time}
            </button>
          )
        })}
      </div>
    </div>
  )
}
