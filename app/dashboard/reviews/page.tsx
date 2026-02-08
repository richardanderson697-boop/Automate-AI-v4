import { createClient } from '@/lib/supabase/server'
import { ReviewsClient } from './reviews-client'

export default async function ReviewsPage() {
  const supabase = await createClient()
  
  const { data: requests } = await supabase
    .from('customer_diagnostic_requests')
    .select('*')
    .order('created_at', { ascending: false })

  return <ReviewsClient initialRequests={requests || []} />
}
