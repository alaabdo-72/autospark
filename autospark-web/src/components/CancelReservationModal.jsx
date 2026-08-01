import logo from '../assets/logo.png'

function CancelIllustration() {
  return (
    <svg width="180" height="180" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="10" y="10" width="180" height="180" rx="40" fill="#0a2e4f" />

      <circle cx="70" cy="58" r="5" fill="#2fbcff" opacity="0.9" />
      <circle cx="132" cy="52" r="3.5" fill="#2fbcff" opacity="0.8" />
      <circle cx="102" cy="42" r="4.5" fill="#2fbcff" opacity="0.85" />
      <circle cx="150" cy="72" r="3" fill="#2fbcff" opacity="0.7" />
      <circle cx="54" cy="78" r="3" fill="#2fbcff" opacity="0.7" />

      <path
        d="M40 122 C40 102 55 97 70 94 L80 80 C84 76 90 74 96 74 L104 74 C110 74 116 76 120 80 L130 94 C145 97 160 102 160 122 L160 130 C160 136 155 140 149 140 L139 140 C139 147 133 153 126 153 C119 153 113 147 113 140 L87 140 C87 147 81 153 74 153 C67 153 61 147 61 140 L51 140 C45 140 40 136 40 130 Z"
        fill="#2fbcff"
      />
      <ellipse cx="58" cy="114" rx="8" ry="5.5" fill="white" opacity="0.9" />
      <circle cx="74" cy="140" r="11" fill="#0a2e4f" />
      <circle cx="126" cy="140" r="11" fill="#0a2e4f" />

      <g stroke="white" strokeWidth="20" strokeLinecap="round">
        <line x1="66" y1="82" x2="134" y2="150" />
        <line x1="134" y1="82" x2="66" y2="150" />
      </g>
    </svg>
  )
}

export default function CancelReservationModal({ onKeep, onConfirmCancel }) {
  return (
    <div className="absolute inset-0 z-50 bg-white flex flex-col items-center px-8 py-10 text-center overflow-y-auto">
      <img src={logo} width={90} height={90} alt="AutoSpark" />

      <h1 className="text-2xl font-extrabold text-brand-950 mt-4">Cancel Reservation</h1>
      <p className="text-slate-500 mt-3 max-w-xs">
        Are you sure you want to cancel your car wash reservation?
      </p>

      <div className="my-8">
        <CancelIllustration />
      </div>

      <p className="text-sm text-slate-500 max-w-xs">
        Once canceled, you can reschedule your wash or request a refund if applicable.
      </p>

      <div className="w-full mt-auto pt-8 flex gap-3">
        <button
          type="button"
          onClick={onKeep}
          className="flex-1 rounded-full py-3.5 text-base font-bold text-brand-950 border-2 border-brand-950 active:bg-slate-50 transition-colors"
        >
          No
        </button>
        <button
          type="button"
          onClick={onConfirmCancel}
          className="flex-1 rounded-full py-3.5 text-base font-bold text-white bg-brand-950 active:bg-brand-900 transition-colors"
        >
          Yes, Cancel
        </button>
      </div>
    </div>
  )
}
