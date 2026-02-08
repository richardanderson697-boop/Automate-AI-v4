import { createClient } from '@/lib/supabase/server'
import { WorkOrdersClient } from './work-orders-client'

export default async function WorkOrdersPage() {
  const supabase = await createClient()
  
  const { data: workOrders } = await supabase
    .from('work_orders')
    .select('*')
    .order('created_at', { ascending: false })

  return <WorkOrdersClient initialWorkOrders={workOrders || []} />
}
