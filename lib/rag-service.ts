import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'

// RAG Service v1.0.1 - Using Gemini 1.5 Flash and embedding-001
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

interface DiagnosisResult {
  diagnosis: string
  recommendedParts: string[]
  estimatedCost: number
  confidence: number
}

/**
 * Build diagnostic context by retrieving relevant repair knowledge using RAG
 */
export async function buildDiagnosticContext(
  symptoms: string,
  vehicleInfo?: { year: number; make: string; model: string }
): Promise<string> {
  try {
    const supabase = await createClient()

    // Generate embedding for the symptoms using Gemini
    const embeddingModel = genAI.getGenerativeModel({ 
      model: 'models/embedding-001'
    })
    const embeddingResult = await embeddingModel.embedContent(symptoms)
    const embedding = embeddingResult.embedding.values

    // Search for relevant repair knowledge using vector similarity
    const { data: knowledgeResults, error } = await supabase.rpc(
      'match_repair_knowledge',
      {
        query_embedding: embedding,
        match_threshold: 0.7,
        match_count: 5,
      }
    )

    if (error) {
      console.error('[v0] RAG search error:', error)
      return ''
    }

    // Build context string from retrieved knowledge
    const context = knowledgeResults
      ?.map(
        (item: any) =>
          `${item.title}\n${item.content}\nCategory: ${item.category}`
      )
      .join('\n\n---\n\n')

    return context || ''
  } catch (error) {
    console.error('[v0] Error building diagnostic context:', error)
    return ''
  }
}

/**
 * Generate AI diagnosis using Gemini with RAG-enhanced context
 */
export async function generateDiagnosis(
  symptoms: string,
  vehicleInfo?: { year: number; make: string; model: string }
): Promise<DiagnosisResult> {
  try {
    console.log('[v0 RAG] Starting diagnosis generation')
    console.log('[v0 RAG] GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Present' : 'MISSING')
    
    // Retrieve relevant repair knowledge
    const context = await buildDiagnosticContext(symptoms, vehicleInfo)
    console.log('[v0 RAG] Context retrieved, length:', context.length)

    const model = genAI.getGenerativeModel({ 
      model: 'models/gemini-1.5-flash'
    })

    const vehicleStr = vehicleInfo
      ? `${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}`
      : 'unknown vehicle'

    const prompt = `You are an expert automotive diagnostic AI assistant. Analyze the following vehicle symptoms and provide a diagnosis.

Vehicle: ${vehicleStr}
Symptoms: ${symptoms}

${context ? `Relevant Repair Knowledge:\n${context}\n\n` : ''}

Based on the symptoms${context ? ' and the repair knowledge provided' : ''}, provide:
1. A clear diagnosis of the likely problem
2. Recommended parts that may need replacement (as a JSON array)
3. Estimated repair cost in USD (parts + labor)
4. Your confidence level (0-100)

Respond in JSON format:
{
  "diagnosis": "detailed diagnosis here",
  "recommendedParts": ["part1", "part2"],
  "estimatedCost": 450.00,
  "confidence": 85
}`

    console.log('[v0 RAG] Calling Gemini API...')
    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    console.log('[v0 RAG] Gemini response received, length:', responseText.length)

    // Extract JSON from response (may be wrapped in markdown)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('[v0 RAG] Failed to extract JSON from response:', responseText)
      throw new Error('Failed to parse AI response')
    }

    const diagnosis = JSON.parse(jsonMatch[0])
    console.log('[v0 RAG] Parsed diagnosis successfully')

    return {
      diagnosis: diagnosis.diagnosis || 'Unable to determine',
      recommendedParts: diagnosis.recommendedParts || [],
      estimatedCost: diagnosis.estimatedCost || 0,
      confidence: diagnosis.confidence || 0,
    }
  } catch (error) {
    console.error('[v0] Error generating diagnosis:', error)
    return {
      diagnosis: 'Error generating diagnosis. Please try again.',
      recommendedParts: [],
      estimatedCost: 0,
      confidence: 0,
    }
  }
}

/**
 * Save diagnosis to history table
 */
export async function saveDiagnosisHistory(
  userId: string,
  inputType: string,
  inputContent: string,
  diagnosis: string,
  recommendedParts: string[],
  estimatedCost: number,
  confidence: number
): Promise<void> {
  try {
    const supabase = await createClient()

    await supabase.from('ai_diagnostics').insert({
      user_id: userId,
      input_type: inputType,
      input_content: inputContent,
      diagnosis,
      recommended_parts: recommendedParts,
      estimated_cost: estimatedCost,
      confidence,
    })
  } catch (error) {
    console.error('[v0] Error saving diagnosis history:', error)
  }
}
