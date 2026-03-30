import { createClient } from '@/lib/supabase/server'
import type { Wallet } from '@/lib/types'

export async function getWallets(): Promise<Wallet[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('wallets').select('*').order('name')
    if (error || !data) return []
    return data
  } catch {
    return []
  }
}
