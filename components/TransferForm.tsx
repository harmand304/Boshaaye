'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createTransfer, updateTransfer, type TransferInput } from '@/app/actions/transfers'
import type { Wallet, Transfer } from '@/lib/types'

interface FormProps {
  wallets: Wallet[]
  initialData?: Transfer
}

export default function TransferForm({ wallets, initialData }: FormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!initialData

  // Form State
  const [date, setDate] = useState(() => initialData?.date || new Date().toISOString().split('T')[0])
  const [currency, setCurrency] = useState<'USD' | 'IQD'>(initialData?.currency || 'USD')
  const [fromWalletId, setFromWalletId] = useState(initialData?.from_wallet_id || '')
  const [toWalletId, setToWalletId] = useState(initialData?.to_wallet_id || '')
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '')
  const [notes, setNotes] = useState(initialData?.notes || '')

  const availableWallets = wallets.filter(w => w.currency === currency)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!fromWalletId || !toWalletId) {
      setError('Both source and destination wallets are required')
      setIsSubmitting(false)
      return
    }

    if (fromWalletId === toWalletId) {
       setError('Cannot transfer to the same wallet')
       setIsSubmitting(false)
       return
    }

    const numAmount = parseFloat(amount) || 0
    if (numAmount <= 0) {
      setError('Amount must be greater than zero')
      setIsSubmitting(false)
      return
    }

    const input: TransferInput = {
      date,
      currency,
      from_wallet_id: fromWalletId,
      to_wallet_id: toWalletId,
      amount: numAmount,
      notes: notes || undefined
    }

    const res = isEditing && initialData
      ? await updateTransfer(initialData.id, input)
      : await createTransfer(input)

    if (res.success) {
      if (isEditing) {
         router.push('/transfers')
      } else {
         // Clear form on add success
         setAmount('')
         setNotes('')
      }
      router.refresh()
    } else {
      setError(res.error)
      setIsSubmitting(false)
    }
    
    if (!res.success) {
      setIsSubmitting(false)
    }
  }

  // Common input classes
  const inputClass = "w-full bg-[var(--color-surface-muted)] border border-[var(--color-surface-border)] rounded-md px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)] disabled:opacity-50"
  const labelClass = "block text-xs font-semibold tracking-wide text-[var(--color-text-secondary)] mb-1 uppercase"

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-surface-border)]">
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 p-3 rounded-md text-sm mb-4">
          {error}
        </div>
      )}

      {/* Row 1: Date & Currency */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Date</label>
          <input 
            type="date" 
            required 
            className={inputClass}
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Currency</label>
          <select 
            className={inputClass}
            value={currency}
            disabled={isEditing}
            onChange={e => {
              setCurrency(e.target.value as any)
              // Reset wallets when currency changes since they must match
              setFromWalletId('')
              setToWalletId('')
            }}
          >
            <option value="USD">USD</option>
            <option value="IQD">IQD</option>
          </select>
        </div>
      </div>

      {/* Row 2: Wallets */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>From Wallet</label>
          <select required className={inputClass} value={fromWalletId} onChange={e => setFromWalletId(e.target.value)}>
             <option value="">-- Select Source --</option>
             {availableWallets.map(w => (
               <option key={w.id} value={w.id} disabled={w.id === toWalletId}>{w.name}</option>
             ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>To Wallet</label>
          <select required className={inputClass} value={toWalletId} onChange={e => setToWalletId(e.target.value)}>
             <option value="">-- Select Destination --</option>
             {availableWallets.map(w => (
               <option key={w.id} value={w.id} disabled={w.id === fromWalletId}>{w.name}</option>
             ))}
          </select>
        </div>
      </div>

      {/* Row 3: Amount */}
      <div>
        <label className={labelClass}>Amount</label>
         <input 
            type="number" 
            step="0.01"
            min="0.01"
            required 
            placeholder="0.00"
            className={inputClass}
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
      </div>

      {/* Row 4: Notes */}
      <div>
         <label className={labelClass}>Notes</label>
          <input 
            type="text" 
            placeholder="Optional reference..."
            className={inputClass}
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
      </div>

      {/* Submit */}
      <div className="pt-2 flex gap-3">
        {isEditing && (
           <button 
             type="button" 
             onClick={() => router.back()}
             disabled={isSubmitting}
             className="flex-1 bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] border border-[var(--color-surface-border)] py-2.5 rounded-lg font-bold hover:bg-[var(--color-surface)] transition-colors disabled:opacity-50"
           >
             Cancel
           </button>
        )}
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="flex-1 bg-[var(--color-brand)] text-black py-2.5 rounded-lg font-bold hover:bg-[var(--color-brand-light)] transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Execute Transfer')}
        </button>
      </div>

      {!isEditing && (
         <p className="text-xs text-center text-[var(--color-text-muted)] mt-2">
           Transfers only move money between wallets. They do not affect income, expenses, or the Main Budget.
         </p>
      )}
    </form>
  )
}

