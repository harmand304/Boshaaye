import { getWallets } from '@/lib/data/wallets'
import { getTransfers, type TransferWithWallets } from '@/lib/data/transfers'
import { getCategories } from '@/lib/data/categories'
import { formatUSD, formatIQD } from '@/lib/format'
import TransferForm from '@/components/TransferForm'
import TransferRowActions from '@/components/TransferRowActions'
import ReceiptPreviewButton from '@/components/ReceiptPreviewButton'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Transfers — Boshaaye Finance'
}

export default async function TransfersPage() {
  const [wallets, transfers, categories] = await Promise.all([
    getWallets(),
    getTransfers(),
    getCategories()
  ])

  return (
    <main className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[var(--color-surface-border)] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Wallet Transfers</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Move money between wallets without affecting budgets or expenses.</p>
        </div>
        <div className="w-full sm:w-auto mt-2 sm:mt-0">
          <a
            href="/api/export/transfers"
            target="_blank"
            rel="noopener noreferrer"
            className="flex sm:inline-flex justify-center items-center bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] font-bold px-4 py-2.5 rounded-lg border border-[var(--color-surface-border)] hover:bg-[var(--color-surface)] transition-colors text-sm shadow-sm"
          >
            Export CSV
          </a>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Side: Form */}
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">New Transfer</h2>
          <TransferForm wallets={wallets} categories={categories} />
        </div>

        {/* Right Side: History List */}
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Recent Transfers</h2>
          
          {transfers.length === 0 ? (
             <div className="bg-[var(--color-surface-muted)] border border-dashed border-[var(--color-surface-border)] rounded-xl p-8 text-center text-[var(--color-text-muted)] text-sm h-48 flex items-center justify-center">
                No transfers recorded yet.
             </div>
          ) : (
             <div className="space-y-3">
               {transfers.slice(0, 10).map((t: TransferWithWallets) => (
                 <div key={t.id} className="bg-[var(--color-navy-800)] border border-[var(--color-surface-border)] p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold text-[var(--color-text-primary)]">{t.from_wallet?.name}</span>
                        <span className="text-[var(--color-text-muted)]">→</span>
                        <span className="font-semibold text-[var(--color-text-primary)]">{t.to_wallet?.name}</span>
                      </div>
                      <div className="text-xs text-[var(--color-text-secondary)] mt-1">
                        {t.date} {t.notes ? `• ${t.notes}` : ''}
                      </div>
                      {(t.created_by_email || t.updated_by_email) && (
                        <div className="text-[10px] text-[var(--color-text-muted)] mt-1 flex items-center gap-2">
                           {t.created_by_email && <span>By {t.created_by_email.split('@')[0]}</span>}
                           {t.updated_by_email && <span className="text-[var(--color-text-secondary)] pl-2 border-l border-[var(--color-surface-border)]">Update: {t.updated_by_email.split('@')[0]}</span>}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <TransferRowActions id={t.id} />
                        {t.receipt_url && (
                          <ReceiptPreviewButton
                            receiptUrl={t.receipt_url}
                            receiptFileName={t.receipt_file_name ?? null}
                            receiptMimeType={t.receipt_mime_type ?? null}
                          />
                        )}
                      </div>
                    </div>
                    <div className="text-[var(--color-text-primary)] font-medium tabular-nums pl-4 text-right shrink-0">
                      {t.currency === 'USD' ? formatUSD(t.amount) : formatIQD(t.amount)}
                      {t.fee_amount && t.fee_amount > 0 && (
                        <div className="text-[10px] text-rose-400 mt-0.5">
                          +{t.currency === 'USD' ? formatUSD(t.fee_amount) : formatIQD(t.fee_amount)} fee
                        </div>
                      )}
                    </div>
                 </div>
               ))}
               {transfers.length > 10 && (
                 <p className="text-xs text-center text-[var(--color-text-muted)] p-2">Showing 10 most recent</p>
               )}
             </div>
          )}
        </div>
      </div>
    </main>
  )
}
