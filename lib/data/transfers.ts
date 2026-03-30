import { createClient } from '@/lib/supabase'
import type { Transfer, Wallet } from '@/lib/types'

export interface TransferWithWallets extends Transfer {
  from_wallet: Wallet | null
  to_wallet: Wallet | null
}

export async function getTransfers(): Promise<TransferWithWallets[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('transfers')
      .select('*, from_wallet:wallets!from_wallet_id(*), to_wallet:wallets!to_wallet_id(*)')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error || !data) return []
    return data as TransferWithWallets[]
  } catch {
    return []
  }
}

export async function getTransferById(id: string): Promise<Transfer | null> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('transfers')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) return null
    return data as Transfer
  } catch {
    return null
  }
}
