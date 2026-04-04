export type Currency = 'USD' | 'IQD'

export type TransactionType = 'income' | 'expense' | 'investment' | 'adjustment'

export type FundingSource = 'ops_box' | 'main_budget'

export interface Wallet {
  id: string
  name: string
  currency: Currency
  created_at: string
}

export interface Category {
  id: string
  name: string
  type: TransactionType
  created_at: string
}

export interface AllocationSettings {
  id: string
  savings_pct: number
  ops_pct: number
  harmand_pct: number
  bako_pct: number
  effective_from: string
  created_at: string
  created_by_user_id?: string | null
  created_by_email?: string | null
  updated_by_user_id?: string | null
  updated_by_email?: string | null
}

export interface Transaction {
  id: string
  date: string
  type: TransactionType
  title: string
  amount: number
  currency: Currency
  wallet_id: string
  category_id: string | null
  notes: string | null
  is_client_income: boolean
  expense_funding_source: FundingSource | null
  // Allocation snapshot (populated only when is_client_income = true)
  alloc_savings_pct: number | null
  alloc_ops_pct: number | null
  alloc_harmand_pct: number | null
  alloc_bako_pct: number | null
  alloc_savings_amount: number | null
  alloc_ops_amount: number | null
  alloc_harmand_amount: number | null
  alloc_bako_amount: number | null
  created_at: string
  created_by_user_id?: string | null
  created_by_email?: string | null
  updated_by_user_id?: string | null
  updated_by_email?: string | null
  // Receipt
  receipt_url?: string | null
  receipt_file_name?: string | null
  receipt_mime_type?: string | null
  receipt_uploaded_at?: string | null
}

export interface Transfer {
  id: string
  date: string
  from_wallet_id: string
  to_wallet_id: string
  amount: number
  currency: Currency
  notes: string | null
  created_at: string
  created_by_user_id?: string | null
  created_by_email?: string | null
  updated_by_user_id?: string | null
  updated_by_email?: string | null
  // Fee
  fee_amount?: number | null
  fee_category_id?: string | null
  fee_funding_source?: 'main_budget' | 'ops_box' | null
  fee_transaction_id?: string | null
}
