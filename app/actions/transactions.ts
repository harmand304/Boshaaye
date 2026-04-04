'use server'

import { createClient } from '@/lib/supabase/server'
import { getAllocationForDate } from '@/lib/data/allocation'
import { revalidatePath } from 'next/cache'

export type TransactionInput = {
  date: string
  type: 'income' | 'expense' | 'investment' | 'adjustment'
  title: string
  amount: number
  currency: 'USD' | 'IQD'
  wallet_id: string
  category_id?: string
  notes?: string
  is_client_income: boolean
  expense_funding_source?: 'ops_box' | 'main_budget'
  // Receipt fields
  receipt_url?: string | null
  receipt_file_name?: string | null
  receipt_mime_type?: string | null
  receipt_uploaded_at?: string | null
  receipt_storage_path?: string | null  // internal, used for delete ops
}

export type ActionResult = { success: true } | { success: false; error: string }

export async function createTransaction(input: TransactionInput): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Build allocation snapshot if this is a client income
    let alloc: Record<string, number | null> = {
      alloc_savings_pct: null,
      alloc_ops_pct: null,
      alloc_harmand_pct: null,
      alloc_bako_pct: null,
      alloc_savings_amount: null,
      alloc_ops_amount: null,
      alloc_harmand_amount: null,
      alloc_bako_amount: null,
    }

    if (input.type === 'income' && input.is_client_income) {
      const settings = await getAllocationForDate(input.date)
      if (!settings) {
        return { success: false, error: 'No allocation settings found for this date. Please add allocation settings first.' }
      }
      alloc = {
        alloc_savings_pct:    settings.savings_pct,
        alloc_ops_pct:        settings.ops_pct,
        alloc_harmand_pct:    settings.harmand_pct,
        alloc_bako_pct:       settings.bako_pct,
        alloc_savings_amount: (input.amount * settings.savings_pct)  / 100,
        alloc_ops_amount:     (input.amount * settings.ops_pct)      / 100,
        alloc_harmand_amount: (input.amount * settings.harmand_pct)  / 100,
        alloc_bako_amount:    (input.amount * settings.bako_pct)     / 100,
      }
    }

    const { error } = await supabase.from('transactions').insert({
      date:                   input.date,
      type:                   input.type,
      title:                  input.title,
      amount:                 input.amount,
      currency:               input.currency,
      wallet_id:              input.wallet_id,
      category_id:            input.category_id || null,
      notes:                  input.notes || null,
      is_client_income:       input.is_client_income,
      expense_funding_source: input.expense_funding_source || null,
      created_by_user_id:     user?.id,
      created_by_email:       user?.email,
      receipt_url:            input.receipt_url || null,
      receipt_file_name:      input.receipt_file_name || null,
      receipt_mime_type:      input.receipt_mime_type || null,
      receipt_uploaded_at:    input.receipt_uploaded_at || null,
      ...alloc,
    })

    if (error) return { success: false, error: error.message }

    revalidatePath('/dashboard')
    revalidatePath('/transactions')
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unexpected error' }
  }
}

export async function updateTransaction(id: string, input: TransactionInput): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let alloc: Record<string, number | null> = {
      alloc_savings_pct: null,
      alloc_ops_pct: null,
      alloc_harmand_pct: null,
      alloc_bako_pct: null,
      alloc_savings_amount: null,
      alloc_ops_amount: null,
      alloc_harmand_amount: null,
      alloc_bako_amount: null,
    }

    if (input.type === 'income' && input.is_client_income) {
      const settings = await getAllocationForDate(input.date)
      if (!settings) {
        return { success: false, error: 'No allocation settings found for this date.' }
      }
      alloc = {
        alloc_savings_pct:    settings.savings_pct,
        alloc_ops_pct:        settings.ops_pct,
        alloc_harmand_pct:    settings.harmand_pct,
        alloc_bako_pct:       settings.bako_pct,
        alloc_savings_amount: (input.amount * settings.savings_pct)  / 100,
        alloc_ops_amount:     (input.amount * settings.ops_pct)      / 100,
        alloc_harmand_amount: (input.amount * settings.harmand_pct)  / 100,
        alloc_bako_amount:    (input.amount * settings.bako_pct)     / 100,
      }
    }

    const { error } = await supabase
      .from('transactions')
      .update({
        date:                   input.date,
        type:                   input.type,
        title:                  input.title,
        amount:                 input.amount,
        currency:               input.currency,
        wallet_id:              input.wallet_id,
        category_id:            input.category_id || null,
        notes:                  input.notes || null,
        is_client_income:       input.is_client_income,
        expense_funding_source: input.expense_funding_source || null,
        updated_by_user_id:     user?.id,
        updated_by_email:       user?.email,
        receipt_url:            input.receipt_url ?? null,
        receipt_file_name:      input.receipt_file_name ?? null,
        receipt_mime_type:      input.receipt_mime_type ?? null,
        receipt_uploaded_at:    input.receipt_uploaded_at ?? null,
        ...alloc,
      })
      .eq('id', id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/dashboard')
    revalidatePath('/transactions')
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unexpected error' }
  }
}

export async function deleteTransaction(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    // Fetch receipt path before deleting so we can clean up storage
    const { data: tx } = await supabase
      .from('transactions')
      .select('receipt_url, receipt_file_name')
      .eq('id', id)
      .single()

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)

    if (error) return { success: false, error: error.message }

    // Best-effort receipt cleanup — extract the storage path from the signed URL
    if (tx?.receipt_url) {
      try {
        // The storage path is embedded in the signed URL as /object/sign/receipts/{path}?token=...
        const match = tx.receipt_url.match(/\/object\/sign\/receipts\/(.+?)\?/)
        if (match?.[1]) {
          const storagePath = decodeURIComponent(match[1])
          await supabase.storage.from('receipts').remove([storagePath])
        }
      } catch {
        // Non-fatal — orphan files are acceptable
      }
    }

    revalidatePath('/dashboard')
    revalidatePath('/transactions')
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unexpected error' }
  }
}
