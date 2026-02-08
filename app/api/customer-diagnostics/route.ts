import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateDiagnosis } from '@/lib/rag-service'

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] Customer diagnostics API called')
    
    const body = await request.json()
    console.log('[v0] Request body:', JSON.stringify(body))
    
    const supabase = await createClient()

    // Validate required fields
    if (!body.customerName || !body.customerEmail || !body.description) {
      console.log('[v0] Missing required fields')
      return NextResponse.json(
        { error: 'Missing required fields: name, email, and description are required' },
        { status: 400 }
      )
    }

    // Extract customer and vehicle info from JSON
    const customerName = body.customerName
    const customerEmail = body.customerEmail
    const customerPhone = body.customerPhone || ''
    const vehicleYear = parseInt(body.vehicleYear) || new Date().getFullYear()
    const vehicleMake = body.vehicleMake || 'Unknown'
    const vehicleModel = body.vehicleModel || 'Unknown'
    const description = body.description

    console.log('[v0] Processing diagnostic for:', { customerName, vehicleMake, vehicleModel })

    // Generate AI diagnosis with fallback if it fails
    let diagnosis = {
      diagnosis: 'Diagnostic analysis pending. A mechanic will review your request shortly.',
      recommendedParts: [],
      estimatedCost: 0,
      confidence: 50
    }

    try {
      const vehicleInfo = { year: vehicleYear, make: vehicleMake, model: vehicleModel }
      const aiDiagnosis = await generateDiagnosis(description, vehicleInfo)
      diagnosis = aiDiagnosis
      console.log('[v0] AI diagnosis generated successfully')
    } catch (diagnosisError) {
      console.error('[v0] AI diagnosis failed (using fallback):', diagnosisError)
    }

    // Find educational videos (optional - don't fail if this errors)
    let videos = []
    try {
      const videosResponse = await fetch(`${request.nextUrl.origin}/api/videos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diagnosis: diagnosis.diagnosis,
          symptoms: [description],
          vehicleInfo: { year: vehicleYear, make: vehicleMake, model: vehicleModel },
        }),
      })

      if (videosResponse.ok) {
        const videosData = await videosResponse.json()
        videos = videosData.videos || []
        console.log('[v0] Found', videos.length, 'educational videos')
      }
    } catch (videoError) {
      console.error('[v0] Video fetch failed (non-critical):', videoError)
    }

    // Store diagnostic request in database
    console.log('[v0] Saving to database...')
    const { data: savedRequest, error: dbError } = await supabase
      .from('customer_diagnostic_requests')
      .insert({
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        vehicle_year: vehicleYear,
        vehicle_make: vehicleMake,
        vehicle_model: vehicleModel,
        symptoms_text: description, // Use correct column name
        symptoms_image_urls: [], // Empty array for now
        symptoms_audio_url: null,
        ai_diagnosis: { // Store as JSON object
          diagnosis: diagnosis.diagnosis,
          recommendedParts: diagnosis.recommendedParts,
          estimatedCost: diagnosis.estimatedCost,
          confidence: diagnosis.confidence,
          videos: videos,
        },
        ai_confidence: diagnosis.confidence,
        estimated_total: diagnosis.estimatedCost,
        status: 'pending_review',
      })
      .select()
      .single()

    if (dbError) {
      console.error('[v0] Database error:', dbError)
      throw new Error(`Database error: ${dbError.message}`)
    }

    console.log('[v0] Request saved successfully with ID:', savedRequest.id)

    // Return success response
    return NextResponse.json({
      requestId: savedRequest.id,
      diagnosis: diagnosis.diagnosis,
      recommendedParts: diagnosis.recommendedParts,
      estimatedCost: diagnosis.estimatedCost,
      confidence: diagnosis.confidence,
      videos: videos,
      statusUrl: `/customer/status/${savedRequest.id}`,
    })
  } catch (error) {
    console.error('[v0] CRITICAL ERROR processing diagnostic request:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { 
        error: 'Failed to process diagnostic request',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}
