import { createClient } from '@/lib/supabase'
import type { Wallet } from '@/lib/types'

export async function getWallets(): Promise<Wallet[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.from('wallets').select('*').order('name')
    if (error || !data) return []
    return data
  } catch {
    return []
  }
}
