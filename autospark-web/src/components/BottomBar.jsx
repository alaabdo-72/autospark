export default function BottomBar({ total, disabled, label = 'Confirm', onConfirm }) {
  return (
    <div className="sticky bottom-0 bg-white border-t border-slate-100 px-5 py-4 flex items-center justify-between gap-4">
      <div>
        <p className="text-xs text-slate-400">Total</p>
        <p className="text-lg font-bold text-brand-950">{total} JD</p>
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={onConfirm}
        className="flex-1 max-w-[220px] rounded-2xl py-3 text-sm font-semibold text-white bg-brand-600 disabled:bg-slate-300 disabled:text-slate-500 active:bg-brand-700 transition-colors"
      >
        {label}
      </button>
    </div>
  )
}
