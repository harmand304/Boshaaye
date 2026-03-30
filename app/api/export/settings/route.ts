import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('allocation_settings')
      .select('*')
      .order('effective_from', { ascending: false })
      .order('created_at', { ascending: false })

    if (error || !data) {
      return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
    }

    const headers = [
      'Effective From',
      'Savings %',
      'Ops %',
      'Harmand %',
      'Bako %',
      'Created At'
    ].join(',')

    const rows = data.map(row => {
      const escape = (str: any) => `"${String(str || '').replace(/"/g, '""')}"`
      return [
        escape(row.effective_from),
        escape(row.savings_pct),
        escape(row.ops_pct),
        escape(row.harmand_pct),
        escape(row.bako_pct),
        escape(row.created_at)
      ].join(',')
    })

    const csvData = [headers, ...rows].join('\n')

    return new NextResponse(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="allocation_settings_export.csv"',
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
