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

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/dashboard')
    revalidatePath('/transactions')
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unexpected error' }
  }
}
