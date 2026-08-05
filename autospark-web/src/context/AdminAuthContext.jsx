import { createContext, useContext, useState } from 'react'
import { adminApiFetch, getAdminToken, setAdminToken } from '../lib/adminApi'

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [isAuthed, setIsAuthed] = useState(Boolean(getAdminToken()))

  async function login(emailOrPhone, password) {
    const data = await adminApiFetch('/admin/auth/login', {
      method: 'POST',
      body: { emailOrPhone, password },
      auth: false,
    })
    setAdminToken(data.token)
    setAdmin(data.admin)
    setIsAuthed(true)
  }

  function logout() {
    setAdminToken(null)
    setAdmin(null)
    setIsAuthed(false)
  }

  const value = { admin, isAuthed, login, logout }

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider')
  return ctx
}
