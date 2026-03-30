import { getDashboardStats } from '@/lib/data/dashboard'
import StatCard from '@/components/StatCard'
import DashboardCharts from '@/components/DashboardCharts'
import { formatUSD, formatIQD } from '@/lib/format'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Dashboard — Boshaaye Finance',
}

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  const cards = [
    { label: 'Capital Invested', usd: stats.USD.capitalInvested, iqd: stats.IQD.capitalInvested },
    { label: 'Client Income',    usd: stats.USD.clientIncome,    iqd: stats.IQD.clientIncome    },
    { label: 'Total Expenses',   usd: stats.USD.totalExpenses,   iqd: stats.IQD.totalExpenses   },
    { label: 'Main Budget',      usd: stats.USD.mainBudget,      iqd: stats.IQD.mainBudget, highlight: true },
    { label: 'Savings Box',      usd: stats.USD.savingsBox,      iqd: stats.IQD.savingsBox      },
    { label: 'Ops Box',          usd: stats.USD.opsBox,          iqd: stats.IQD.opsBox          },
    { label: "Harmand's Cut",    usd: stats.USD.harmandCut,      iqd: stats.IQD.harmandCut      },
    { label: "Bako's Cut",       usd: stats.USD.bakoCut,         iqd: stats.IQD.bakoCut         },
  ]

  const hasNoData = cards.every((c) => c.usd === 0 && c.iqd === 0)

  return (
    <main style={{ padding: '1.5rem', maxWidth: '960px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--color-surface-border)', paddingBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
          Dashboard
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
          Real-time overview of budgets, allocations, and wallet balances.
        </p>
      </div>

      {/* Empty state */}
      {hasNoData && (
        <div
          style={{
            backgroundColor: 'var(--color-surface-muted)',
            border: '1px dashed var(--color-surface-border)',
            borderRadius: '0.75rem',
            padding: '2rem',
            textAlign: 'center',
            marginBottom: '1.5rem',
            color: 'var(--color-text-muted)',
            fontSize: '0.875rem',
          }}
        >
          No transactions yet. Add your first transaction or connect Supabase to see real data.
        </div>
      )}

      {/* Primary Grid: Wallet Balances & High Level Stats */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
         
         {!hasNoData && <DashboardCharts stats={stats} />}
         
         {/* Wallet Balances Section */}
         <section>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-brand)' }}></span>
              Wallet Balances
            </h2>
            <div style={{ 
               display: 'grid', 
               gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
               gap: '1rem' 
            }}>
              {stats.wallets.map(w => (
                 <div key={w.walletId} style={{
                    backgroundColor: 'var(--color-surface-muted)',
                    border: '1px solid var(--color-surface-border)',
                    borderRadius: '0.5rem',
                    padding: '1rem'
                 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                       <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>{w.name}</span>
                       <span style={{ fontSize: '0.65rem', backgroundColor: 'var(--color-navy-900)', padding: '0.125rem 0.375rem', borderRadius: '4px', color: 'var(--color-text-muted)' }}>{w.currency}</span>
                    </div>
                    <div style={{ 
                       fontSize: '1.25rem', 
                       fontWeight: 600, 
                       color: w.balance < 0 ? 'var(--color-danger)' : 'var(--color-text-primary)' 
                    }}>
                       {w.currency === 'USD' ? formatUSD(w.balance) : formatIQD(w.balance)}
                    </div>
                 </div>
              ))}
            </div>
         </section>

         {/* Allocation Stats Section */}
         <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-surface-border)', paddingBottom: '0.75rem' }}>
              Budgets & Allocations
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '1.25rem',
              }}
            >
              {cards.map((card) => (
                <StatCard
                  key={card.label}
                  label={card.label}
                  usd={card.usd}
                  iqd={card.iqd}
                  highlight={card.highlight}
                />
              ))}
            </div>
         </section>

      </div>
    </main>
  )
}
