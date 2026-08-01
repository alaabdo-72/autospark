import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'
import EyeIcon from '../components/EyeIcon'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [emailOrPhone, setEmailOrPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const passwordsMatch = password.length > 0 && password === confirmPassword
  const canSubmit = name.trim().length > 0 && emailOrPhone.trim().length > 0 && passwordsMatch && !submitting

  async function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return
    setError(null)
    setSubmitting(true)
    try {
      await register(name, emailOrPhone, password)
      navigate('/schedule')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-shell items-center px-8 py-10">
      <div className="w-full flex flex-col items-center pt-2 pb-4">
        <img src={logo} width={130} height={130} alt="AutoSpark" />
      </div>

      <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-5 pb-4">
        <div className="w-full bg-white rounded-3xl shadow-lg overflow-hidden">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name"
            autoComplete="name"
            className="auth-input"
          />
          <div className="h-px bg-slate-200 mx-5" />
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
              autoComplete="new-password"
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
          <div className="h-px bg-slate-200 mx-5" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            autoComplete="new-password"
            className="auth-input"
          />
        </div>

        {password.length > 0 && confirmPassword.length > 0 && !passwordsMatch && (
          <p className="text-xs text-red-200 font-semibold -mt-2 w-full text-center">Passwords don't match</p>
        )}
        {error && <p className="text-xs text-red-200 font-semibold -mt-2 w-full text-center">{error}</p>}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-full py-4 text-base font-bold text-white bg-gradient-to-b from-brand-400 to-brand-600 shadow-md disabled:opacity-60 active:opacity-90 transition-opacity"
        >
          {submitting ? 'Signing Up…' : 'Sign Up'}
        </button>

        <div className="w-full flex items-center gap-3">
          <div className="flex-1 h-px bg-white/40" />
          <span className="text-sm text-white/80">Or</span>
          <div className="flex-1 h-px bg-white/40" />
        </div>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="w-full rounded-full py-4 text-base font-bold text-brand-600 bg-white shadow-md active:bg-slate-50 transition-colors"
        >
          Log In
        </button>

        <p className="text-xs text-white/80 text-center px-4 mt-1">
          By continuing you agree to our Terms of Service and Privacy Policy
        </p>
      </form>
    </div>
  )
}
