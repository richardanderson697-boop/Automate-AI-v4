import { createClient } from '@/lib/supabase/server'
import { IntegrationsClient } from './integrations-client'

export default async function IntegrationsPage() {
  const supabase = await createClient()
  
  const { data: integrations } = await supabase
    .from('organization_integrations')
    .select('*')
    .order('created_at', { ascending: false })

  return <IntegrationsClient initialIntegrations={integrations || []} />
}
