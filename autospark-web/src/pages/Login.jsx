import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'
import EyeIcon from '../components/EyeIcon'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [emailOrPhone, setEmailOrPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const canSubmit = emailOrPhone.trim().length > 0 && password.length > 0 && !submitting

  async function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return
    setError(null)
    setSubmitting(true)
    try {
      await login(emailOrPhone, password)
      navigate('/schedule')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-shell items-center px-8 py-12">
      <div className="flex-1 w-full flex flex-col items-center justify-center">
        <img src={logo} width={220} height={220} alt="AutoSpark" />
      </div>

      <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-5 pb-4">
        <div className="w-full bg-white rounded-3xl shadow-lg overflow-hidden">
          <input
            type="text"
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
            placeholder="Email or Mobile Number"
            autoComplete="username"
            className="auth-input"
          />
          <div className="h-px bg-slate-200 mx-5" />
          <div className="flex items-center">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="current-password"
              className="auth-input"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="pr-5 shrink-0"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <EyeIcon visible={showPassword} />
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/forgot-password')}
          className="text-sm text-white/90 font-medium -mt-1 active:opacity-70 transition-opacity"
        >
          Forgot password?
        </button>

        {error && <p className="text-sm text-red-200 font-semibold -mt-1">{error}</p>}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-full py-4 text-base font-bold text-white bg-gradient-to-b from-brand-400 to-brand-600 shadow-md disabled:opacity-60 active:opacity-90 transition-opacity"
        >
          {submitting ? 'Logging In…' : 'Log In'}
        </button>

        <div className="w-full flex items-center gap-3">
          <div className="flex-1 h-px bg-white/40" />
          <span className="text-sm text-white/80">Or</span>
          <div className="flex-1 h-px bg-white/40" />
        </div>

        <button
          type="button"
          onClick={() => navigate('/signup')}
          className="w-full rounded-full py-4 text-base font-bold text-brand-600 bg-white shadow-md active:bg-slate-50 transition-colors"
        >
          Sign up
        </button>

        <p className="text-xs text-white/80 text-center px-4 mt-1">
          By continuing you agree to our Terms of Service and Privacy Policy
        </p>
      </form>
    </div>
  )
}
