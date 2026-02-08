import { NextRequest, NextResponse } from 'next/server'
import { generateDiagnosis } from '@/lib/rag-service'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { type, content, imageData, audioData } = await request.json()

    console.log('[v0] Diagnostics request received:', { type, contentLength: content?.length })

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const userId = user?.id || 'anonymous'

    // Generate AI diagnosis using RAG
    const diagnosis = await generateDiagnosis(content || imageData || audioData || '')

    console.log('[v0] AI Diagnosis result:', diagnosis)

    return NextResponse.json(diagnosis)
  } catch (error: any) {
    console.error('[v0] Error in diagnostics:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate diagnosis' },
      { status: 500 }
    )
  }
}
