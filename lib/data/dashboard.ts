import { createClient } from '@/lib/supabase'
import type { Transaction, Currency, Wallet, Transfer } from '@/lib/types'

export interface ChartCategoryData {
  name: string
  amount: number
}

export interface ChartTrendData {
  month: string // e.g. "Jan 25"
  sortKey: string // for chronological sorting
  income: number
  expense: number
}

export interface CurrencyStats {
  capitalInvested: number
  clientIncome: number
  totalExpenses: number
  mainBudget: number
  savingsBox: number
  opsBox: number
  harmandCut: number
  bakoCut: number
  expenseCategories: ChartCategoryData[]
  trendData: ChartTrendData[]
}

export interface WalletBalance {
  walletId: string
  name: string
  currency: Currency
  balance: number
}

export interface DashboardStats {
  USD: CurrencyStats
  IQD: CurrencyStats
  wallets: WalletBalance[]
}

const EMPTY_STATS: CurrencyStats = {
  capitalInvested: 0,
  clientIncome: 0,
  totalExpenses: 0,
  mainBudget: 0,
  savingsBox: 0,
  opsBox: 0,
  harmandCut: 0,
  bakoCut: 0,
  expenseCategories: [],
  trendData: [],
}

function computeStats(transactions: Transaction[], currency: Currency): CurrencyStats {
  const tx = transactions.filter((t) => t.currency === currency)

  const capitalInvested = tx
    .filter((t) => t.type === 'investment')
    .reduce((sum, t) => sum + t.amount, 0)

  const clientIncome = tx
    .filter((t) => t.type === 'income' && t.is_client_income)
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = tx
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const opsAllocation = tx
    .filter((t) => t.is_client_income)
    .reduce((sum, t) => sum + (t.alloc_ops_amount ?? 0), 0)

  const mainBudget = capitalInvested + opsAllocation - totalExpenses

  const savingsBox = tx
    .filter((t) => t.is_client_income)
    .reduce((sum, t) => sum + (t.alloc_savings_amount ?? 0), 0)

  const opsExpenses = tx
    .filter((t) => t.type === 'expense' && t.expense_funding_source === 'ops_box')
    .reduce((sum, t) => sum + t.amount, 0)
  const opsBox = opsAllocation - opsExpenses

  const harmandCut = tx
    .filter((t) => t.is_client_income)
    .reduce((sum, t) => sum + (t.alloc_harmand_amount ?? 0), 0)

  const bakoCut = tx
    .filter((t) => t.is_client_income)
    .reduce((sum, t) => sum + (t.alloc_bako_amount ?? 0), 0)

  // -- Charts Data Formatting --
  
  // 1. Expenses by Category
  const expenseTx = tx.filter(t => t.type === 'expense')
  const catMap = new Map<string, number>()
  
  // We need categories name. Since transactions coming here don't have expanded categories, 
  // wait we do have them if we select them! Let me ensure I update the selector in getDashboardStats.
  // Actually, standard transactions for dashboard don't have expanded categories in current select('*').
  // I will fallback to category_id text if name is missing, but I need to modify the select in getDashboardStats first.

  expenseTx.forEach(t => {
     // @ts-expect-error adding categories relation safely
     const name = t.categories?.name || 'Uncategorized'
     catMap.set(name, (catMap.get(name) || 0) + t.amount)
  })
  
  const expenseCategories = Array.from(catMap.entries())
     .map(([name, amount]) => ({ name, amount }))
     .sort((a, b) => b.amount - a.amount)

  // 2. Trend (Income vs Expense) by Month
  const trMap = new Map<string, ChartTrendData>()
  
  tx.forEach(t => {
     if (t.type !== 'income' && t.type !== 'expense') return
     
     // t.date is 'YYYY-MM-DD'
     const d = new Date(t.date)
     const monthStr = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) // e.g. "Jan 25"
     const sortKey = t.date.substring(0, 7) // "YYYY-MM"
     
     if (!trMap.has(sortKey)) {
        trMap.set(sortKey, { month: monthStr, sortKey, income: 0, expense: 0 })
     }
     
     const node = trMap.get(sortKey)!
     if (t.type === 'income') node.income += t.amount
     if (t.type === 'expense') node.expense += t.amount
  })

  // Sort chronologically ascending
  const trendData = Array.from(trMap.values()).sort((a, b) => a.sortKey.localeCompare(b.sortKey))

  return {
    capitalInvested,
    clientIncome,
    totalExpenses,
    mainBudget,
    savingsBox,
    opsBox,
    harmandCut,
    bakoCut,
    expenseCategories,
    trendData,
  }
}

function computeWalletBalances(wallets: Wallet[], transactions: Transaction[], transfers: Transfer[]): WalletBalance[] {
  return wallets.map(wallet => {
    // 1. Transactions directly attached to this wallet
    const walletTx = transactions.filter(t => t.wallet_id === wallet.id)
    
    // Inflows (income, investment, adjustments)
    const inflows = walletTx
       .filter(t => t.type === 'income' || t.type === 'investment' || t.type === 'adjustment')
       .reduce((sum, t) => sum + t.amount, 0)
       
    // Outflows (expenses)
    const outflows = walletTx
       .filter(t => t.type === 'expense')
       .reduce((sum, t) => sum + t.amount, 0)

    // 2. Transfers involving this wallet
    const transfersIn = transfers
       .filter(t => t.to_wallet_id === wallet.id)
       .reduce((sum, t) => sum + t.amount, 0)
       
    const transfersOut = transfers
       .filter(t => t.from_wallet_id === wallet.id)
       .reduce((sum, t) => sum + t.amount, 0)

    const balance = inflows - outflows + transfersIn - transfersOut

    return {
      walletId: wallet.id,
      name: wallet.name,
      currency: wallet.currency,
      balance
    }
  })
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const supabase = createClient()

    // Fetch all required data in parallel
    const [
       { data: transactions, error: txError },
       { data: wallets, error: wError },
       { data: transfers, error: tfError }
    ] = await Promise.all([
       supabase.from('transactions').select('*, categories(*)'),
       supabase.from('wallets').select('*').order('name'),
       supabase.from('transfers').select('*')
    ])

    if (txError || wError || tfError || !transactions || !wallets || !transfers) {
      return { USD: EMPTY_STATS, IQD: EMPTY_STATS, wallets: [] }
    }

    return {
      USD: computeStats(transactions, 'USD'),
      IQD: computeStats(transactions, 'IQD'),
      wallets: computeWalletBalances(wallets, transactions, transfers)
    }
  } catch {
    return { USD: { ...EMPTY_STATS }, IQD: { ...EMPTY_STATS }, wallets: [] }
  }
}
