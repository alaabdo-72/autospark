import { createContext, useContext, useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'
import { useAuth } from './AuthContext'

// Fallbacks match the backend's ServiceConfig schema defaults, so the UI
// still looks right for the brief moment before the live config loads.
const DEFAULTS = {
  washName: 'Basic Wash',
  exteriorMinutes: 7,
  interiorMinutes: 8,
  paygWashPriceJD: 3.5,
  waxName: 'Wax',
  waxPriceJD: 4,
}

const ServiceConfigContext = createContext(null)

export function ServiceConfigProvider({ children }) {
  const { isAuthed } = useAuth()
  const [config, setConfig] = useState(DEFAULTS)

  useEffect(() => {
    if (!isAuthed) return
    apiFetch('/service-config').then(setConfig)
  }, [isAuthed])

  return <ServiceConfigContext.Provider value={config}>{children}</ServiceConfigContext.Provider>
}

export function useServiceConfig() {
  const ctx = useContext(ServiceConfigContext)
  if (!ctx) throw new Error('useServiceConfig must be used within ServiceConfigProvider')
  return ctx
}
