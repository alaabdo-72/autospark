import { useState } from 'react'
import Logo from './Logo'
import SideMenu from './SideMenu'

export default function AppHeader({ title, subtitle }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <header className="w-full flex items-center justify-between gap-3 px-5 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <Logo size={72} />
          <div className="text-left">
            <h1 className="text-lg font-semibold text-brand-950 leading-tight">{title}</h1>
            {subtitle && <p className="text-sm text-slate-500 leading-tight">{subtitle}</p>}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          className="p-2 -mr-2 shrink-0 rounded-full active:bg-slate-100 transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="#0a2e4f" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
