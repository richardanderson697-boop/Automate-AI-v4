import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  findEducationalVideos,
  groupVideosByCategory,
} from '@/lib/video-search'

// Request validation schema
const videoRequestSchema = z.object({
  diagnosis: z.string().min(3).max(200),
  symptoms: z.array(z.string()).min(1).max(10),
  vehicleInfo: z
    .object({
      year: z.number().min(1900).max(new Date().getFullYear() + 1),
      make: z.string().min(1).max(50),
      model: z.string().min(1).max(50),
    })
    .optional(),
})

export async function POST(req: NextRequest) {
  try {
    // Check if YouTube API key is configured - gracefully return empty array if not
    if (!process.env.YOUTUBE_API_KEY) {
      console.log('[v0] YouTube API key not configured - returning empty results')
      return NextResponse.json({
        success: true,
        videos: [],
        categorized: {
          symptom_explanation: [],
          repair_walkthrough: [],
          cost_breakdown: [],
          prevention: [],
        },
        total: 0,
      })
    }

    // Parse and validate request body
    const body = await req.json()
    const validated = videoRequestSchema.parse(body)

    // Search for videos
    const videos = await findEducationalVideos(
      validated.diagnosis,
      validated.symptoms,
      validated.vehicleInfo
    )

    // Group by category
    const grouped = groupVideosByCategory(videos)

    // Convert Map to object for JSON response
    const categorizedVideos = {
      symptom_explanation: grouped.get('symptom_explanation') || [],
      repair_walkthrough: grouped.get('repair_walkthrough') || [],
      cost_breakdown: grouped.get('cost_breakdown') || [],
      prevention: grouped.get('prevention') || [],
    }

    return NextResponse.json({
      success: true,
      videos: videos,
      categorized: categorizedVideos,
      total: videos.length,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    console.error('Video search error:', error)

    return NextResponse.json(
      {
        error: 'Failed to search for educational videos',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// GET endpoint for testing
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const diagnosis = searchParams.get('diagnosis') || 'CV joint failure'
  const symptoms =
    searchParams.get('symptoms')?.split(',') || ['clicking noise', 'vibration']

  try {
    if (!process.env.YOUTUBE_API_KEY) {
      return NextResponse.json({
        success: true,
        videos: [],
        query: { diagnosis, symptoms },
      })
    }

    const videos = await findEducationalVideos(diagnosis, symptoms)

    return NextResponse.json({
      success: true,
      videos,
      query: { diagnosis, symptoms },
    })
  } catch (error) {
    console.error('Video search error:', error)
    return NextResponse.json(
      { error: 'Failed to search videos' },
      { status: 500 }
    )
  }
}
