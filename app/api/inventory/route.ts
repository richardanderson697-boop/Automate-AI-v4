import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { name, partNumber, quantity, price, lowStockThreshold } = await request.json()
    const supabase = await createClient()

    console.log('[v0] Adding new part:', { name, partNumber })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    const { data, error } = await supabase
      .from('parts')
      .insert({
        organization_id: profile?.organization_id,
        name,
        part_number: partNumber,
        quantity,
        price,
        low_stock_threshold: lowStockThreshold || 10,
      })
      .select()
      .single()

    if (error) throw error

    console.log('[v0] Part added successfully:', data.id)

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('[v0] Add part error:', error)
    return NextResponse.json(
      { error: 'Failed to add part' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, quantity } = await request.json()
    const supabase = await createClient()

    console.log('[v0] Updating part quantity:', { id, quantity })

    const { data, error } = await supabase
      .from('parts')
      .update({ quantity })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('[v0] Update part error:', error)
    return NextResponse.json(
      { error: 'Failed to update part' },
      { status: 500 }
    )
  }
}
