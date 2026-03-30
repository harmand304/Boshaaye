import TransactionForm from '@/components/TransactionForm'
import { getWallets } from '@/lib/data/wallets'
import { getCategories } from '@/lib/data/categories'
import { getCurrentAllocation } from '@/lib/data/allocation'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Add Transaction — Boshaaye Finance'
}

export default async function AddTransactionPage() {
  const [wallets, categories, currentAllocation] = await Promise.all([
    getWallets(),
    getCategories(),
    getCurrentAllocation()
  ])

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <div className="mb-6 border-b border-[var(--color-surface-border)] pb-4">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Add Transaction</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">Record a new financial entry.</p>
      </div>

      <TransactionForm 
        wallets={wallets} 
        categories={categories} 
        currentAllocation={currentAllocation} 
      />
    </main>
  )
}
