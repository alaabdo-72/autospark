import { useEffect, useState } from 'react'
import AdminHeader from '../components/AdminHeader'
import { adminApiFetch } from '../lib/adminApi'

const PLAN_LABELS = {
  payg: 'Pay As You Go',
  monthly: 'Monthly',
  yearly: 'Yearly',
}

function Field({ label, ...props }) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-600 mb-1 block">{label}</label>
      <input {...props} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
    </div>
  )
}

function PlanCard({ plan, onSave }) {
  const [form, setForm] = useState(plan)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    setSuccess(null)
  }

  async function handleSave() {
    setError(null)
    setSuccess(null)
    setSaving(true)
    try {
      await onSave(plan.planId, {
        price: Number(form.price),
        washesIncluded: Number(form.washesIncluded),
        freeWashesIncluded: Number(form.freeWashesIncluded),
        freeWaxIncluded: Number(form.freeWaxIncluded),
        minDaysBetweenWashes: Number(form.minDaysBetweenWashes),
        freePerkUnlockAfterPaidWashes: Number(form.freePerkUnlockAfterPaidWashes),
      })
      setSuccess('Saved')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 px-4 py-4">
      <h2 className="text-sm font-bold text-brand-700 mb-3">{PLAN_LABELS[plan.planId]}</h2>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Price (JD)" type="number" min="0" step="0.5" value={form.price} onChange={(e) => update('price', e.target.value)} />
        <Field
          label="Min Days Between Washes"
          type="number"
          min="0"
          value={form.minDaysBetweenWashes}
          onChange={(e) => update('minDaysBetweenWashes', e.target.value)}
        />
        <Field
          label="Washes Included"
          type="number"
          min="0"
          value={form.washesIncluded}
          onChange={(e) => update('washesIncluded', e.target.value)}
        />
        {plan.planId === 'yearly' && (
          <>
            <Field
              label="Free Washes Included"
              type="number"
              min="0"
              value={form.freeWashesIncluded}
              onChange={(e) => update('freeWashesIncluded', e.target.value)}
            />
            <Field
              label="Free Wax Included"
              type="number"
              min="0"
              value={form.freeWaxIncluded}
              onChange={(e) => update('freeWaxIncluded', e.target.value)}
            />
            <Field
              label="Paid Washes per Free Unlock"
              type="number"
              min="0"
              value={form.freePerkUnlockAfterPaidWashes}
              onChange={(e) => update('freePerkUnlockAfterPaidWashes', e.target.value)}
            />
          </>
        )}
      </div>

      {error && <p className="text-xs text-red-600 mt-3">{error}</p>}
      {success && <p className="text-xs text-green-700 mt-3">{success}</p>}

      <button
        type="button"
        disabled={saving}
        onClick={handleSave}
        className="w-full mt-3 rounded-xl py-2.5 text-sm font-semibold text-white bg-brand-600 disabled:opacity-60 active:bg-brand-700 transition-colors"
      >
        {saving ? 'Saving…' : 'Save'}
      </button>
    </div>
  )
}

export default function AdminSubscriptionPlans() {
  const [plans, setPlans] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    adminApiFetch('/admin/plan-config')
      .then((data) => setPlans(data.plans))
      .catch((err) => setError(err.message))
  }, [])

  async function handleSave(planId, body) {
    const data = await adminApiFetch(`/admin/plan-config/${planId}`, { method: 'PATCH', body })
    setPlans((prev) => prev.map((p) => (p.planId === planId ? data.plan : p)))
  }

  return (
    <div className="app-shell">
      <AdminHeader title="Subscription Plans" subtitle="Pricing and quotas" />

      <div className="flex-1 px-5 pb-6 flex flex-col gap-3">
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-2.5 text-sm text-red-600">{error}</div>
        )}
        {!plans ? (
          <p className="text-sm text-slate-400 text-center mt-8">Loading…</p>
        ) : (
          plans.map((plan) => <PlanCard key={plan.planId} plan={plan} onSave={handleSave} />)
        )}
      </div>
    </div>
  )
}
