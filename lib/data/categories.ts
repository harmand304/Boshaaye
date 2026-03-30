import { createClient } from '@/lib/supabase'
import type { Category } from '@/lib/types'

export async function getCategories(): Promise<Category[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.from('categories').select('*').order('name')
    if (error || !data) return []
    return data
  } catch {
    return []
  }
}
