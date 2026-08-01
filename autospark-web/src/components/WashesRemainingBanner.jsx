export default function WashesRemainingBanner({ stats }) {
  return (
    <div className="mx-5 rounded-2xl bg-brand-950 px-5 py-4 flex divide-x divide-white/15">
      {stats.map(({ value, label }) => (
        <div key={label} className="flex-1 text-center px-2">
          <p className="text-3xl font-bold text-white">{value}</p>
          <p className="text-xs text-brand-200 mt-0.5">{label}</p>
        </div>
      ))}
    </div>
  )
}
