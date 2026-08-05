import { useCallback, useEffect, useState } from 'react'
import AdminHeader from '../components/AdminHeader'
import { adminApiFetch } from '../lib/adminApi'

const STATUS_STYLES = {
  idle: { label: 'Idle', badge: 'bg-slate-100 text-slate-500' },
  washing: { label: 'Washing', badge: 'bg-brand-100 text-brand-700' },
  manual_service: { label: 'Manual Service', badge: 'bg-amber-100 text-amber-700' },
}

export default function AdminBayBoard() {
  const [bays, setBays] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busyId, setBusyId] = useState(null)

  const load = useCallback(async () => {
    try {
      const data = await adminApiFetch('/admin/bays')
      setBays(data.bays)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, 10000)
    return () => clearInterval(id)
  }, [load])

  async function handleAddBay() {
    setError(null)
    try {
      await adminApiFetch('/admin/bays', { method: 'POST' })
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleToggle(bay) {
    setError(null)
    setBusyId(bay.id)
    try {
      await adminApiFetch(`/admin/bays/${bay.id}`, { method: 'PATCH', body: { isActive: !bay.isActive } })
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  async function handleRemove(bay) {
    setError(null)
    setBusyId(bay.id)
    try {
      await adminApiFetch(`/admin/bays/${bay.id}`, { method: 'DELETE' })
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="app-shell">
      <AdminHeader title="Bay Board" subtitle="Live status of every bay" />

      <div className="flex-1 px-5 pb-6 flex flex-col gap-3">
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-2.5 text-sm text-red-600">{error}</div>
        )}

        {loading ? (
          <p className="text-sm text-slate-400 text-center mt-8">Loading…</p>
        ) : (
          bays.map((bay) => {
            const style = STATUS_STYLES[bay.status]
            return (
              <div key={bay.id} className="rounded-2xl border border-slate-200 px-4 py-3.5">
                <div className="flex items-center justify-between">
                  <p className="text-base font-semibold text-slate-800">Bay {bay.number}</p>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${style.badge}`}>{style.label}</span>
                </div>
                {bay.status === 'washing' && (
                  <p className="text-xs text-slate-500 mt-1">{bay.remainingMinutes} min remaining</p>
                )}
                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    disabled={busyId === bay.id}
                    onClick={() => handleToggle(bay)}
                    className="flex-1 rounded-xl py-2 text-sm font-semibold text-brand-700 bg-brand-50 active:bg-brand-100 disabled:opacity-50 transition-colors"
                  >
                    {bay.isActive ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    type="button"
                    disabled={busyId === bay.id}
                    onClick={() => handleRemove(bay)}
                    className="flex-1 rounded-xl py-2 text-sm font-semibold text-red-600 bg-red-50 active:bg-red-100 disabled:opacity-50 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )
          })
        )}

        <button
          type="button"
          onClick={handleAddBay}
          className="mt-2 rounded-2xl py-3 text-sm font-semibold text-white bg-brand-600 active:bg-brand-700 transition-colors"
        >
          + Add Bay
        </button>
      </div>
    </div>
  )
}
