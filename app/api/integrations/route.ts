import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { IntegrationManager } from '@/lib/integrations/manager'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: integrations, error } = await supabase
      .from('shop_integrations')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ integrations })
  } catch (error) {
    console.error('[v0] Error fetching integrations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch integrations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { provider, credentials } = await request.json()

    // Get user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile?.organization_id) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    // Check if integration already exists
    const { data: existing } = await supabase
      .from('shop_integrations')
      .select('id')
      .eq('organization_id', profile.organization_id)
      .eq('provider', provider)
      .single()

    if (existing) {
      // Update existing integration
      const { error: updateError } = await supabase
        .from('shop_integrations')
        .update({
          credentials: credentials,
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)

      if (updateError) throw updateError
    } else {
      // Create new integration
      const { error: insertError } = await supabase
        .from('shop_integrations')
        .insert({
          organization_id: profile.organization_id,
          provider,
          credentials,
          is_active: true,
        })

      if (insertError) throw insertError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error saving integration:', error)
    return NextResponse.json(
      { error: 'Failed to save integration' },
      { status: 500 }
    )
  }
}
