import { createClient } from '@/lib/supabase/server'
import type { AllocationSettings } from '@/lib/types'

/**
 * Returns the most recent allocation_settings row effective on or before
 * the given date. Falls back to DEFAULT_ALLOCATION if none found.
 */
export async function getAllocationForDate(date: string): Promise<AllocationSettings | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('allocation_settings')
      .select('*')
      .lte('effective_from', date)
      .order('effective_from', { ascending: false })
      .limit(1)
      .single()
    if (error || !data) return null
    return data
  } catch {
    return null
  }
}

/** Fetch the current active allocation (based on today's date). */
export async function getCurrentAllocation(): Promise<AllocationSettings | null> {
  const today = new Date().toISOString().split('T')[0]
  return getAllocationForDate(today)
}

/** Fetch all allocation settings descending by effective date. */
export async function getAllAllocationSettings(): Promise<AllocationSettings[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('allocation_settings')
      .select('*')
      .order('effective_from', { ascending: false })
      .order('created_at', { ascending: false })
    if (error || !data) return []
    return data
  } catch {
    return []
  }
}
