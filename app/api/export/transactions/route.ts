import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('transactions')
      .select('*, wallets(name), categories(name)')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error || !data) {
      return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
    }

    const headers = [
      'Date',
      'Title',
      'Type',
      'Category',
      'Wallet',
      'Amount',
      'Currency',
      'Is Client Income',
      'Funding Source',
      'Notes',
      'Created At'
    ].join(',')

    const rows = data.map(row => {
      const escape = (str: any) => `"${String(str || '').replace(/"/g, '""')}"`
      return [
        escape(row.date),
        escape(row.title),
        escape(row.type),
        escape(row.categories?.name || ''),
        escape(row.wallets?.name || ''),
        escape(row.amount),
        escape(row.currency),
        escape(row.is_client_income ? 'Yes' : 'No'),
        escape(row.expense_funding_source || ''),
        escape(row.notes || ''),
        escape(row.created_at)
      ].join(',')
    })

    const csvData = [headers, ...rows].join('\n')

    return new NextResponse(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="transactions_export.csv"',
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
