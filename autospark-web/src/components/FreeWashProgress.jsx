function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 7.2 5.5 11 12 3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function DropIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M7 1.5C7 1.5 2.5 6.4 2.5 9.2A4.5 4.5 0 0 0 7 13.7a4.5 4.5 0 0 0 4.5-4.5C11.5 6.4 7 1.5 7 1.5Z"
        fill="currentColor"
      />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="3" y="6.5" width="8" height="6" rx="1.3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4.7 6.5V4.6a2.3 2.3 0 0 1 4.6 0v1.9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export default function FreeWashProgress({ total, unlocked, used, paidWashesUntilNext }) {
  const hasAvailable = unlocked > used
  const allUsed = used >= total

  let message = `Book ${paidWashesUntilNext} more paid wash${paidWashesUntilNext === 1 ? '' : 'es'} to unlock your next free wash.`
  if (allUsed) message = "You've used all your free washes."
  else if (hasAvailable) message = 'A free wash is unlocked — it will be used for your next booking.'

  return (
    <div className="px-5 mt-5">
      <h2 className="text-sm font-semibold text-slate-700 mb-2">Free Washes</h2>
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5">
        <div className="flex items-center gap-3">
          {Array.from({ length: total }).map((_, i) => {
            const isUsed = i < used
            const isAvailable = !isUsed && i < unlocked
            return (
              <span
                key={i}
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  isUsed
                    ? 'bg-slate-100 text-slate-400'
                    : isAvailable
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-100 text-slate-300'
                }`}
              >
                {isUsed ? <CheckIcon /> : isAvailable ? <DropIcon /> : <LockIcon />}
              </span>
            )
          })}
        </div>
        <p className="text-xs text-slate-500 mt-3">{message}</p>
      </div>
    </div>
  )
}
