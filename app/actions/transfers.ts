'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type TransferInput = {
  date: string
  from_wallet_id: string
  to_wallet_id: string
  amount: number
  currency: 'USD' | 'IQD'
  notes?: string
}

export type ActionResult = { success: true } | { success: false; error: string }

export async function createTransfer(input: TransferInput): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (input.from_wallet_id === input.to_wallet_id) {
      return { success: false, error: 'Cannot transfer to the same wallet' }
    }

    const { error } = await supabase.from('transfers').insert({
      date: input.date,
      from_wallet_id: input.from_wallet_id,
      to_wallet_id: input.to_wallet_id,
      amount: input.amount,
      currency: input.currency,
      notes: input.notes || null,
      created_by_user_id: user?.id,
      created_by_email: user?.email,
    })

    if (error) return { success: false, error: error.message }

    revalidatePath('/dashboard')
    revalidatePath('/transfers')
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unexpected error' }
  }
}

export async function updateTransfer(id: string, input: TransferInput): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (input.from_wallet_id === input.to_wallet_id) {
      return { success: false, error: 'Cannot transfer to the same wallet' }
    }

    const { error } = await supabase
      .from('transfers')
      .update({
        date: input.date,
        from_wallet_id: input.from_wallet_id,
        to_wallet_id: input.to_wallet_id,
        amount: input.amount,
        currency: input.currency,
        notes: input.notes || null,
        updated_by_user_id: user?.id,
        updated_by_email: user?.email,
      })
      .eq('id', id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/dashboard')
    revalidatePath('/transfers')
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unexpected error' }
  }
}

export async function deleteTransfer(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('transfers')
      .delete()
      .eq('id', id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/dashboard')
    revalidatePath('/transfers')
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unexpected error' }
  }
}
