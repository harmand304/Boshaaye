import { getWallets } from '@/lib/data/wallets'
import { getCategories } from '@/lib/data/categories'
import { getCurrentAllocation } from '@/lib/data/allocation'
import { getTransactionById } from '@/lib/data/transactions'
import TransactionForm from '@/components/TransactionForm'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Edit Transaction — Boshaaye Finance'
}

export default async function EditTransactionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [wallets, categories, currentAllocation, transaction] = await Promise.all([
    getWallets(),
    getCategories(),
    getCurrentAllocation(),
    getTransactionById(id)
  ])

  if (!transaction) return notFound()

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <div className="mb-6 border-b border-[var(--color-surface-border)] pb-4">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Edit Transaction</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">Modifying history actively rewrites budgets and balances.</p>
      </div>

      <TransactionForm 
        wallets={wallets} 
        categories={categories} 
        currentAllocation={currentAllocation}
        initialData={transaction}
      />
    </main>
  )
}
