import { GoogleGenerativeAI } from '@google/generative-ai'

export interface DiagnosisResult {
  diagnosis: string
  recommendedParts: string[]
  estimatedCost: number
  confidence: number
}

export async function generateDiagnosis(
  symptoms: string,
  vehicleInfo?: { year: number; make: string; model: string }
): Promise<DiagnosisResult> {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return generateFallbackDiagnosis(symptoms)
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const vehicleContext = vehicleInfo
      ? `Vehicle: ${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}\n`
      : ''

    const prompt = `You are an expert automotive diagnostic technician. Analyze these symptoms and provide a diagnosis.

${vehicleContext}Symptoms: ${symptoms}

Provide a diagnosis with:
1. Clear explanation of the problem
2. Recommended parts needed
3. Estimated cost in USD
4. Confidence level (0-100)

Return ONLY valid JSON:
{
  "diagnosis": "explanation",
  "recommendedParts": ["part1", "part2"],
  "estimatedCost": 150.00,
  "confidence": 85
}`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response')
    }

    const diagnosis = JSON.parse(jsonMatch[0])

    return {
      diagnosis: diagnosis.diagnosis || 'Analysis pending',
      recommendedParts: diagnosis.recommendedParts || [],
      estimatedCost: diagnosis.estimatedCost || 0,
      confidence: diagnosis.confidence || 50,
    }
  } catch (error) {
    console.error('[v0] AI diagnosis error:', error)
    return generateFallbackDiagnosis(symptoms)
  }
}

function generateFallbackDiagnosis(symptoms: string): DiagnosisResult {
  const lower = symptoms.toLowerCase()

  if (lower.includes('grind') || lower.includes('squeal') || lower.includes('brake')) {
    return {
      diagnosis: 'Based on the grinding or squealing sounds, this likely indicates worn brake pads or rotors. The metal-on-metal contact suggests immediate attention is needed to ensure safe braking.',
      recommendedParts: ['Brake Pad Set', 'Brake Rotors', 'Brake Hardware Kit'],
      estimatedCost: 350,
      confidence: 75,
    }
  }

  if (lower.includes('overheat') || lower.includes('radiator') || lower.includes('coolant') || lower.includes('hiss')) {
    return {
      diagnosis: 'Overheating and hissing sounds typically indicate a coolant leak, failed thermostat, or water pump issue. Check coolant levels immediately and inspect for visible leaks.',
      recommendedParts: ['Thermostat', 'Water Pump', 'Coolant', 'Radiator Hoses'],
      estimatedCost: 450,
      confidence: 70,
    }
  }

  if (lower.includes('start') || lower.includes('crank') || lower.includes('battery') || lower.includes('stall')) {
    return {
      diagnosis: 'Starting problems or stalling can stem from battery, alternator, or fuel system issues. Test the battery voltage and check for loose connections or corroded terminals.',
      recommendedParts: ['Battery', 'Alternator', 'Fuel Filter', 'Spark Plugs'],
      estimatedCost: 400,
      confidence: 65,
    }
  }

  if (lower.includes('noise') || lower.includes('sound') || lower.includes('whine') || lower.includes('belt')) {
    return {
      diagnosis: 'Whining or unusual noises often indicate belt issues, bearing wear, or pulley problems. A visual inspection of belts and pulleys is recommended.',
      recommendedParts: ['Serpentine Belt', 'Belt Tensioner', 'Idler Pulley'],
      estimatedCost: 250,
      confidence: 60,
    }
  }

  return {
    diagnosis: 'Based on the symptoms described, a comprehensive diagnostic inspection is recommended to accurately identify the issue.',
    recommendedParts: ['Diagnostic Inspection'],
    estimatedCost: 125,
    confidence: 50,
  }
}
