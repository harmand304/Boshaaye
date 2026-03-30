'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
}

export default function Pagination({ currentPage, totalPages, totalItems }: PaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return
    
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between mt-6 bg-[var(--color-navy-800)] border border-[var(--color-surface-border)] rounded-xl py-3 px-4">
      <div className="text-sm text-[var(--color-text-muted)]">
        Showing <span className="font-semibold text-[var(--color-text-primary)]">{(currentPage - 1) * 20 + 1}</span> to <span className="font-semibold text-[var(--color-text-primary)]">{Math.min(currentPage * 20, totalItems)}</span> of <span className="font-semibold text-[var(--color-text-primary)]">{totalItems}</span> entries
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-md hover:bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-medium text-[var(--color-text-primary)] px-2">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-md hover:bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}
