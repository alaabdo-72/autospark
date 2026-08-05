import { useServiceConfig } from '../context/ServiceConfigContext'

export default function WaxOption({ included, checked, onToggle }) {
  const { waxName, waxPriceJD } = useServiceConfig()

  return (
    <div className="px-5 mt-5">
      <h2 className="text-sm font-semibold text-slate-700 mb-2">Wax</h2>
      <button
        type="button"
        onClick={onToggle}
        className={`w-full flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors ${
          checked ? 'bg-brand-50 border-brand-500' : 'bg-white border-slate-200 active:bg-slate-50'
        }`}
      >
        <div className="flex items-center gap-3">
          <span
            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${
              checked ? 'border-brand-600 bg-brand-600' : 'border-slate-300'
            }`}
          >
            {checked && (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6.5 5 9.5 10 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-800">Add {waxName}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {included ? 'Included in your plan' : 'Not included in your plan'}
            </p>
          </div>
        </div>
        <span className="text-sm font-semibold text-brand-700 shrink-0 pl-2">
          {included ? 'Free' : `+${waxPriceJD} JD`}
        </span>
      </button>
    </div>
  )
}
