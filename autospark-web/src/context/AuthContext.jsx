import { createContext, useContext, useState } from 'react'
import { apiFetch, getToken, setToken } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthed, setIsAuthed] = useState(Boolean(getToken()))

  async function register(name, emailOrPhone, password) {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: { name, emailOrPhone, password },
      auth: false,
    })
    setToken(data.token)
    setUser(data.user)
    setIsAuthed(true)
  }

  async function login(emailOrPhone, password) {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: { emailOrPhone, password },
      auth: false,
    })
    setToken(data.token)
    setUser(data.user)
    setIsAuthed(true)
  }

  function logout() {
    setToken(null)
    setUser(null)
    setIsAuthed(false)
  }

  const value = { user, isAuthed, register, login, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
