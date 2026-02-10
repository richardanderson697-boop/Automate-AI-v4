'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, DollarSign, Wrench } from 'lucide-react'
import Link from 'next/link'

interface Analysis {
  id: string
  vehicle_year: number
  vehicle_make: string
  vehicle_model: string
  symptoms_text: string
  ai_diagnosis: {
    diagnosis: string
    recommendedParts: string[]
    estimatedCost: number
    confidence: number
    videos: Array<{ title: string; videoId: string; thumbnail: string }>
  }
  status: string
}

export default function ResultsClient({ analysis }: { analysis: Analysis }) {
  const { ai_diagnosis } = analysis
  const isPaid = analysis.status === 'completed' || analysis.status === 'reviewed'

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container max-w-4xl py-12 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Analysis Results</h1>
          <p className="text-muted-foreground">
            {analysis.vehicle_year} {analysis.vehicle_make} {analysis.vehicle_model}
          </p>
        </div>

        {/* Payment Status */}
        {!isPaid && (
          <Card className="mb-6 border-accent">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-1">Unlock Full Diagnosis</h3>
                  <p className="text-sm text-muted-foreground">
                    Pay $4.99 to view complete analysis and repair videos
                  </p>
                </div>
                <Button size="lg">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Pay $4.99
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Diagnosis */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>AI Diagnosis</CardTitle>
              <Badge variant={ai_diagnosis.confidence > 70 ? 'default' : 'secondary'}>
                {ai_diagnosis.confidence}% Confidence
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className={`text-lg leading-relaxed ${!isPaid ? 'blur-sm select-none' : ''}`}>
              {ai_diagnosis.diagnosis}
            </p>
          </CardContent>
        </Card>

        {/* Recommended Parts */}
        {ai_diagnosis.recommendedParts.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Recommended Parts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className={`space-y-2 ${!isPaid ? 'blur-sm select-none' : ''}`}>
                {ai_diagnosis.recommendedParts.map((part, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>{part}</span>
                  </li>
                ))}
              </ul>
              
              {ai_diagnosis.estimatedCost > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-lg font-semibold">
                    Estimated Cost: ${ai_diagnosis.estimatedCost.toFixed(2)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Educational Videos */}
        {ai_diagnosis.videos && ai_diagnosis.videos.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>How to Fix It - Video Tutorials</CardTitle>
              <CardDescription>
                Step-by-step repair guides for your specific issue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`grid gap-4 ${!isPaid ? 'blur-sm select-none pointer-events-none' : ''}`}>
                {ai_diagnosis.videos.map((video, index) => (
                  <a
                    key={index}
                    href={`https://www.youtube.com/watch?v=${video.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex gap-4 p-4 rounded-lg border hover:bg-accent/10 transition-colors"
                  >
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-32 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium line-clamp-2">{video.title}</h4>
                    </div>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <Link href="/analyze">
            <Button variant="outline" size="lg">
              New Analysis
            </Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="lg">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
