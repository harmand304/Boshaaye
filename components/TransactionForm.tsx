'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createTransaction, updateTransaction, type TransactionInput } from '@/app/actions/transactions'
import type { Wallet, Category, AllocationSettings, Transaction } from '@/lib/types'

interface FormProps {
  wallets: Wallet[]
  categories: Category[]
  currentAllocation: AllocationSettings | null
  initialData?: Transaction
}

export default function TransactionForm({ wallets, categories, currentAllocation, initialData }: FormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!initialData

  // Form State initialized from initialData or defaults
  const [date, setDate] = useState(() => initialData?.date || new Date().toISOString().split('T')[0])
  const [type, setType] = useState<TransactionInput['type']>(initialData?.type || 'income')
  const [title, setTitle] = useState(initialData?.title || '')
  const [amount, setAmount] = useState(initialData?.amount.toString() || '')
  const [currency, setCurrency] = useState<'USD' | 'IQD'>(initialData?.currency || 'USD')
  const [walletId, setWalletId] = useState(initialData?.wallet_id || '')
  const [categoryId, setCategoryId] = useState(initialData?.category_id || '')
  const [notes, setNotes] = useState(initialData?.notes || '')
  const [isClientIncome, setIsClientIncome] = useState(initialData?.is_client_income || false)
  const [fundingSource, setFundingSource] = useState<'' | 'ops_box' | 'main_budget'>(
    initialData?.expense_funding_source || ''
  )

  // Filter categories by selected type
  const availableCategories = categories.filter(c => c.type === type)

  // Derived Values for preview
  const numAmount = parseFloat(amount) || 0
  const showAllocationPreview = type === 'income' && isClientIncome && currentAllocation && numAmount > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!walletId) {
       setError('Please select a wallet')
       setIsSubmitting(false)
       return
    }

    if (type === 'expense' && !fundingSource) {
       setError('Expense funding source is required')
       setIsSubmitting(false)
       return
    }

    const input: TransactionInput = {
      date,
      type,
      title,
      amount: numAmount,
      currency,
      wallet_id: walletId,
      category_id: categoryId || undefined,
      notes: notes || undefined,
      is_client_income: type === 'income' ? isClientIncome : false,
      expense_funding_source: type === 'expense' && fundingSource !== '' ? (fundingSource as 'ops_box' | 'main_budget') : undefined
    }

    const res = isEditing && initialData
      ? await updateTransaction(initialData.id, input)
      : await createTransaction(input)

    if (res.success) {
      router.push('/transactions')
      router.refresh()
    } else {
      setError(res.error)
      setIsSubmitting(false)
    }
  }

  // Common input classes
  const inputClass = "w-full bg-[var(--color-surface-muted)] border border-[var(--color-surface-border)] rounded-md px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)] disabled:opacity-50"
  const labelClass = "block text-xs font-semibold tracking-wide text-[var(--color-text-secondary)] mb-1 uppercase"

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Row 1: Type & Date */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Type</label>
          <select 
            className={inputClass} 
            value={type} 
            onChange={e => {
               setType(e.target.value as any)
               setCategoryId('') // reset cat on type change
               if (e.target.value !== 'income') setIsClientIncome(false)
               if (e.target.value !== 'expense') setFundingSource('')
            }}
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="investment">Investment</option>
            <option value="adjustment">Adjustment</option>
          </select>
        </div>
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
      </div>

      {/* Row 2: Title */}
      <div>
        <label className={labelClass}>Title</label>
        <input 
          type="text" 
          required 
          placeholder="e.g. Website Redesign"
          className={inputClass}
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
      </div>

      {/* Row 3: Amount & Currency */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
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
        <div>
          <label className={labelClass}>Currency</label>
          <select 
            className={inputClass}
            value={currency}
            onChange={e => setCurrency(e.target.value as any)}
            disabled={isEditing} // Prevent changing currency on edit to avoid wallet mismatch issues easily
          >
            <option value="USD">USD</option>
            <option value="IQD">IQD</option>
          </select>
        </div>
      </div>

      {/* Row 4: Wallet & Category */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Wallet</label>
          <select required className={inputClass} value={walletId} onChange={e => setWalletId(e.target.value)}>
            <option value="">-- Select Wallet --</option>
            {wallets.filter(w => w.currency === currency).map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Category</label>
          <select className={inputClass} value={categoryId} onChange={e => setCategoryId(e.target.value)}>
            <option value="">-- Optional --</option>
            {availableCategories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Conditional: Client Income Flag */}
      {type === 'income' && (
        <div className="flex items-center gap-2 p-3 bg-[var(--color-navy-700)] rounded-md border border-[var(--color-surface-border)]">
          <input 
            type="checkbox" 
            id="client_income"
            className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-[var(--color-brand)] focus:ring-[var(--color-brand)] focus:ring-offset-gray-800"
            checked={isClientIncome}
            onChange={e => setIsClientIncome(e.target.checked)}
          />
          <label htmlFor="client_income" className="text-sm font-medium text-[var(--color-text-primary)] cursor-pointer">
            This is Client Income (trigger allocation)
          </label>
        </div>
      )}

      {/* Conditional: Allocation Preview */}
      {showAllocationPreview && currentAllocation && (
        <div className="bg-[var(--color-surface-muted)] border border-[var(--color-brand-dark)] rounded-md p-4 text-sm mt-4">
          <p className="text-[var(--color-brand)] font-semibold mb-3 border-b border-[var(--color-surface-border)] pb-2 flex justify-between items-center">
            <span>Allocation Preview</span>
            {isEditing && <span className="text-xs uppercase bg-[var(--color-brand)]/20 px-2 py-0.5 rounded text-[var(--color-brand)]">Will overwritten old snapshot</span>}
          </p>
          <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-[var(--color-text-primary)]">
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">Savings ({currentAllocation.savings_pct}%)</span>
              <span>{(numAmount * currentAllocation.savings_pct / 100).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">Ops ({currentAllocation.ops_pct}%)</span>
              <span>{(numAmount * currentAllocation.ops_pct / 100).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">Harmand ({currentAllocation.harmand_pct}%)</span>
              <span>{(numAmount * currentAllocation.harmand_pct / 100).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">Bako ({currentAllocation.bako_pct}%)</span>
              <span>{(numAmount * currentAllocation.bako_pct / 100).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Conditional: Expense Funding Source */}
      {type === 'expense' && (
        <div className="p-4 bg-[var(--color-navy-700)] rounded-md border border-rose-500/30">
          <label className={labelClass}>Funding Source (Required)</label>
          <div className="flex gap-4 mt-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input 
                type="radio" 
                name="funding_source"
                className="text-rose-500 focus:ring-rose-500"
                checked={fundingSource === 'main_budget'}
                onChange={() => setFundingSource('main_budget')}
              />
              Main Budget
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input 
                type="radio" 
                name="funding_source"
                className="text-rose-500 focus:ring-rose-500"
                checked={fundingSource === 'ops_box'}
                onChange={() => setFundingSource('ops_box')}
              />
              Ops Box
            </label>
          </div>
        </div>
      )}

      {/* Row 5: Notes */}
      <div>
        <label className={labelClass}>Notes</label>
        <textarea 
          rows={3}
          className={inputClass}
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
      </div>

      {/* Submit */}
      <div className="pt-2 flex gap-3">
        <button 
          type="button" 
          onClick={() => router.back()}
          className="flex-1 bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] border border-[var(--color-surface-border)] py-2.5 rounded-lg font-bold hover:bg-[var(--color-surface)] transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="flex-1 bg-[var(--color-brand)] text-black py-2.5 rounded-lg font-bold hover:bg-[var(--color-brand-light)] transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Save Transaction')}
        </button>
      </div>
    </form>
  )
}
