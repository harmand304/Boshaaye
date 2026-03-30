'use client'

import { useState } from 'react'
import type { DashboardStats } from '@/lib/data/dashboard'
import ExpenseChart from './ExpenseChart'
import TrendChart from './TrendChart'

interface DashboardChartsProps {
  stats: DashboardStats
}

export default function DashboardCharts({ stats }: DashboardChartsProps) {
  const [currency, setCurrency] = useState<'USD' | 'IQD'>('USD')

  const currentStats = stats[currency]

  return (
    <section className="mb-10">
      
      {/* Header & Toggle */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
             <span className="w-3 h-3 rounded-full bg-[var(--color-brand)] shadow-[0_0_8px_var(--color-brand)]"></span>
             Analytics & Trends
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1.5 ml-5">
            Visual breakdown of your {currency} finances.
          </p>
        </div>
        
        {/* Sleek Segmented Control */}
        <div className="flex bg-[var(--color-navy-900)] p-1.5 rounded-xl border border-[var(--color-surface-border)] shrink-0 shadow-inner w-full md:w-auto">
          <button
             onClick={() => setCurrency('USD')}
             className={`flex-1 md:flex-none px-8 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${currency === 'USD' ? 'bg-[var(--color-surface)] text-[var(--color-brand)] shadow-md border border-[var(--color-surface-border)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] border border-transparent'}`}
          >
            USD
          </button>
          <button
             onClick={() => setCurrency('IQD')}
             className={`flex-1 md:flex-none px-8 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${currency === 'IQD' ? 'bg-[var(--color-surface)] text-[var(--color-brand)] shadow-md border border-[var(--color-surface-border)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] border border-transparent'}`}
          >
            IQD
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* Expense Breakdown Card */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl p-6 shadow flex flex-col min-h-[400px]">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-8 text-center border-b border-[var(--color-surface-border)] pb-4">Expense Breakdown By Category</h3>
          <div className="flex-1 flex flex-col justify-center h-[320px]">
             <ExpenseChart data={currentStats.expenseCategories} currency={currency} />
          </div>
        </div>

        {/* Trend Card */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl p-6 shadow flex flex-col min-h-[400px]">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-8 text-center border-b border-[var(--color-surface-border)] pb-4">Income vs Expenses (Monthly)</h3>
          <div className="flex-1 flex flex-col justify-center h-[320px]">
             <TrendChart data={currentStats.trendData} currency={currency} />
          </div>
        </div>

      </div>

    </section>
  )
}
