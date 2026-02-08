'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export function DiagnosticsClient() {
  const [symptoms, setSymptoms] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  async function handleDiagnosis() {
    if (!symptoms.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/diagnostics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'text', content: symptoms }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Diagnosis error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Diagnostics</h1>
        <p className="text-muted-foreground">Get AI-powered diagnostic suggestions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Describe the Problem</CardTitle>
          <CardDescription>Enter symptoms, error codes, or customer complaints</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Example: Customer reports strange noise when braking, grinding sound from front wheels..."
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            rows={6}
          />
          <Button onClick={handleDiagnosis} disabled={loading || !symptoms.trim()}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Analyze Symptoms
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Diagnostic Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Diagnosis</h3>
              <p className="text-sm">{result.diagnosis}</p>
            </div>
            {result.recommendedParts && result.recommendedParts.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Recommended Parts</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {result.recommendedParts.map((part: string, idx: number) => (
                    <li key={idx}>{part}</li>
                  ))}
                </ul>
              </div>
            )}
            {result.estimatedCost && (
              <div>
                <h3 className="font-semibold mb-2">Estimated Cost</h3>
                <p className="text-2xl font-bold text-primary">${result.estimatedCost.toFixed(2)}</p>
              </div>
            )}
            {result.confidence && (
              <div>
                <h3 className="font-semibold mb-2">Confidence</h3>
                <p className="text-sm">{(result.confidence * 100).toFixed(0)}%</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
