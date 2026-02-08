import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { cart, paymentMethod } = await request.json()
    const supabase = await createClient()

    console.log('[v0] Processing checkout:', { cartItems: cart.length, paymentMethod })

    // Get user's organization
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

    // Calculate total
    const total = cart.reduce((sum: number, item: any) => 
      sum + (item.price * item.quantity), 0
    )

    // Create sale record
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert({
        organization_id: profile.organization_id,
        total,
        payment_method: paymentMethod,
        status: 'completed',
      })
      .select()
      .single()

    if (saleError) throw saleError

    console.log('[v0] Sale created:', sale.id)

    // Update inventory quantities
    for (const item of cart) {
      await supabase.rpc('decrement_part_quantity', {
        part_id: item.partId,
        qty: item.quantity,
      })
    }

    return NextResponse.json({ 
      success: true, 
      saleId: sale.id,
      total 
    })
  } catch (error) {
    console.error('[v0] Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to process sale' },
      { status: 500 }
    )
  }
}
