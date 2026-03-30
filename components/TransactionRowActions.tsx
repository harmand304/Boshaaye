'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { deleteTransaction } from '@/app/actions/transactions'
import { Pencil, Trash2 } from 'lucide-react'

export default function TransactionRowActions({ id }: { id: string }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this transaction? This will instantly update wallet balances and dashboard budgets.')) return
    
    setIsDeleting(true)
    const res = await deleteTransaction(id)
    if (res.success) {
      router.refresh()
    } else {
      alert('Failed to delete: ' + res.error)
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex items-center justify-end gap-2 pr-4">
      <Link 
        href={`/transactions/${id}/edit`}
        className="text-[var(--color-text-muted)] hover:text-[var(--color-brand)] transition-colors p-1.5"
        title="Edit"
      >
        <Pencil size={14} />
      </Link>
      <button 
        className="text-[var(--color-text-muted)] hover:text-rose-400 transition-colors disabled:opacity-50 p-1.5"
        onClick={handleDelete}
        disabled={isDeleting}
        title="Delete"
      >
        <Trash2 size={14} className={isDeleting ? "animate-pulse" : ""} />
      </button>
    </div>
  )
}
