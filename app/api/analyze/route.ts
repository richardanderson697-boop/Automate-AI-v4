import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { generateDiagnosis } from '@/lib/rag-service'
import { findEducationalVideos } from '@/lib/video-search'

// Pocket Mechanic AI Analysis API - v1.0.1
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const vehicleYear = parseInt(formData.get('vehicleYear') as string) || new Date().getFullYear()
    const vehicleMake = formData.get('vehicleMake') as string || 'Unknown'
    const vehicleModel = formData.get('vehicleModel') as string || 'Unknown'
    const description = formData.get('description') as string
    
    if (!description) {
      return NextResponse.json({ error: 'Problem description is required' }, { status: 400 })
    }

    // Extract files
    const images = formData.getAll('image')
    const imageFiles = images.filter(f => f instanceof File) as File[]
    const audioFile = formData.get('audio') as File | null
    
    // Use service role to bypass RLS for anonymous submissions
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Upload files to Supabase Storage
    const imageUrls: string[] = []
    let audioUrl: string | null = null
    
    if (imageFiles.length > 0) {
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
    }
    
    if (audioFile) {
      const fileName = `${Date.now()}_${audioFile.name}`
      const { data, error } = await supabase.storage
        .from('diagnostic-media')
        .upload(`audio/${fileName}`, audioFile)
      
      if (!error && data) {
        const { data: { publicUrl } } = supabase.storage
          .from('diagnostic-media')
          .getPublicUrl(data.path)
        audioUrl = publicUrl
      }
    }

    // Build enriched description with media context
    let enrichedDescription = description
    if (imageUrls.length > 0) {
      enrichedDescription += `\n\n[Customer provided ${imageUrls.length} photo(s) of the issue]`
    }
    if (audioUrl) {
      enrichedDescription += `\n[Customer provided audio recording of the issue]`
    }

    // Generate AI diagnosis
    let diagnosis
    try {
      const vehicleInfo = { year: vehicleYear, make: vehicleMake, model: vehicleModel }
      diagnosis = await generateDiagnosis(enrichedDescription, vehicleInfo)
    } catch (error) {
      console.error('[v0] AI diagnosis failed:', error)
      diagnosis = {
        diagnosis: 'Analysis pending. Processing your request...',
        recommendedParts: [],
        estimatedCost: 0,
        confidence: 50
      }
    }

    // Search for educational videos
    let videos = []
    try {
      const vehicleInfo = { year: vehicleYear, make: vehicleMake, model: vehicleModel }
      videos = await findEducationalVideos(diagnosis.diagnosis, [description], vehicleInfo)
    } catch (error) {
      console.error('[v0] Video search failed:', error)
    }

    // Save analysis to database (using customer_diagnostic_requests table)
    const { data: savedAnalysis, error: dbError } = await supabase
      .from('customer_diagnostic_requests')
      .insert({
        customer_name: 'Consumer',
        customer_email: 'pending@payment.com',
        customer_phone: '',
        vehicle_year: vehicleYear,
        vehicle_make: vehicleMake,
        vehicle_model: vehicleModel,
        symptoms_text: description,
        symptoms_image_urls: imageUrls,
        symptoms_audio_url: audioUrl,
        ai_diagnosis: {
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
      return NextResponse.json({ error: 'Failed to save analysis' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      analysisId: savedAnalysis.id,
      diagnosis: diagnosis.diagnosis,
      confidence: diagnosis.confidence,
      videos: videos,
    })
  } catch (error) {
    console.error('[v0] Analysis error:', error)
    return NextResponse.json({ error: 'Failed to process analysis' }, { status: 500 })
  }
}
