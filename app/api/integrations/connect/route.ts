import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { IntegrationManager } from '@/lib/integrations/manager'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile?.organization_id) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 })
    }

    const { platform, config } = await request.json()

    const manager = new IntegrationManager(supabase, profile.organization_id)
    const integration = await manager.connect(platform, config)

    return NextResponse.json({ integration })
  } catch (error) {
    console.error('Integration connection error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to connect integration' },
      { status: 500 }
    )
  }
}
