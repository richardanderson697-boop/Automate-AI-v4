import { google } from 'googleapis'

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY,
})

// Types
export interface VideoResult {
  id: string
  title: string
  description: string
  thumbnail: string
  channelTitle: string
  publishedAt: string
  viewCount?: number
  duration?: string
  score: number
  category: VideoCategory
}

export type VideoCategory =
  | 'symptom_explanation'
  | 'repair_walkthrough'
  | 'cost_breakdown'
  | 'prevention'

interface VehicleInfo {
  year: number
  make: string
  model: string
}

// Main function
export async function findEducationalVideos(
  diagnosis: string,
  symptoms: string[],
  vehicleInfo?: VehicleInfo
): Promise<VideoResult[]> {
  const queries = buildSearchQueries(diagnosis, symptoms, vehicleInfo)

  const videos = await Promise.all(
    queries.map((query) =>
      youtube.search.list({
        part: ['snippet'],
        q: query,
        type: ['video'],
        maxResults: 5,
        videoDuration: 'medium', // 4-20 minutes
        relevanceLanguage: 'en',
        safeSearch: 'strict',
      })
    )
  )

  // Flatten results and get video details
  const videoIds = videos
    .flatMap((response) => response.data.items || [])
    .map((item) => item.id?.videoId)
    .filter(Boolean) as string[]

  // Get detailed stats for ranking
  const detailedVideos = await getVideoDetails(videoIds)

  // Rank and deduplicate
  return rankVideos(detailedVideos, diagnosis)
}

// Build search queries
function buildSearchQueries(
  diagnosis: string,
  symptoms: string[],
  vehicleInfo?: VehicleInfo
): string[] {
  const queries: string[] = []

  // Symptom-based searches
  symptoms.forEach((symptom) => {
    queries.push(`car ${symptom} diagnosis`)
    queries.push(`how to fix ${symptom}`)
  })

  // Diagnosis-based searches - dynamic
  const commonIssues: Record<string, string[]> = {
    'CV joint': [
      'CV joint replacement explained',
      'CV joint symptoms',
      'how much does CV joint cost',
      'CV joint clicking noise',
    ],
    brake: [
      'brake pad replacement',
      'brake noise diagnosis',
      'brake repair cost',
      'how to know when brakes need replacing',
    ],
    alternator: [
      'alternator failure symptoms',
      'how to test alternator',
      'alternator replacement cost',
      'battery vs alternator problem',
    ],
    transmission: [
      'transmission slipping symptoms',
      'transmission fluid change',
      'transmission repair cost',
      'automatic transmission problems',
    ],
    'engine misfire': [
      'engine misfire diagnosis',
      'P0300 code explained',
      'misfire repair cost',
      'spark plug replacement',
    ],
  }

  // Find matching issue category
  const diagnosisLower = diagnosis.toLowerCase()
  Object.entries(commonIssues).forEach(([key, searchTerms]) => {
    if (diagnosisLower.includes(key.toLowerCase())) {
      queries.push(...searchTerms)
    }
  })

  // Fallback general queries if no specific match
  if (queries.length === symptoms.length * 2) {
    queries.push(`${diagnosis} diagnosis`)
    queries.push(`how to fix ${diagnosis}`)
    queries.push(`${diagnosis} repair cost`)
  }

  // Vehicle-specific if available
  if (vehicleInfo) {
    queries.push(
      `${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model} ${diagnosis}`
    )
    queries.push(`${vehicleInfo.make} ${vehicleInfo.model} common problems`)
  }

  return queries
}

// Get detailed video information
async function getVideoDetails(videoIds: string[]): Promise<any[]> {
  if (videoIds.length === 0) return []

  // YouTube API allows max 50 IDs per request
  const chunks = chunkArray(videoIds, 50)

  const detailedVideos = await Promise.all(
    chunks.map((chunk) =>
      youtube.videos.list({
        part: ['snippet', 'statistics', 'contentDetails'],
        id: chunk,
      })
    )
  )

  return detailedVideos.flatMap((response) => response.data.items || [])
}

// Rank videos by relevance
function rankVideos(rawVideos: any[], diagnosis: string): VideoResult[] {
  const authorityChannels = [
    'ChrisFix',
    'Scotty Kilmer',
    'Engineering Explained',
    '1A Auto',
    'RepairSmith',
    'South Main Auto Repair',
    'ETCG1',
    'Scanner Danner',
    'Pine Hollow Auto Diagnostics',
  ]

  // Remove duplicates by video ID
  const uniqueVideos = Array.from(
    new Map(rawVideos.map((v) => [v.id, v])).values()
  )

  return uniqueVideos
    .map((video) => {
      const score = calculateRelevanceScore(video, diagnosis, authorityChannels)
      const category = categorizeVideo(video)

      return {
        id: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnail:
          video.snippet.thumbnails.medium?.url ||
          video.snippet.thumbnails.default.url,
        channelTitle: video.snippet.channelTitle,
        publishedAt: video.snippet.publishedAt,
        viewCount: parseInt(video.statistics?.viewCount || '0'),
        duration: video.contentDetails?.duration,
        score,
        category,
      }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 8) // Top 8 videos
}

// Calculate relevance score
function calculateRelevanceScore(
  video: any,
  diagnosis: string,
  authorityChannels: string[]
): number {
  let score = 0

  const title = video.snippet.title.toLowerCase()
  const description = video.snippet.description.toLowerCase()
  const diagnosisLower = diagnosis.toLowerCase()
  const viewCount = parseInt(video.statistics?.viewCount || '0')
  const channelTitle = video.snippet.channelTitle
  const publishedAt = new Date(video.snippet.publishedAt)
  const now = new Date()
  const ageInYears =
    (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60 * 24 * 365)

  // Title relevance (0-30 points)
  if (title.includes(diagnosisLower)) {
    score += 30
  } else {
    const diagnosisWords = diagnosisLower.split(' ')
    const matchedWords = diagnosisWords.filter(
      (word) => word.length > 3 && title.includes(word)
    )
    score += matchedWords.length * 5
  }

  // Description relevance (0-10 points)
  if (description.includes(diagnosisLower)) {
    score += 10
  }

  // View count (0-25 points, logarithmic scale)
  if (viewCount > 0) {
    const viewScore = Math.min(25, Math.log10(viewCount) * 3)
    score += viewScore
  }

  // Channel authority (0-20 points)
  if (
    authorityChannels.some((channel) =>
      channelTitle.toLowerCase().includes(channel.toLowerCase())
    )
  ) {
    score += 20
  }

  // Recency bonus (0-15 points)
  if (ageInYears < 1) {
    score += 15
  } else if (ageInYears < 2) {
    score += 10
  } else if (ageInYears < 3) {
    score += 5
  }
  // Penalty for very old videos (>5 years)
  if (ageInYears > 5) {
    score -= 10
  }

  return Math.max(0, score)
}

// Categorize video by content type
function categorizeVideo(video: any): VideoCategory {
  const title = video.snippet.title.toLowerCase()
  const description = video.snippet.description.toLowerCase()
  const combined = `${title} ${description}`

  // Symptom explanation indicators
  if (
    combined.includes('symptom') ||
    combined.includes('sound') ||
    combined.includes('noise') ||
    combined.includes('how to know') ||
    combined.includes('diagnosis')
  ) {
    return 'symptom_explanation'
  }

  // Cost breakdown indicators
  if (
    combined.includes('cost') ||
    combined.includes('price') ||
    combined.includes('how much') ||
    combined.includes('expensive')
  ) {
    return 'cost_breakdown'
  }

  // Prevention/maintenance indicators
  if (
    combined.includes('prevent') ||
    combined.includes('maintain') ||
    combined.includes('avoid') ||
    combined.includes('last longer')
  ) {
    return 'prevention'
  }

  // Default to repair walkthrough
  return 'repair_walkthrough'
}

// Helper: chunk array
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

// Group videos by category for display
export function groupVideosByCategory(
  videos: VideoResult[]
): Map<VideoCategory, VideoResult[]> {
  const grouped = new Map<VideoCategory, VideoResult[]>()

  videos.forEach((video) => {
    const existing = grouped.get(video.category) || []
    grouped.set(video.category, [...existing, video])
  })

  return grouped
}

// Format duration from ISO 8601 to readable format
export function formatDuration(isoDuration: string): string {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)

  if (!match) return ''

  const hours = parseInt(match[1] || '0')
  const minutes = parseInt(match[2] || '0')
  const seconds = parseInt(match[3] || '0')

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

// Format view count to readable format
export function formatViewCount(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}M views`
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1)}K views`
  }
  return `${count} views`
}
