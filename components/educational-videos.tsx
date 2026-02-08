'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { PlayCircle, Clock, Eye } from 'lucide-react'
// VideoResult type and formatters defined inline to avoid server-side imports
interface VideoResult {
  id: string
  title: string
  description: string
  thumbnail: string
  channelTitle: string
  publishedAt: string
  duration?: string
  viewCount?: number
  category: string
}

function formatDuration(duration: string): string {
  return duration // Simplified for client
}

function formatViewCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M views`
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K views`
  return `${count} views`
}

interface EducationalVideosProps {
  videos?: VideoResult[] // Pre-fetched videos from database
  diagnosis?: string // Optional for display
}

export function EducationalVideos({
  videos: initialVideos = [],
  diagnosis,
}: EducationalVideosProps) {
  const [categorized, setCategorized] = useState<any>(null)

  useEffect(() => {
    if (initialVideos.length > 0) {
      // Categorize the pre-fetched videos
      const grouped: Record<string, VideoResult[]> = {
        symptom_explanation: [],
        repair_walkthrough: [],
        cost_breakdown: [],
        prevention: [],
      }

      initialVideos.forEach((video) => {
        const category = video.category || 'repair_walkthrough'
        if (grouped[category]) {
          grouped[category].push(video)
        }
      })

      setCategorized(grouped)
    }
  }, [initialVideos])

  if (!initialVideos.length) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlayCircle className="h-6 w-6" />
          Learn More About Your Issue
        </CardTitle>
        <CardDescription>
          While you wait for a mechanic to review your submission, watch these
          videos to understand what's happening
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {categorized?.symptom_explanation?.length > 0 && (
          <VideoCategory
            title="Understanding Your Symptoms"
            description="These videos explain what you're experiencing"
            videos={categorized.symptom_explanation}
          />
        )}

        {categorized?.repair_walkthrough?.length > 0 && (
          <VideoCategory
            title="Repair Process"
            description="See what's involved in fixing this issue"
            videos={categorized.repair_walkthrough}
          />
        )}

        {categorized?.cost_breakdown?.length > 0 && (
          <VideoCategory
            title="Cost & Pricing"
            description="Understand typical repair costs"
            videos={categorized.cost_breakdown}
          />
        )}

        {categorized?.prevention?.length > 0 && (
          <VideoCategory
            title="Prevention & Maintenance"
            description="How to avoid this problem in the future"
            videos={categorized.prevention}
          />
        )}
      </CardContent>
    </Card>
  )
}

function VideoCategory({
  title,
  description,
  videos,
}: {
  title: string
  description: string
  videos: VideoResult[]
}) {
  return (
    <div className="space-y-3">
      <div>
        <h4 className="font-semibold text-lg">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {videos.slice(0, 2).map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  )
}

function VideoCard({ video }: { video: VideoResult }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <a
      href={`https://www.youtube.com/watch?v=${video.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02]">
        <div className="relative aspect-video bg-muted">
          <img
            src={video.thumbnail || "/placeholder.svg"}
            alt={video.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <PlayCircle className="h-16 w-16 text-white" />
          </div>
          {video.duration && (
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
              {formatDuration(video.duration)}
            </div>
          )}
        </div>
        <CardContent className="p-4 space-y-2">
          <h5 className="font-semibold line-clamp-2 text-sm group-hover:text-primary transition-colors">
            {video.title}
          </h5>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium">{video.channelTitle}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {video.viewCount && (
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {formatViewCount(video.viewCount)}
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(video.publishedAt).toLocaleDateString()}
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {getCategoryLabel(video.category)}
          </Badge>
        </CardContent>
      </Card>
    </a>
  )
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    symptom_explanation: 'Symptoms',
    repair_walkthrough: 'Repair Guide',
    cost_breakdown: 'Cost Info',
    prevention: 'Prevention',
  }
  return labels[category] || category
}

function EducationalVideosLoading() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlayCircle className="h-6 w-6" />
          Learn More About Your Issue
        </CardTitle>
        <CardDescription>Loading educational videos...</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-6 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <VideoCardSkeleton />
            <VideoCardSkeleton />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function VideoCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-video w-full" />
      <CardContent className="p-4 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>
      </CardContent>
    </Card>
  )
}
