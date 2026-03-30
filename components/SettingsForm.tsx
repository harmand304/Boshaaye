'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createAllocationSetting, type AllocationInput } from '@/app/actions/allocation'

export default function SettingsForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form State
  const [effectiveFrom, setEffectiveFrom] = useState(() => new Date().toISOString().split('T')[0])
  const [savingsPct, setSavingsPct] = useState('0')
  const [opsPct, setOpsPct] = useState('0')
  const [harmandPct, setHarmandPct] = useState('0')
  const [bakoPct, setBakoPct] = useState('0')

  const s = parseFloat(savingsPct) || 0
  const o = parseFloat(opsPct) || 0
  const h = parseFloat(harmandPct) || 0
  const b = parseFloat(bakoPct) || 0
  const total = s + o + h + b

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (total !== 100) {
      setError(`Percentages must total exactly 100 (currently ${total})`)
      setIsSubmitting(false)
      return
    }

    const input: AllocationInput = {
      effective_from: effectiveFrom,
      savings_pct: s,
      ops_pct: o,
      harmand_pct: h,
      bako_pct: b
    }

    const res = await createAllocationSetting(input)
    if (res.success) {
      router.push('/settings')
      router.refresh()
      // Reset after success
      setSavingsPct('0')
      setOpsPct('0')
      setHarmandPct('0')
      setBakoPct('0')
    } else {
      setError(res.error)
      setIsSubmitting(false)
    }
  }

  // Common input classes
  const inputClass = "w-full bg-[var(--color-surface-muted)] border border-[var(--color-surface-border)] rounded-md px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)]"
  const labelClass = "block text-xs font-semibold tracking-wide text-[var(--color-text-secondary)] mb-1 uppercase"

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-surface-border)]">
      <div>
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1">Create New Allocation</h3>
        <p className="text-xs text-[var(--color-text-muted)] mb-4 leading-relaxed">
          New settings only affect <strong>future transactions</strong> starting on the Effective Date. Past transaction amounts are preserved via snapshots.
        </p>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Row 1: Date */}
      <div>
        <label className={labelClass}>Effective Date</label>
        <input 
          type="date" 
          required 
          className={inputClass}
          value={effectiveFrom}
          onChange={e => setEffectiveFrom(e.target.value)}
        />
      </div>

      {/* Row 2/3: Percentages Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Savings (%)</label>
          <input 
            type="number" step="1" min="0" max="100" required 
            className={inputClass} value={savingsPct} onChange={e => setSavingsPct(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Ops (%)</label>
          <input 
            type="number" step="1" min="0" max="100" required 
            className={inputClass} value={opsPct} onChange={e => setOpsPct(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Harmand Cut (%)</label>
          <input 
            type="number" step="1" min="0" max="100" required 
            className={inputClass} value={harmandPct} onChange={e => setHarmandPct(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Bako Cut (%)</label>
          <input 
            type="number" step="1" min="0" max="100" required 
            className={inputClass} value={bakoPct} onChange={e => setBakoPct(e.target.value)}
          />
        </div>
      </div>

      {/* Validation Indicator */}
      <div className={`text-sm font-semibold rounded-md p-3 border ${total === 100 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>
        Total: {total}% {total !== 100 && '(Must equal 100%)'}
      </div>

      <div className="pt-2">
        <button 
          type="submit" 
          disabled={isSubmitting || total !== 100}
          className="w-full bg-[var(--color-brand)] text-black py-2.5 rounded-lg font-bold hover:bg-[var(--color-brand-light)] transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save New Settings'}
        </button>
      </div>
    </form>
  )
}
