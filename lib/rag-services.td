import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'

export interface DiagnosisResult {
  diagnosis: string
  recommendedParts: string[]
  estimatedCost: number
  confidence: number
}

interface RepairKnowledge {
  id: string
  problem_type: string
  vehicle_make?: string
  vehicle_model?: string
  symptoms: string
  solution: string
  parts_needed: string[]
  estimated_cost: number
  similarity?: number
}

/**
 * Build diagnostic context by retrieving relevant repair knowledge using vector similarity search
 */
export async function buildDiagnosticContext(
  symptoms: string,
  vehicleInfo?: { year: number; make: string; model: string }
): Promise<string> {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.log('[v0 RAG] No GEMINI_API_KEY available')
      return ''
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const embeddingModel = genAI.getGenerativeModel({
      model: 'text-embedding-004',
    })

    // Generate embedding for the symptoms
    const embeddingResult = await embeddingModel.embedContent(symptoms)
    const embedding = embeddingResult.embedding.values

    // Query Supabase for similar repair knowledge
    const supabase = await createClient()
    const { data: knowledge, error } = await supabase.rpc(
      'match_repair_knowledge',
      {
        query_embedding: embedding,
        match_threshold: 0.7,
        match_count: 5,
      }
    )

    if (error) {
      console.error('[v0 RAG] Error fetching repair knowledge:', error)
      return ''
    }

    if (!knowledge || knowledge.length === 0) {
      return ''
    }

    // Build context from retrieved knowledge
    const context = knowledge
      .map(
        (item: RepairKnowledge) =>
          `Problem: ${item.problem_type}\nSymptoms: ${item.symptoms}\nSolution: ${item.solution}\nParts: ${item.parts_needed.join(', ')}\nCost: $${item.estimated_cost}`
      )
      .join('\n\n')

    return context
  } catch (error) {
    console.error('[v0 RAG] Error building context:', error)
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
