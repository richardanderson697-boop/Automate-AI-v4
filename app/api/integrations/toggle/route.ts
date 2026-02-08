import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    const { platform, isActive } = await request.json()

    await supabase
      .from('organization_integrations')
      .update({ is_active: isActive })
      .eq('organization_id', profile.organization_id)
      .eq('platform', platform)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Toggle integration error:', error)
    return NextResponse.json(
      { error: 'Failed to toggle integration' },
      { status: 500 }
    )
  }
}
