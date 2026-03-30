import { getWallets } from '@/lib/data/wallets'
import { getTransferById } from '@/lib/data/transfers'
import TransferForm from '@/components/TransferForm'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Edit Transfer — Boshaaye Finance'
}

export default async function EditTransferPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [wallets, transfer] = await Promise.all([
    getWallets(),
    getTransferById(id)
  ])

  if (!transfer) return notFound()

  return (
    <main className="p-6 max-w-2xl mx-auto space-y-8">
      <div className="border-b border-[var(--color-surface-border)] pb-4">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Edit Transfer</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">Wallet balances calculate dynamically, changing transfers will update balances immediately.</p>
      </div>

      <TransferForm 
        wallets={wallets} 
        initialData={transfer}
      />
    </main>
  )
}
