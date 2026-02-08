import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateDiagnosis } from '@/lib/rag-service'

// Helper to handle file uploads to avoid repetition
async function uploadMedia(supabase: any, file: File, path: string) {
  const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
  const { data, error } = await supabase.storage
    .from('diagnostic-media')
    .upload(`${path}/${fileName}`, file);
  
  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('diagnostic-media')
    .getPublicUrl(data.path);
    
  return publicUrl;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  try {
    const contentType = request.headers.get('content-type') || '';
    let data: any = {};
    let imageFiles: File[] = [];
    let audioFile: File | null = null;

    // 1. Unified Data Extraction
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      data = Object.fromEntries(formData.entries());
      imageFiles = formData.getAll('image').filter(f => f instanceof File) as File[];
      audioFile = formData.get('audio') as File | null;
    } else {
      data = await request.json();
    }

    const { 
      customerName, customerEmail, description, 
      vehicleYear, vehicleMake, vehicleModel 
    } = data;

    if (!customerName || !customerEmail || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 2. Concurrent Media Uploads
    const imageUrls: string[] = [];
    let audioUrl: string | null = null;

    if (imageFiles.length > 0) {
      const uploadPromises = imageFiles.map(file => uploadMedia(supabase, file, 'images'));
      const results = await Promise.allSettled(uploadPromises);
      results.forEach(res => res.status === 'fulfilled' && imageUrls.push(res.value));
    }

    if (audioFile instanceof File) {
      audioUrl = await uploadMedia(supabase, audioFile, 'audio').catch(() => null);
    }

    // 3. AI Diagnosis
    let diagnosis;
    try {
      const vehicleInfo = { 
        year: parseInt(vehicleYear) || new Date().getFullYear(), 
        make: vehicleMake || 'Unknown', 
        model: vehicleModel || 'Unknown' 
      };
      
      const enrichedDescription = `${description}${imageUrls.length ? `\n[Images attached]` : ''}${audioUrl ? `\n[Audio attached]` : ''}`;
      
      diagnosis = await generateDiagnosis(enrichedDescription, vehicleInfo);
    } catch (err) {
      diagnosis = { diagnosis: 'Pending manual review.', recommendedParts: [], estimatedCost: 0, confidence: 0 };
    }

    // 4. Save to DB
    const { data: savedRequest, error: dbError } = await supabase
      .from('customer_diagnostic_requests')
      .insert({
        customer_name: customerName,
        customer_email: customerEmail,
        vehicle_year: parseInt(vehicleYear),
        vehicle_make: vehicleMake,
        vehicle_model: vehicleModel,
        symptoms_text: description,
        symptoms_image_urls: imageUrls,
        symptoms_audio_url: audioUrl,
        ai_diagnosis: diagnosis,
        status: 'pending_review',
      })
      .select().single();

    if (dbError) throw dbError;

    return NextResponse.json({ success: true, requestId: savedRequest.id, diagnosis });

  } catch (error: any) {
    console.error('CRITICAL_API_ERROR:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
