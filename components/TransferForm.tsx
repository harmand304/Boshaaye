'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Paperclip, X, FileText, Image as ImageIcon, Loader2 } from 'lucide-react'
import { createTransfer, updateTransfer, type TransferInput } from '@/app/actions/transfers'
import type { Wallet, Category, Transfer } from '@/lib/types'

interface FormProps {
  wallets: Wallet[]
  categories: Category[]
  initialData?: Transfer
}

export default function TransferForm({ wallets, categories, initialData }: FormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!initialData

  const [date, setDate] = useState(() => initialData?.date || new Date().toISOString().split('T')[0])
  const [currency, setCurrency] = useState<'USD' | 'IQD'>(initialData?.currency || 'USD')
  const [fromWalletId, setFromWalletId] = useState(initialData?.from_wallet_id || '')
  const [toWalletId, setToWalletId] = useState(initialData?.to_wallet_id || '')
  const [amount, setAmount] = useState(initialData?.amount.toString() || '')
  const [notes, setNotes] = useState(initialData?.notes || '')

  // Fee fields
  const [feeAmount, setFeeAmount] = useState(initialData?.fee_amount?.toString() || '')
  const [feeCategoryId, setFeeCategoryId] = useState(initialData?.fee_category_id || '')
  const [feeFundingSource, setFeeFundingSource] = useState<'main_budget' | 'ops_box'>(
    initialData?.fee_funding_source || 'main_budget'
  )

  // Receipt state
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [receipt, setReceipt] = useState({
    url: initialData?.receipt_url ?? null as string | null,
    file_name: initialData?.receipt_file_name ?? null as string | null,
    mime_type: initialData?.receipt_mime_type ?? null as string | null,
    uploaded_at: initialData?.receipt_uploaded_at ?? null as string | null,
  })
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false)
  const [receiptUploadError, setReceiptUploadError] = useState<string | null>(null)

  const availableWallets = wallets.filter(w => w.currency === currency)
  const expenseCategories = categories.filter(c => c.type === 'expense')

  const numAmount = parseFloat(amount) || 0
  const numFee = parseFloat(feeAmount) || 0
  const hasFee = numFee > 0
  const totalDeducted = numAmount + numFee

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const input: TransferInput = {
      date,
      from_wallet_id: fromWalletId,
      to_wallet_id: toWalletId,
      amount: numAmount,
      currency,
      notes: notes || undefined,
      fee_amount: hasFee ? numFee : undefined,
      fee_category_id: hasFee ? (feeCategoryId || undefined) : undefined,
      fee_funding_source: hasFee ? feeFundingSource : undefined,
      receipt_url: receipt.url,
      receipt_file_name: receipt.file_name,
      receipt_mime_type: receipt.mime_type,
      receipt_uploaded_at: receipt.uploaded_at,
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
         setFeeAmount('')
         setFeeCategoryId('')
         setReceipt({ url: null, file_name: null, mime_type: null, uploaded_at: null })
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploadingReceipt(true)
    setReceiptUploadError(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/receipt/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) { setReceiptUploadError(data.error || 'Upload failed'); return }
      setReceipt({ url: data.url, file_name: data.file_name, mime_type: data.mime_type, uploaded_at: data.uploaded_at })
    } catch {
      setReceiptUploadError('Upload failed. Please try again.')
    } finally {
      setIsUploadingReceipt(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleRemoveReceipt = () => {
    setReceipt({ url: null, file_name: null, mime_type: null, uploaded_at: null })
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

      {/* Row 4: Transfer Fee (optional) */}
      <div className="border-t border-[var(--color-surface-border)] pt-4 space-y-4">
        <div>
          <label className={labelClass}>Transfer Fee <span className="text-[var(--color-text-muted)] normal-case font-normal">(optional)</span></label>
          <input 
            type="number" 
            step="0.01"
            min="0"
            placeholder="0.00 — leave empty if no fee"
            className={inputClass}
            value={feeAmount}
            onChange={e => setFeeAmount(e.target.value)}
          />
        </div>

        {/* Fee details — only shown when a fee is entered */}
        {hasFee && (
          <div className="space-y-4 p-3 bg-[var(--color-navy-700)] rounded-lg border border-rose-500/20">
            <div>
              <label className={labelClass}>Fee Category</label>
              <select className={inputClass} value={feeCategoryId} onChange={e => setFeeCategoryId(e.target.value)}>
                <option value="">-- Optional --</option>
                {expenseCategories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Fee Funding Source</label>
              <div className="flex gap-4 mt-1">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-[var(--color-text-primary)]">
                  <input 
                    type="radio" 
                    name="fee_funding_source"
                    checked={feeFundingSource === 'main_budget'}
                    onChange={() => setFeeFundingSource('main_budget')}
                  />
                  Main Budget
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-[var(--color-text-primary)]">
                  <input 
                    type="radio" 
                    name="fee_funding_source"
                    checked={feeFundingSource === 'ops_box'}
                    onChange={() => setFeeFundingSource('ops_box')}
                  />
                  Ops Box
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Live helper text */}
        {hasFee && numAmount > 0 && (
          <p className="text-xs text-[var(--color-text-muted)] bg-[var(--color-surface-muted)] rounded px-3 py-2">
            Total deducted from source wallet:{' '}
            <span className="font-semibold text-[var(--color-text-primary)]">
              {currency === 'USD'
                ? `$${totalDeducted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : `${totalDeducted.toLocaleString()} IQD`}
            </span>
            {' '}(transfer {currency === 'USD' ? `$${numAmount.toFixed(2)}` : `${numAmount.toLocaleString()} IQD`} + fee {currency === 'USD' ? `$${numFee.toFixed(2)}` : `${numFee.toLocaleString()} IQD`})
          </p>
        )}
      </div>

      {/* Row 5: Notes */}
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

      {/* Receipt Upload */}
      <div>
        <label className={labelClass}>Receipt / Attachment <span className="text-[var(--color-text-muted)] normal-case font-normal">(optional)</span></label>
        {receipt.url ? (
          <div className="flex items-center gap-3 p-3 bg-[var(--color-surface-muted)] border border-[var(--color-brand)]/30 rounded-md">
            <div className="text-[var(--color-brand)] shrink-0">
              {receipt.mime_type === 'application/pdf' ? <FileText size={18} /> : <ImageIcon size={18} />}
            </div>
            <a href={receipt.url} target="_blank" rel="noopener noreferrer"
              className="text-sm text-[var(--color-brand)] hover:underline truncate flex-1">
              {receipt.file_name || 'Receipt attached'}
            </a>
            <button type="button" onClick={handleRemoveReceipt}
              className="text-[var(--color-text-muted)] hover:text-rose-400 transition-colors shrink-0" title="Remove receipt">
              <X size={16} />
            </button>
          </div>
        ) : (
          <div>
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploadingReceipt}
              className="flex items-center gap-2 px-4 py-2 text-sm border border-dashed border-[var(--color-surface-border)] rounded-md text-[var(--color-text-secondary)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] transition-colors disabled:opacity-50">
              {isUploadingReceipt ? <><Loader2 size={15} className="animate-spin" />Uploading...</> : <><Paperclip size={15} />Attach Receipt</>}
            </button>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-1.5">JPG, PNG, WebP or PDF — max 10MB</p>
          </div>
        )}
        {receiptUploadError && <p className="text-xs text-rose-400 mt-1">{receiptUploadError}</p>}
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
          className="hidden" onChange={handleFileSelect} />
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
           Transfers only move money between wallets. Fees (if any) are recorded as expenses.
         </p>
      )}
    </form>
  )
}
