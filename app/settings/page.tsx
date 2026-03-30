import { getAllAllocationSettings } from '@/lib/data/allocation'
import SettingsForm from '@/components/SettingsForm'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Settings — Boshaaye Finance'
}

export default async function SettingsPage() {
  const history = await getAllAllocationSettings()

  return (
    <main className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[var(--color-surface-border)] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Allocation Settings</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Configure how incoming client revenue is split into the different budgets.</p>
        </div>
        <div className="w-full sm:w-auto mt-2 sm:mt-0">
          <a
            href="/api/export/settings"
            target="_blank"
            rel="noopener noreferrer"
            className="flex sm:inline-flex justify-center items-center bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] font-bold px-4 py-2.5 rounded-lg border border-[var(--color-surface-border)] hover:bg-[var(--color-surface)] transition-colors text-sm shadow-sm"
          >
            Export CSV
          </a>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Side: Creation Form */}
        <div>
          <SettingsForm />
        </div>

        {/* Right Side: History Table */}
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Allocation History</h2>
          
          {history.length === 0 ? (
             <div className="bg-[var(--color-surface-muted)] border border-dashed border-[var(--color-surface-border)] rounded-xl p-8 text-center text-[var(--color-text-muted)] text-sm h-48 flex items-center justify-center">
                No allocation settings found.
             </div>
          ) : (
             <div className="space-y-3">
               {history.map((s, index) => (
                 <div key={s.id} className={`bg-[var(--color-navy-800)] border ${index === 0 ? 'border-[var(--color-brand)] shadow-[0_0_10px_rgba(0,201,167,0.1)]' : 'border-[var(--color-surface-border)]'} p-4 rounded-xl`}>
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-sm font-semibold text-[var(--color-text-primary)]">Effective: {s.effective_from}</span>
                       {index === 0 && <span className="bg-[var(--color-brand)]/20 text-[var(--color-brand)] text-[10px] px-2 py-0.5 rounded font-bold tracking-wider uppercase">Active</span>}
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center text-xs text-[var(--color-text-secondary)] mt-3 pd-2 border-t border-[var(--color-surface-border)] pt-3">
                       <div>
                         <span className="block font-medium text-[var(--color-text-primary)] mb-1">{s.savings_pct}%</span>
                         Savings
                       </div>
                       <div>
                         <span className="block font-medium text-[var(--color-text-primary)] mb-1">{s.ops_pct}%</span>
                         Ops
                       </div>
                       <div>
                         <span className="block font-medium text-[var(--color-text-primary)] mb-1">{s.harmand_pct}%</span>
                         Harmand
                       </div>
                       <div>
                         <span className="block font-medium text-[var(--color-text-primary)] mb-1">{s.bako_pct}%</span>
                         Bako
                       </div>
                    </div>
                    {s.created_by_email && (
                      <div className="text-[10px] text-[var(--color-text-muted)] mt-3">
                        Set by {s.created_by_email.split('@')[0]}
                      </div>
                    )}
                 </div>
               ))}
             </div>
          )}
        </div>
      </div>
    </main>
  )
}
