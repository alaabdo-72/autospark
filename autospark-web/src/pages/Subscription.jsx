import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import PaymentModal from '../components/PaymentModal'
import { PLANS } from '../mock/services'
import { useSubscription } from '../context/SubscriptionContext'

const PLAN_ORDER = ['payg', 'monthly', 'yearly']

const BENEFITS = ['Service discounts', 'Priority booking', 'Easy plan management']

function CheckIcon({ className }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={className}>
      <path d="M2 7.2 5.5 11 12 3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Subscription() {
  const navigate = useNavigate()
  const { subscribe } = useSubscription()
  const [selectedPlan, setSelectedPlan] = useState('payg')
  const [showPayment, setShowPayment] = useState(false)
  const [error, setError] = useState(null)

  async function handleChoosePlan() {
    setError(null)
    if (selectedPlan === 'payg') {
      try {
        await subscribe('payg')
        navigate('/schedule')
      } catch (err) {
        setError(err.message)
      }
    } else {
      setShowPayment(true)
    }
  }

  async function handlePaymentSuccess() {
    setError(null)
    try {
      await subscribe(selectedPlan)
      setShowPayment(false)
      navigate('/schedule')
    } catch (err) {
      setShowPayment(false)
      setError(err.message)
    }
  }

  const plan = PLANS[selectedPlan]

  return (
    <div className="auth-shell px-8 py-10">
      <div className="flex items-center justify-between">
        <Logo size={44} />
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="p-2 -mr-2 rounded-full active:bg-white/10 transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M18 6 6 18" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <h1 className="text-4xl font-extrabold text-white leading-[1.1] mt-4">
        Subscription
        <br />
        Plans
      </h1>

      <div className="flex flex-col gap-5 mt-8">
        {PLAN_ORDER.map((planId) => {
          const p = PLANS[planId]
          const isSelected = selectedPlan === planId
          return (
            <button
              key={planId}
              type="button"
              onClick={() => setSelectedPlan(planId)}
              className={`text-left bg-white rounded-3xl shadow-lg overflow-hidden transition-shadow ${
                isSelected ? 'ring-4 ring-brand-300' : ''
              }`}
            >
              <div className="inline-flex bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold px-6 py-2.5 rounded-r-full text-base">
                {p.label}
              </div>
              <div className="px-6 pt-4 pb-6">
                <p className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-brand-950">{p.priceLabel}</span>
                  <span className="text-sm font-semibold text-slate-500">{p.priceSuffix}</span>
                </p>
                <div className="flex items-center gap-3 mt-4">
                  <span className="w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center shrink-0">
                    <CheckIcon />
                  </span>
                  <span className="text-slate-800 font-semibold">{p.perk}</span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="flex flex-col gap-3 mt-8">
        {BENEFITS.map((benefit) => (
          <div key={benefit} className="flex items-center gap-3">
            <CheckIcon className="text-white shrink-0" />
            <span className="text-white font-semibold text-lg">{benefit}</span>
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-red-200 font-semibold mt-4 text-center">{error}</p>}

      <button
        type="button"
        onClick={handleChoosePlan}
        className="w-full mt-8 rounded-full py-4 text-base font-bold text-white bg-gradient-to-b from-brand-400 to-brand-600 shadow-md active:opacity-90 transition-opacity"
      >
        Choose Plan
      </button>

      {showPayment && (
        <PaymentModal
          amount={plan.price}
          description={`${plan.label} Subscription`}
          onSuccess={handlePaymentSuccess}
          onCancel={() => setShowPayment(false)}
        />
      )}
    </div>
  )
}
