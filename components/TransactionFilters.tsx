'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useState, useEffect } from 'react'
import type { Wallet, Category } from '@/lib/types'
import { Search } from 'lucide-react'

// Hook for debouncing search input
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debouncedValue
}

export default function TransactionFilters({ wallets, categories }: { wallets: Wallet[], categories: Category[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const debouncedSearch = useDebounce(search, 400)

  // Apply filters via URL params
  const applyFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete('page') // Reset pagination on any filter change
      router.push(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams]
  )

  // Effect to push debounced search to URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (debouncedSearch) {
      if (params.get('search') !== debouncedSearch) {
          applyFilter('search', debouncedSearch)
      }
    } else if (params.has('search')) {
      applyFilter('search', '')
    }
  }, [debouncedSearch, applyFilter, searchParams])

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl p-6 mb-6 shadow-sm flex flex-col md:flex-row gap-5 items-center">
      
      {/* Search Bar */}
      <div className="relative w-full md:w-1/3 shrink-0">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] w-[18px] h-[18px]" />
        <input 
          type="text" 
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-5 py-3 bg-[var(--color-surface-muted)] border border-[var(--color-surface-border)] rounded-xl text-sm font-medium text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)] placeholder:text-[var(--color-text-muted)] placeholder:font-normal transition-colors"
        />
      </div>

      {/* Filters Row */}
      <div className="flex-1 w-full grid grid-cols-2 lg:grid-cols-4 gap-4">
        <select 
          value={searchParams.get('type') || ''}
          onChange={(e) => applyFilter('type', e.target.value)}
          className="bg-[var(--color-surface-muted)] border border-[var(--color-surface-border)] rounded-xl px-4 py-3 text-sm font-medium text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)] transition-colors"
        >
          <option value="">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
          <option value="investment">Investment</option>
          <option value="adjustment">Adjustment</option>
        </select>

        <select 
          value={searchParams.get('currency') || ''}
          onChange={(e) => applyFilter('currency', e.target.value)}
          className="bg-[var(--color-surface-muted)] border border-[var(--color-surface-border)] rounded-xl px-4 py-3 text-sm font-medium text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)] transition-colors"
        >
          <option value="">All Currencies</option>
          <option value="USD">USD</option>
          <option value="IQD">IQD</option>
        </select>

        <select 
          value={searchParams.get('wallet_id') || ''}
          onChange={(e) => applyFilter('wallet_id', e.target.value)}
          className="bg-[var(--color-surface-muted)] border border-[var(--color-surface-border)] rounded-xl px-4 py-3 text-sm font-medium text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)] transition-colors"
        >
          <option value="">All Wallets</option>
          {wallets.map(w => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>

        <select 
          value={searchParams.get('category_id') || ''}
          onChange={(e) => applyFilter('category_id', e.target.value)}
          className="bg-[var(--color-surface-muted)] border border-[var(--color-surface-border)] rounded-xl px-4 py-3 text-sm font-medium text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)] transition-colors"
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

    </div>
  )
}
