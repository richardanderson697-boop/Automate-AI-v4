'use client'

import React from "react"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

export function CustomerRequestClient() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
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
      console.log('[v0] Submitting customer diagnostic request:', formData)
      console.log('[v0] Files:', { images: imageFiles.length, audio: !!audioFile })
      
      // Create FormData for file uploads
      const submitData = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value)
      })
      
      // Add image files
      imageFiles.forEach((file, index) => {
        submitData.append(`image`, file)
      })
      
      // Add audio file
      if (audioFile) {
        submitData.append('audio', audioFile)
      }
      
      const response = await fetch('/api/customer-diagnostics', {
        method: 'POST',
        body: submitData,
      })

      const data = await response.json()
      console.log('[v0] Response received:', data)
      
      if (response.ok && data.requestId) {
        router.push(`/customer/status/${data.requestId}`)
      } else {
        console.error('[v0] Error response:', data)
        alert(data.error || 'Failed to submit request')
      }
    } catch (error) {
      console.error('[v0] Submission error:', error)
      alert('Failed to submit request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Submit Diagnostic Request</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Your Name *</Label>
                <Input
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  required
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Year *</Label>
                  <Input
                    required
                    value={formData.vehicleYear}
                    onChange={(e) => setFormData({ ...formData, vehicleYear: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Make *</Label>
                  <Input
                    required
                    value={formData.vehicleMake}
                    onChange={(e) => setFormData({ ...formData, vehicleMake: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Model *</Label>
                  <Input
                    required
                    value={formData.vehicleModel}
                    onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Describe the Problem *</Label>
                <Textarea
                  required
                  rows={6}
                  placeholder="Example: My car makes a grinding noise when I brake..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Upload Photos (Optional)</Label>
                <p className="text-xs text-muted-foreground">
                  Photos of warning lights, leaks, or damaged parts help AI diagnose accurately
                </p>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || [])
                    setImageFiles(files)
                    console.log('[v0] Images selected:', files.length)
                  }}
                />
                {imageFiles.length > 0 && (
                  <p className="text-sm text-green-600">{imageFiles.length} image(s) selected</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Record Audio (Optional)</Label>
                <p className="text-xs text-muted-foreground">
                  Record engine noises, squealing, knocking, or unusual sounds
                </p>
                <Input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null
                    setAudioFile(file)
                    console.log('[v0] Audio selected:', file?.name)
                  }}
                />
                {audioFile && (
                  <p className="text-sm text-green-600">Audio: {audioFile.name}</p>
                )}
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Request
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
