import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [emailOrPhone, setEmailOrPhone] = useState('')
  const [sent, setSent] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (!emailOrPhone.trim()) return
    setSent(true)
  }

  if (sent) {
    return (
      <div className="auth-shell items-center justify-center px-8 py-12 text-center">
        <div className="w-20 h-20 rounded-full bg-white/15 flex items-center justify-center">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <path d="M4 12.5 9.5 18 20 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="text-2xl font-extrabold text-white mt-5">Check Your Inbox</h1>
        <p className="text-white/80 mt-3 max-w-xs">
          If an account exists for <span className="font-semibold text-white">{emailOrPhone}</span>, we've sent a
          link to reset your password.
        </p>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="w-full max-w-xs mt-10 rounded-full py-4 text-base font-bold text-brand-600 bg-white shadow-md active:bg-slate-50 transition-colors"
        >
          Back to Log In
        </button>
      </div>
    )
  }

  return (
    <div className="auth-shell items-center px-8 py-12">
      <div className="w-full flex flex-col items-center pt-4 pb-6">
        <img src={logo} width={110} height={110} alt="AutoSpark" />
      </div>

      <h1 className="text-2xl font-extrabold text-white text-center">Forgot Password?</h1>
      <p className="text-white/80 text-center mt-2 mb-6 max-w-xs mx-auto">
        Enter the email or mobile number linked to your account and we'll send you a reset link.
      </p>

      <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-5">
        <div className="w-full bg-white rounded-3xl shadow-lg overflow-hidden">
          <input
            type="text"
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
            placeholder="Email or Mobile Number"
            autoComplete="username"
            className="auth-input"
          />
        </div>

        <button
          type="submit"
          disabled={!emailOrPhone.trim()}
          className="w-full rounded-full py-4 text-base font-bold text-white bg-gradient-to-b from-brand-400 to-brand-600 shadow-md disabled:opacity-60 active:opacity-90 transition-opacity"
        >
          Send Reset Link
        </button>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-sm text-white/90 font-medium active:opacity-70 transition-opacity"
        >
          Back to Log In
        </button>
      </form>
    </div>
  )
}
