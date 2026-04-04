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
  // Fee fields
  fee_amount?: number
  fee_category_id?: string
  fee_funding_source?: 'main_budget' | 'ops_box'
}

export type ActionResult = { success: true } | { success: false; error: string }

export async function createTransfer(input: TransferInput): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (input.from_wallet_id === input.to_wallet_id) {
      return { success: false, error: 'Cannot transfer to the same wallet' }
    }

    const hasFee = (input.fee_amount ?? 0) > 0

    let feeTransactionId: string | null = null

    if (hasFee) {
      // Create the fee expense transaction first (on the From Wallet)
      const { data: feeTx, error: feeTxError } = await supabase
        .from('transactions')
        .insert({
          date:                   input.date,
          type:                   'expense',
          title:                  `Transfer fee`,
          amount:                 input.fee_amount!,
          currency:               input.currency,
          wallet_id:              input.from_wallet_id,
          category_id:            input.fee_category_id || null,
          notes:                  input.notes ? `Fee for transfer: ${input.notes}` : 'Transfer fee',
          is_client_income:       false,
          expense_funding_source: input.fee_funding_source || 'main_budget',
          created_by_user_id:     user?.id,
          created_by_email:       user?.email,
        })
        .select('id')
        .single()

      if (feeTxError || !feeTx) {
        return { success: false, error: `Failed to create fee transaction: ${feeTxError?.message}` }
      }
      feeTransactionId = feeTx.id
    }

    const { error } = await supabase.from('transfers').insert({
      date:               input.date,
      from_wallet_id:     input.from_wallet_id,
      to_wallet_id:       input.to_wallet_id,
      amount:             input.amount,
      currency:           input.currency,
      notes:              input.notes || null,
      created_by_user_id: user?.id,
      created_by_email:   user?.email,
      fee_amount:         hasFee ? input.fee_amount! : null,
      fee_category_id:    hasFee ? (input.fee_category_id || null) : null,
      fee_funding_source: hasFee ? (input.fee_funding_source || 'main_budget') : null,
      fee_transaction_id: feeTransactionId,
    })

    if (error) {
      // Rollback fee transaction if transfer insert failed
      if (feeTransactionId) {
        await supabase.from('transactions').delete().eq('id', feeTransactionId)
      }
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard')
    revalidatePath('/transfers')
    revalidatePath('/transactions')
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

    // Fetch the current transfer to get the old fee transaction id
    const { data: currentTransfer } = await supabase
      .from('transfers')
      .select('fee_transaction_id')
      .eq('id', id)
      .single()

    const oldFeeTransactionId = currentTransfer?.fee_transaction_id ?? null
    const hasFee = (input.fee_amount ?? 0) > 0
    let newFeeTransactionId: string | null = null

    // Delete the old fee transaction (if any) — we always recreate to keep values in sync
    if (oldFeeTransactionId) {
      await supabase.from('transactions').delete().eq('id', oldFeeTransactionId)
    }

    if (hasFee) {
      // Create a new fee expense transaction
      const { data: feeTx, error: feeTxError } = await supabase
        .from('transactions')
        .insert({
          date:                   input.date,
          type:                   'expense',
          title:                  `Transfer fee`,
          amount:                 input.fee_amount!,
          currency:               input.currency,
          wallet_id:              input.from_wallet_id,
          category_id:            input.fee_category_id || null,
          notes:                  input.notes ? `Fee for transfer: ${input.notes}` : 'Transfer fee',
          is_client_income:       false,
          expense_funding_source: input.fee_funding_source || 'main_budget',
          updated_by_user_id:     user?.id,
          updated_by_email:       user?.email,
        })
        .select('id')
        .single()

      if (feeTxError || !feeTx) {
        return { success: false, error: `Failed to recreate fee transaction: ${feeTxError?.message}` }
      }
      newFeeTransactionId = feeTx.id
    }

    const { error } = await supabase
      .from('transfers')
      .update({
        date:               input.date,
        from_wallet_id:     input.from_wallet_id,
        to_wallet_id:       input.to_wallet_id,
        amount:             input.amount,
        currency:           input.currency,
        notes:              input.notes || null,
        updated_by_user_id: user?.id,
        updated_by_email:   user?.email,
        fee_amount:         hasFee ? input.fee_amount! : null,
        fee_category_id:    hasFee ? (input.fee_category_id || null) : null,
        fee_funding_source: hasFee ? (input.fee_funding_source || 'main_budget') : null,
        fee_transaction_id: newFeeTransactionId,
      })
      .eq('id', id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/dashboard')
    revalidatePath('/transfers')
    revalidatePath('/transactions')
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unexpected error' }
  }
}

export async function deleteTransfer(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    // Fetch the fee_transaction_id before deleting
    const { data: transfer } = await supabase
      .from('transfers')
      .select('fee_transaction_id')
      .eq('id', id)
      .single()

    // Delete the linked fee expense transaction first
    if (transfer?.fee_transaction_id) {
      await supabase.from('transactions').delete().eq('id', transfer.fee_transaction_id)
    }

    const { error } = await supabase
      .from('transfers')
      .delete()
      .eq('id', id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/dashboard')
    revalidatePath('/transfers')
    revalidatePath('/transactions')
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unexpected error' }
  }
}
