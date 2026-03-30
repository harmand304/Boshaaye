'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type AllocationInput = {
  effective_from: string
  savings_pct: number
  ops_pct: number
  harmand_pct: number
  bako_pct: number
}

export type ActionResult = { success: true } | { success: false; error: string }

export async function createAllocationSetting(input: AllocationInput): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const total = input.savings_pct + input.ops_pct + input.harmand_pct + input.bako_pct
    if (total !== 100) {
      return { success: false, error: `Percentages must total exactly 100 (currently ${total})` }
    }

    const { error } = await supabase.from('allocation_settings').insert({
      effective_from: input.effective_from,
      savings_pct: input.savings_pct,
      ops_pct: input.ops_pct,
      harmand_pct: input.harmand_pct,
      bako_pct: input.bako_pct,
      created_by_user_id: user?.id,
      created_by_email: user?.email,
    })

    if (error) {
       if (error.code === '23505') {
          return { success: false, error: 'A setting already exists for this exact date.' }
       }
       return { success: false, error: error.message }
    }

    revalidatePath('/dashboard')
    revalidatePath('/settings')
    revalidatePath('/transactions/add') // since new transactions read active settings
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unexpected error' }
  }
}
