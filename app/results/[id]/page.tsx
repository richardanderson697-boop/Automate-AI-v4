import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ResultsClient from './results-client'

export default async function ResultsPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  
  const { data: analysis, error } = await supabase
    .from('customer_diagnostic_requests')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !analysis) {
    notFound()
  }

  return <ResultsClient analysis={analysis} />
}
