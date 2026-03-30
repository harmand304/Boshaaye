'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { ChartCategoryData } from '@/lib/data/dashboard'
import { formatUSD, formatIQD } from '@/lib/format'

interface ExpenseChartProps {
  data: ChartCategoryData[]
  currency: 'USD' | 'IQD'
}

const COLORS = ['#00C9A7', '#FF6B6B', '#4D96FF', '#FFB13B', '#9D4EDD', '#00B4D8', '#FF8E3C', '#2A9D8F']

export default function ExpenseChart({ data, currency }: ExpenseChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center text-[var(--color-text-muted)] text-sm space-y-4 bg-[var(--color-surface-muted)]/30 rounded-xl border border-dashed border-[var(--color-surface-border)]">
        <span className="text-3xl opacity-40">📊</span>
        <span className="font-medium">No expense data logged for {currency}</span>
      </div>
    )
  }

  const formatMoney = (val: number) => currency === 'USD' ? formatUSD(val) : formatIQD(val)

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="amount"
            nameKey="name"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
             formatter={(value: any) => [formatMoney(value), 'Amount']}
             contentStyle={{ backgroundColor: 'var(--color-navy-800)', borderColor: 'var(--color-surface-border)', borderRadius: '8px', color: 'var(--color-text-primary)' }}
             itemStyle={{ color: 'var(--color-text-primary)' }}
          />
          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
