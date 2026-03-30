import { createClient } from '@/lib/supabase/server'
import type { Transaction, Category, Wallet } from '@/lib/types'

export interface TransactionWithRelations extends Transaction {
  categories: Category | null
  wallets: Wallet | null
}

export interface TransactionQueryParams {
  page?: number
  pageSize?: number
  search?: string
  type?: string
  currency?: string
  wallet_id?: string
  category_id?: string
}

export interface PaginatedTransactions {
  data: TransactionWithRelations[]
  total: number
  totalPages: number
  currentPage: number
}

export async function getTransactions(params?: TransactionQueryParams): Promise<PaginatedTransactions> {
  try {
    const supabase = await createClient()
    const page = params?.page || 1
    const pageSize = params?.pageSize || 20
    const start = (page - 1) * pageSize
    const end = start + pageSize - 1

    let query = supabase
      .from('transactions')
      .select('*, categories(*), wallets(*)', { count: 'exact' })

    // Apply filters
    if (params?.type) query = query.eq('type', params.type)
    if (params?.currency) query = query.eq('currency', params.currency)
    if (params?.wallet_id) query = query.eq('wallet_id', params.wallet_id)
    if (params?.category_id) query = query.eq('category_id', params.category_id)

    // Apply search (checks both title and notes)
    if (params?.search) {
      query = query.or(`title.ilike.%${params.search}%,notes.ilike.%${params.search}%`)
    }

    // Apply ordering and pagination
    query = query
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(start, end)

    const { data, error, count } = await query

    if (error || !data) return { data: [], total: 0, totalPages: 0, currentPage: page }
    
    const totalCount = count || 0
    return {
      data: data as TransactionWithRelations[],
      total: totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page
    }
  } catch {
    return { data: [], total: 0, totalPages: 0, currentPage: 1 }
  }
}

export async function getTransactionById(id: string): Promise<Transaction | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) return null
    return data as Transaction
  } catch {
    return null
  }
}
