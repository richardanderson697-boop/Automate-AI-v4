import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildDiagnosticContext } from '@/lib/rag-service'
import { findEducationalVideos } from '@/lib/video-search'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const supabase = await createClient()

    // Extract customer and vehicle info
    const customerName = formData.get('customerName') as string
    const customerEmail = formData.get('customerEmail') as string
    const customerPhone = formData.get('customerPhone') as string
    const vehicleYear = parseInt(formData.get('vehicleYear') as string)
    const vehicleMake = formData.get('vehicleMake') as string
    const vehicleModel = formData.get('vehicleModel') as string
    const description = formData.get('description') as string
    const imageFile = formData.get('image') as File | null
    const audioFile = formData.get('audio') as File | null

    console.log('[v0] Customer diagnostic request received:', { customerName, vehicleMake, vehicleModel })

    // Build RAG context from description
    const ragContext = await buildDiagnosticContext(description)

    // Generate AI diagnosis (currently mock, will use Gemini with RAG when API key active)
    const diagnosis = await generateDiagnosisWithRAG(description, ragContext)

    console.log('[v0] Generated diagnosis:', diagnosis.diagnosis)

    // Find educational videos based on the actual diagnosis
    const videos = await findEducationalVideos(
      diagnosis.diagnosis,
      [description], // Pass customer's description as symptoms
      { year: vehicleYear, make: vehicleMake, model: vehicleModel }
    )

    console.log('[v0] Found', videos.length, 'relevant educational videos')

    // Store diagnostic request in database
    const { data: request, error } = await supabase
      .from('customer_diagnostic_requests')
      .insert({
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        vehicle_year: vehicleYear,
        vehicle_make: vehicleMake,
        vehicle_model: vehicleModel,
        description: description,
        image_url: imageFile ? await uploadFile(imageFile, supabase) : null,
        audio_data: audioFile ? await uploadFile(audioFile, supabase) : null,
        ai_diagnosis: diagnosis.diagnosis,
        recommended_parts: diagnosis.recommendedParts,
        estimated_cost: diagnosis.estimatedCost,
        confidence_score: diagnosis.confidence,
        educational_videos: videos, // Store video results
        status: 'pending_review',
      })
      .select()
      .single()

    if (error) {
      console.error('[v0] Error saving diagnostic request:', error)
      throw error
    }

    // Return request ID and videos
    return NextResponse.json({
      requestId: request.id,
      diagnosis: diagnosis.diagnosis,
      recommendedParts: diagnosis.recommendedParts,
      estimatedCost: diagnosis.estimatedCost,
      confidence: diagnosis.confidence,
      videos: videos, // Include videos in response
      statusUrl: `/customer/status/${request.id}`,
    })
  } catch (error) {
    console.error('[v0] Customer diagnostics error:', error)
    return NextResponse.json(
      { error: 'Failed to process diagnostic request' },
      { status: 500 }
    )
  }
}

async function generateDiagnosisWithRAG(
  description: string,
  ragContext: string
): Promise<{
  diagnosis: string
  recommendedParts: string[]
  estimatedCost: number
  confidence: number
}> {
  // Check if Gemini API key is available
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    console.log('[v0] No GEMINI_API_KEY - using enhanced mock with RAG context')
    return generateEnhancedMockDiagnosis(description, ragContext)
  }

  // TODO: Implement real Gemini API call with RAG context
  return generateEnhancedMockDiagnosis(description, ragContext)
}

function generateEnhancedMockDiagnosis(
  description: string,
  ragContext: string
): {
  diagnosis: string
  recommendedParts: string[]
  estimatedCost: number
  confidence: number
} {
  const descLower = description.toLowerCase()
  const hasRAG = ragContext && ragContext.length > 100

  // Pattern match common issues
  if (descLower.includes('belt') || descLower.includes('squealing')) {
    return {
      diagnosis: `${hasRAG ? '[RAG-ENHANCED] ' : ''}Belt noise detected. Likely worn serpentine belt or loose tensioner. ${hasRAG ? 'Knowledge base recommends inspecting belt for cracks and checking tensioner spring tension.' : ''}`,
      recommendedParts: [
        'Serpentine Belt - Part #BELT-4060',
        'Belt Tensioner - Part #TENS-300',
      ],
      estimatedCost: 145.0,
      confidence: hasRAG ? 88 : 82,
    }
  }

  if (descLower.includes('crank') || descLower.includes('start')) {
    return {
      diagnosis: `${hasRAG ? '[RAG-ENHANCED] ' : ''}No-start condition. Likely weak battery or failing starter motor. ${hasRAG ? 'Knowledge base suggests testing battery voltage (should be 12.6V) and checking starter draw current.' : ''}`,
      recommendedParts: [
        'Starter Motor - Part #STR-8900',
        'Battery (if load test fails) - Part #BAT-65',
      ],
      estimatedCost: 385.0,
      confidence: hasRAG ? 85 : 78,
    }
  }

  if (descLower.includes('noise') || descLower.includes('sound')) {
    return {
      diagnosis: `${hasRAG ? '[RAG-ENHANCED] ' : ''}Abnormal engine noise detected. Could indicate failing alternator bearing or accessory pulley. ${hasRAG ? 'Knowledge base recommends isolating noise source by removing accessory belts one at a time.' : ''}`,
      recommendedParts: [
        'Alternator Assembly - Part #ALT-7890',
        'Idler Pulley - Part #PULL-450',
      ],
      estimatedCost: 425.0,
      confidence: hasRAG ? 82 : 75,
    }
  }

  // Default generic response
  return {
    diagnosis: `${hasRAG ? '[RAG-ENHANCED] ' : ''}Based on the description, preliminary diagnosis suggests general maintenance or component inspection needed. ${hasRAG ? 'Please review RAG context for specific recommendations.' : ''}`,
    recommendedParts: ['Diagnostic Fee - Initial Inspection'],
    estimatedCost: 125.0,
    confidence: hasRAG ? 70 : 65,
  }
}

async function uploadFile(file: File, supabase: any): Promise<string> {
  // TODO: Implement Supabase Storage upload
  // For now, return placeholder
  return `placeholder_${file.name}`
}
