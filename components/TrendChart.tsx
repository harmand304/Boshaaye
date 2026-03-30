'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { ChartTrendData } from '@/lib/data/dashboard'
import { formatUSD, formatIQD } from '@/lib/format'

interface TrendChartProps {
  data: ChartTrendData[]
  currency: 'USD' | 'IQD'
}

export default function TrendChart({ data, currency }: TrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center text-[var(--color-text-muted)] text-sm space-y-4 bg-[var(--color-surface-muted)]/30 rounded-xl border border-dashed border-[var(--color-surface-border)]">
        <span className="text-3xl opacity-40">📈</span>
        <span className="font-medium">No trend data logged for {currency}</span>
      </div>
    )
  }

  const formatMoney = (val: number) => currency === 'USD' ? formatUSD(val) : formatIQD(val)
  const formatCompact = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`
    if (val >= 1000) return `${(val / 1000).toFixed(0)}k`
    return val.toString()
  }

  return (
    <div className="h-full w-full text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-surface-border)" />
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }}
            tickFormatter={formatCompact}
          />
          <Tooltip
            formatter={(value: any, name: any) => [formatMoney(value), name.toString().charAt(0).toUpperCase() + name.toString().slice(1)]}
            contentStyle={{ backgroundColor: 'var(--color-navy-800)', borderColor: 'var(--color-surface-border)', borderRadius: '8px', color: 'var(--color-text-primary)' }}
            itemStyle={{ fontSize: '12px' }}
            cursor={{ fill: 'var(--color-surface-muted)' }}
          />
          <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
          <Bar dataKey="income" name="Income/Invst." fill="#00C9A7" radius={[4, 4, 0, 0]} maxBarSize={40} />
          <Bar dataKey="expense" name="Expenses" fill="#FF6B6B" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
