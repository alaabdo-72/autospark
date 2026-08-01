import { BASIC_WASH } from '../mock/services'

export default function WashInfoCard({ statusLabel }) {
  return (
    <div className="px-5 mt-5">
      <h2 className="text-sm font-semibold text-slate-700 mb-2">Your Wash</h2>
      <div className="rounded-2xl border border-brand-500 bg-brand-50 px-4 py-3">
        <p className="text-sm font-semibold text-slate-800">{BASIC_WASH.name}</p>
        <div className="flex justify-between text-xs text-slate-500 mt-2">
          <span>{BASIC_WASH.exteriorDescription}</span>
          <span>{BASIC_WASH.exteriorMinutes} min</span>
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>{BASIC_WASH.interiorDescription}</span>
          <span>{BASIC_WASH.interiorMinutes} min</span>
        </div>
        <p className="text-xs font-semibold text-brand-600 mt-2">{statusLabel}</p>
      </div>
    </div>
  )
}
