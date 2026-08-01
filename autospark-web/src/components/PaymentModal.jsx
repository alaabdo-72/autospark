import { useState } from 'react'

function formatCardNumber(value) {
  const digits = value.replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

export default function PaymentModal({ amount, description, onSuccess, onCancel }) {
  const [name, setName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [processing, setProcessing] = useState(false)

  const canPay =
    name.trim().length > 0 && cardNumber.trim().length > 0 && expiry.trim().length > 0 && cvv.trim().length > 0

  function handleSubmit(e) {
    e.preventDefault()
    if (!canPay || processing) return
    setProcessing(true)
    setTimeout(() => {
      onSuccess()
    }, 700)
  }

  return (
    <div className="absolute inset-0 z-50 bg-white flex flex-col px-6 py-8 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-brand-950">Payment</h1>
        <button type="button" onClick={onCancel} aria-label="Close" className="p-1 -mr-1">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M18 6 6 18" stroke="#0a2e4f" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="mt-6 rounded-2xl bg-brand-50 border border-brand-100 px-5 py-4">
        <p className="text-sm text-slate-500">{description}</p>
        <p className="text-3xl font-bold text-brand-950 mt-1">{amount} JD</p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col mt-6">
        <div className="w-full bg-white rounded-3xl border border-slate-200 overflow-hidden">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Cardholder Name"
            autoComplete="cc-name"
            className="auth-input"
          />
          <div className="h-px bg-slate-200 mx-5" />
          <input
            type="text"
            inputMode="numeric"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            placeholder="Card Number"
            autoComplete="cc-number"
            className="auth-input"
          />
          <div className="h-px bg-slate-200 mx-5" />
          <div className="flex">
            <input
              type="text"
              inputMode="numeric"
              value={expiry}
              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              placeholder="MM/YY"
              autoComplete="cc-exp"
              className="auth-input"
            />
            <div className="w-px bg-slate-200 my-2" />
            <input
              type="text"
              inputMode="numeric"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="CVV"
              autoComplete="cc-csc"
              className="auth-input"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!canPay || processing}
          className="w-full mt-auto rounded-full py-4 text-base font-bold text-white bg-gradient-to-b from-brand-400 to-brand-600 shadow-md disabled:opacity-60 active:opacity-90 transition-opacity"
        >
          {processing ? 'Processing…' : `Pay ${amount} JD`}
        </button>
      </form>
    </div>
  )
}
