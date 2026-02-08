import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateDiagnosis } from '@/lib/rag-service'

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] Customer diagnostics API called')
    
    const contentType = request.headers.get('content-type')
    let customerName, customerEmail, customerPhone, vehicleYear, vehicleMake, vehicleModel, description
    let imageFiles: File[] = []
    let audioFile: File | null = null
    
    if (contentType?.includes('multipart/form-data')) {
      // Handle FormData (with files)
      const formData = await request.formData()
      console.log('[v0] FormData received')
      
      customerName = formData.get('customerName') as string
      customerEmail = formData.get('customerEmail') as string
      customerPhone = formData.get('customerPhone') as string || ''
      vehicleYear = parseInt(formData.get('vehicleYear') as string) || new Date().getFullYear()
      vehicleMake = formData.get('vehicleMake') as string || 'Unknown'
      vehicleModel = formData.get('vehicleModel') as string || 'Unknown'
      description = formData.get('description') as string
      
      // Extract files
      const images = formData.getAll('image')
      imageFiles = images.filter(f => f instanceof File) as File[]
      audioFile = formData.get('audio') as File | null
      
      console.log('[v0] Files received:', { images: imageFiles.length, audio: !!audioFile })
    } else {
      // Handle JSON (no files)
      const body = await request.json()
      console.log('[v0] JSON body received')
      
      customerName = body.customerName
      customerEmail = body.customerEmail
      customerPhone = body.customerPhone || ''
      vehicleYear = parseInt(body.vehicleYear) || new Date().getFullYear()
      vehicleMake = body.vehicleMake || 'Unknown'
      vehicleModel = body.vehicleModel || 'Unknown'
      description = body.description
    }
    
    const supabase = await createClient()

    // Validate required fields
    if (!customerName || !customerEmail || !description) {
      console.log('[v0] Missing required fields')
      return NextResponse.json(
        { error: 'Missing required fields: name, email, and description are required' },
        { status: 400 }
      )
    }

    console.log('[v0] Processing diagnostic for:', { customerName, vehicleMake, vehicleModel })

    // Upload files to Supabase Storage if present
    const imageUrls: string[] = []
    let audioUrl: string | null = null
    
    if (imageFiles.length > 0) {
      console.log('[v0] Uploading', imageFiles.length, 'images to storage...')
      for (const [index, file] of imageFiles.entries()) {
        const fileName = `${Date.now()}_${index}_${file.name}`
        const { data, error } = await supabase.storage
          .from('diagnostic-media')
          .upload(`images/${fileName}`, file)
        
        if (!error && data) {
          const { data: { publicUrl } } = supabase.storage
            .from('diagnostic-media')
            .getPublicUrl(data.path)
          imageUrls.push(publicUrl)
        }
      }
      console.log('[v0] Uploaded', imageUrls.length, 'images successfully')
    }
    
    if (audioFile) {
      console.log('[v0] Uploading audio file to storage...')
      const fileName = `${Date.now()}_${audioFile.name}`
      const { data, error } = await supabase.storage
        .from('diagnostic-media')
        .upload(`audio/${fileName}`, audioFile)
      
      if (!error && data) {
        const { data: { publicUrl } } = supabase.storage
          .from('diagnostic-media')
          .getPublicUrl(data.path)
        audioUrl = publicUrl
        console.log('[v0] Audio uploaded successfully')
      }
    }

    // Build enriched description with media context for AI
    let enrichedDescription = description
    if (imageUrls.length > 0) {
      enrichedDescription += `\n\n[Customer provided ${imageUrls.length} photo(s) of the issue]`
    }
    if (audioUrl) {
      enrichedDescription += `\n[Customer provided audio recording of the issue]`
    }

    // Generate AI diagnosis with fallback if it fails
    let diagnosis = {
      diagnosis: 'Diagnostic analysis pending. A mechanic will review your request shortly.',
      recommendedParts: [],
      estimatedCost: 0,
      confidence: 50
    }

    try {
      console.log('[v0] Calling AI diagnosis with:', { description: enrichedDescription, vehicleYear, vehicleMake, vehicleModel })
      console.log('[v0] GEMINI_API_KEY available:', !!process.env.GEMINI_API_KEY)
      
      const vehicleInfo = { year: vehicleYear, make: vehicleMake, model: vehicleModel }
      const aiDiagnosis = await generateDiagnosis(enrichedDescription, vehicleInfo)
      diagnosis = aiDiagnosis
      console.log('[v0] AI diagnosis generated:', diagnosis)
    } catch (diagnosisError) {
      console.error('[v0] AI diagnosis failed (using fallback):', diagnosisError)
      console.error('[v0] Error stack:', diagnosisError instanceof Error ? diagnosisError.stack : 'No stack trace')
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
        symptoms_text: description,
        symptoms_image_urls: imageUrls,
        symptoms_audio_url: audioUrl,
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
