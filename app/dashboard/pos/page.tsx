import { createClient } from '@/lib/supabase/server'
import { POSClient } from './pos-client'

export default async function POSPage() {
  const supabase = await createClient()
  
  const { data: parts } = await supabase
    .from('parts')
    .select('*')
    .order('name')

  return <POSClient parts={parts || []} />
}
