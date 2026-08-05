import { useNavigate } from 'react-router-dom'

export default function AdminHeader({ title, subtitle }) {
  const navigate = useNavigate()

  return (
    <header className="flex items-center gap-3 px-5 pt-6 pb-4">
      <button
        type="button"
        onClick={() => navigate('/admin')}
        aria-label="Back to dashboard"
        className="p-2 -ml-2 rounded-full active:bg-slate-100 transition-colors shrink-0"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M15 6l-6 6 6 6" stroke="#0a2e4f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div className="text-left">
        <h1 className="text-lg font-semibold text-brand-950 leading-tight">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 leading-tight">{subtitle}</p>}
      </div>
    </header>
  )
}
