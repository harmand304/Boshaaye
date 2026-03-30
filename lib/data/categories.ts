import { createClient } from '@/lib/supabase/server'
import type { Category } from '@/lib/types'

export async function getCategories(): Promise<Category[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('categories').select('*').order('name')
    if (error || !data) return []
    return data
  } catch {
    return []
  }
}
