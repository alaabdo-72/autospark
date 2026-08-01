import { Link } from 'react-router-dom'

export default function ComingSoon({ label }) {
  return (
    <div className="app-shell items-center justify-center text-center px-8">
      <p className="text-sm text-slate-400 mb-2">Up next</p>
      <h1 className="text-xl font-semibold text-brand-950 mb-4">{label}</h1>
      <Link to="/schedule" className="text-sm font-semibold text-brand-600">
        Back to Schedule a Wash
      </Link>
    </div>
  )
}
