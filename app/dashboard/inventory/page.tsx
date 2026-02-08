import { createClient } from '@/lib/supabase/server'
import { InventoryClient } from './inventory-client'

export default async function InventoryPage() {
  const supabase = await createClient()
  
  const { data: parts } = await supabase
    .from('parts')
    .select('*')
    .order('name')

  return <InventoryClient initialParts={parts || []} />
}
