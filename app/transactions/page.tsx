import { getTransactions } from '@/lib/data/transactions'
import { getWallets } from '@/lib/data/wallets'
import { getCategories } from '@/lib/data/categories'
import { formatUSD, formatIQD } from '@/lib/format'
import Link from 'next/link'
import TransactionRowActions from '@/components/TransactionRowActions'
import TransactionFilters from '@/components/TransactionFilters'
import Pagination from '@/components/Pagination'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Transactions — Boshaaye Finance'
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const resolvedParams = await searchParams

  const filters = {
    page: Number(resolvedParams.page) || 1,
    pageSize: 20,
    search: resolvedParams.search,
    type: resolvedParams.type,
    currency: resolvedParams.currency,
    wallet_id: resolvedParams.wallet_id,
    category_id: resolvedParams.category_id,
  }

  const [paginatedData, wallets, categories] = await Promise.all([
    getTransactions(filters),
    getWallets(),
    getCategories()
  ])

  const transactions = paginatedData.data

  return (
    <main className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Transactions</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1.5 ml-1">Full history of income, expenses, and investments.</p>
        </div>
        <div className="w-full sm:w-auto mt-2 sm:mt-0 flex gap-3">
          <a
            href="/api/export/transactions"
            target="_blank"
            rel="noopener noreferrer"
            className="flex sm:inline-flex justify-center items-center bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] font-bold px-4 py-3 rounded-xl border border-[var(--color-surface-border)] hover:bg-[var(--color-surface)] transition-colors text-sm shadow-sm"
          >
            Export CSV
          </a>
          <Link 
            href="/transactions/add"
            className="flex sm:inline-flex justify-center items-center bg-[var(--color-brand)] text-black font-extrabold px-6 py-3 rounded-xl hover:bg-[var(--color-brand-light)] transition-colors text-sm shadow-md"
          >
            + Add Transaction
          </Link>
        </div>
      </div>

      <TransactionFilters wallets={wallets} categories={categories} />

      {transactions.length === 0 ? (
        <div className="bg-[var(--color-surface)] border border-dashed border-[var(--color-surface-border)] rounded-2xl py-20 text-center text-[var(--color-text-muted)] flex flex-col items-center justify-center space-y-3 shadow-sm">
           <span className="text-3xl opacity-50">📂</span>
           <span>No transactions match your current filters.</span>
        </div>
      ) : (
        <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-[var(--color-navy-800)] text-[var(--color-text-secondary)] uppercase tracking-wider text-[11px] font-bold">
            <tr>
                  <th className="px-6 py-6 border-b border-[var(--color-surface-border)]">Date</th>
                  <th className="px-6 py-6 border-b border-[var(--color-surface-border)]">Title</th>
                  <th className="px-6 py-6 border-b border-[var(--color-surface-border)]">Type & Category</th>
                  <th className="px-6 py-6 border-b border-[var(--color-surface-border)]">Wallet</th>
                  <th className="px-6 py-6 border-b border-[var(--color-surface-border)] text-right">Amount</th>
                  <th className="px-6 py-6 border-b border-[var(--color-surface-border)] text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-surface-border)]/50 bg-[var(--color-surface)]">
                {transactions.map(t => (
                  <tr key={t.id} className="hover:bg-[var(--color-surface-muted)] transition-colors group">
                    <td className="px-6 py-5 text-[var(--color-text-secondary)] tabular-nums">{t.date}</td>
                    <td className="px-6 py-5">
                      <div className="font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand)] transition-colors">{t.title}</div>
                      {t.notes && <div className="text-xs text-[var(--color-text-muted)] mt-1.5 max-w-[200px] sm:max-w-xs truncate">{t.notes}</div>}
                      {(t.created_by_email || t.updated_by_email) && (
                        <div className="text-[10px] text-[var(--color-text-muted)] mt-1.5 flex items-center gap-2">
                           {t.created_by_email && <span>Added by {t.created_by_email.split('@')[0]}</span>}
                           {t.updated_by_email && <span className="text-[var(--color-text-secondary)] pl-2 border-l border-[var(--color-surface-border)]">Updated by {t.updated_by_email.split('@')[0]}</span>}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
                        t.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' :
                        t.type === 'expense' ? 'bg-rose-500/10 text-rose-400' :
                        t.type === 'investment' ? 'bg-blue-500/10 text-blue-400' :
                        'bg-gray-500/10 text-gray-400'
                      }`}>
                        {t.type}
                      </span>
                      {t.categories && (
                         <span className="ml-2 text-xs text-[var(--color-text-muted)] font-medium">{t.categories.name}</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-[var(--color-text-secondary)] font-medium">
                      {t.wallets?.name}
                    </td>
                    <td className={`px-6 py-5 text-right font-bold tabular-nums text-base ${
                      t.type === 'income' || t.type === 'investment' ? 'text-emerald-400' : 
                      'text-[var(--color-text-primary)]'
                    }`}>
                      {t.type === 'expense' ? '-' : ''}{t.currency === 'USD' ? formatUSD(t.amount) : formatIQD(t.amount)}
                    </td>
                    <td className="py-5 content-center pr-2">
                      <TransactionRowActions id={t.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {paginatedData.total > 0 && (
         <Pagination 
           currentPage={paginatedData.currentPage}
           totalPages={paginatedData.totalPages}
           totalItems={paginatedData.total}
         />
      )}
    </main>
  )
}
