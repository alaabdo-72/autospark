import { createContext, useContext, useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'
import { useAuth } from './AuthContext'

// Fallbacks match the backend's SubscriptionPlanConfig bootstrap defaults,
// so the UI still looks right for the brief moment before the live config
// loads.
const DEFAULTS = {
  payg: { price: 0, washesIncluded: 0, freeWashesIncluded: 0, freeWaxIncluded: 0, minDaysBetweenWashes: 3, freePerkUnlockAfterPaidWashes: 0 },
  monthly: { price: 9, washesIncluded: 3, freeWashesIncluded: 0, freeWaxIncluded: 0, minDaysBetweenWashes: 7, freePerkUnlockAfterPaidWashes: 0 },
  yearly: { price: 90, washesIncluded: 36, freeWashesIncluded: 4, freeWaxIncluded: 1, minDaysBetweenWashes: 7, freePerkUnlockAfterPaidWashes: 3 },
}

const PlanConfigContext = createContext(null)

export function PlanConfigProvider({ children }) {
  const { isAuthed } = useAuth()
  const [configs, setConfigs] = useState(DEFAULTS)

  useEffect(() => {
    if (!isAuthed) return
    apiFetch('/plan-config').then(setConfigs)
  }, [isAuthed])

  return <PlanConfigContext.Provider value={configs}>{children}</PlanConfigContext.Provider>
}

export function usePlanConfig() {
  const ctx = useContext(PlanConfigContext)
  if (!ctx) throw new Error('usePlanConfig must be used within PlanConfigProvider')
  return ctx
}
