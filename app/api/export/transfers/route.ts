import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('transfers')
      .select('*, from_wallet:wallets!from_wallet_id(name), to_wallet:wallets!to_wallet_id(name)')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error || !data) {
      return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
    }

    const headers = [
      'Date',
      'From Wallet',
      'To Wallet',
      'Amount',
      'Currency',
      'Notes',
      'Created At'
    ].join(',')

    const rows = data.map(row => {
      const escape = (str: any) => `"${String(str || '').replace(/"/g, '""')}"`
      return [
        escape(row.date),
        escape(row.from_wallet?.name || ''),
        escape(row.to_wallet?.name || ''),
        escape(row.amount),
        escape(row.currency),
        escape(row.notes || ''),
        escape(row.created_at)
      ].join(',')
    })

    const csvData = [headers, ...rows].join('\n')

    return new NextResponse(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="transfers_export.csv"',
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
