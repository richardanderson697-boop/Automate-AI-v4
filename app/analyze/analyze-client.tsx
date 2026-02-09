'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Camera, Mic, Upload } from 'lucide-react'

export default function AnalyzeClient() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    vehicleYear: '',
    vehicleMake: '',
    vehicleModel: '',
    description: '',
  })
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [audioFile, setAudioFile] = useState<File | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      console.log('[v0] Submitting vehicle analysis:', formData)
      
      const submitData = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value)
      })
      
      imageFiles.forEach((file) => {
        submitData.append('image', file)
      })
      
      if (audioFile) {
        submitData.append('audio', audioFile)
      }
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: submitData,
      })

      const data = await response.json()
      
      if (response.ok && data.analysisId) {
        router.push(`/results/${data.analysisId}`)
      } else {
        alert(data.error || 'Analysis failed. Please try again.')
      }
    } catch (error) {
      console.error('[v0] Analysis error:', error)
      alert('Failed to submit analysis. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container max-w-3xl py-12 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Vehicle Analysis
          </h1>
          <p className="text-muted-foreground">
            Describe your issue and upload photos or audio for AI-powered diagnosis
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tell Us About Your Vehicle</CardTitle>
            <CardDescription>
              The more details you provide, the better our AI can diagnose the issue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Vehicle Info */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="year">Year *</Label>
                  <Input
                    id="year"
                    required
                    placeholder="2020"
                    value={formData.vehicleYear}
                    onChange={(e) => setFormData({ ...formData, vehicleYear: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="make">Make *</Label>
                  <Input
                    id="make"
                    required
                    placeholder="Toyota"
                    value={formData.vehicleMake}
                    onChange={(e) => setFormData({ ...formData, vehicleMake: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">Model *</Label>
                  <Input
                    id="model"
                    required
                    placeholder="Camry"
                    value={formData.vehicleModel}
                    onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                  />
                </div>
              </div>

              {/* Problem Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Describe the Problem *</Label>
                <Textarea
                  id="description"
                  required
                  rows={6}
                  placeholder="Example: My car makes a grinding noise when I brake and the brake pedal feels soft..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="resize-none"
                />
              </div>

              {/* Photo Upload */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Upload Photos (Optional)
                </Label>
                <div className="border-2 border-dashed rounded-lg p-6 hover:border-primary/50 transition-colors">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || [])
                      setImageFiles(files)
                    }}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Photos of warning lights, leaks, or damaged parts help AI diagnose accurately
                  </p>
                  {imageFiles.length > 0 && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
                      <Upload className="h-4 w-4" />
                      {imageFiles.length} image(s) selected
                    </div>
                  )}
                </div>
              </div>

              {/* Audio Upload */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Mic className="h-4 w-4" />
                  Record Audio (Optional)
                </Label>
                <div className="border-2 border-dashed rounded-lg p-6 hover:border-primary/50 transition-colors">
                  <Input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null
                      setAudioFile(file)
                    }}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Record engine noises, squealing, knocking, or unusual sounds
                  </p>
                  {audioFile && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
                      <Upload className="h-4 w-4" />
                      Audio: {audioFile.name}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <Button type="submit" disabled={loading} className="w-full h-12 text-lg">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze My Vehicle'
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                $4.99 per analysis - Pay after viewing results
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
