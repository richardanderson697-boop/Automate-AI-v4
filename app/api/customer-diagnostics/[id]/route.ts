import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status, mechanicNotes, finalDiagnosis } = await request.json()
    const supabase = await createClient()

    console.log('[v0] Updating diagnostic request:', params.id, { status })

    const { data, error } = await supabase
      .from('customer_diagnostic_requests')
      .update({
        status,
        mechanic_notes: mechanicNotes,
        final_diagnosis: finalDiagnosis,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    console.log('[v0] Diagnostic request updated successfully')

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('[v0] Update error:', error)
    return NextResponse.json(
      { error: 'Failed to update request' },
      { status: 500 }
    )
  }
}
