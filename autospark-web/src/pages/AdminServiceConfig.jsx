import { useEffect, useState } from 'react'
import AdminHeader from '../components/AdminHeader'
import { adminApiFetch } from '../lib/adminApi'

function Field({ label, ...props }) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700 mb-1 block">{label}</label>
      <input {...props} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
    </div>
  )
}

export default function AdminServiceConfig() {
  const [form, setForm] = useState(null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    adminApiFetch('/admin/service-config').then((data) => setForm(data.serviceConfig))
  }, [])

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    setSuccess(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setSaving(true)
    try {
      const data = await adminApiFetch('/admin/service-config', {
        method: 'PATCH',
        body: {
          washName: form.washName,
          exteriorMinutes: Number(form.exteriorMinutes),
          interiorMinutes: Number(form.interiorMinutes),
          paygWashPriceJD: Number(form.paygWashPriceJD),
          waxName: form.waxName,
          waxPriceJD: Number(form.waxPriceJD),
        },
      })
      setForm(data.serviceConfig)
      setSuccess('Saved')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!form) {
    return (
      <div className="app-shell">
        <AdminHeader title="Service & Pricing" subtitle="Wash package and extras" />
        <p className="text-sm text-slate-400 text-center mt-8">Loading…</p>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <AdminHeader title="Service & Pricing" subtitle="Wash package and extras" />

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col pb-6">
        <div className="px-5 flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mt-2">Wash Package</h2>
          <Field label="Name" type="text" value={form.washName} onChange={(e) => update('washName', e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Exterior (min)"
              type="number"
              min="1"
              value={form.exteriorMinutes}
              onChange={(e) => update('exteriorMinutes', e.target.value)}
            />
            <Field
              label="Interior (min)"
              type="number"
              min="1"
              value={form.interiorMinutes}
              onChange={(e) => update('interiorMinutes', e.target.value)}
            />
          </div>
          <Field
            label="Pay-As-You-Go Price (JD)"
            type="number"
            min="0"
            step="0.1"
            value={form.paygWashPriceJD}
            onChange={(e) => update('paygWashPriceJD', e.target.value)}
          />

          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mt-4">Extra</h2>
          <Field label="Name" type="text" value={form.waxName} onChange={(e) => update('waxName', e.target.value)} />
          <Field
            label="Price (JD)"
            type="number"
            min="0"
            step="0.1"
            value={form.waxPriceJD}
            onChange={(e) => update('waxPriceJD', e.target.value)}
          />
        </div>

        {error && (
          <div className="mx-5 mt-4 rounded-xl bg-red-50 border border-red-100 px-4 py-2.5 text-sm text-red-600">{error}</div>
        )}
        {success && (
          <div className="mx-5 mt-4 rounded-xl bg-green-50 border border-green-100 px-4 py-2.5 text-sm text-green-700">
            {success}
          </div>
        )}

        <div className="px-5 pt-4 mt-auto">
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-2xl py-3 text-sm font-semibold text-white bg-brand-600 disabled:opacity-60 active:bg-brand-700 transition-colors"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
