'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface DiagnosticRequest {
  id: string
  customer_name: string
  customer_email: string
  vehicle_year: string
  vehicle_make: string
  vehicle_model: string
  description: string
  ai_diagnosis: string
  recommended_parts: string[]
  estimated_cost: number
  status: string
  created_at: string
}

export function ReviewsClient({ initialRequests }: { initialRequests: DiagnosticRequest[] }) {
  const [requests, setRequests] = useState(initialRequests)
  const [selectedRequest, setSelectedRequest] = useState<DiagnosticRequest | null>(null)
  const [mechanicNotes, setMechanicNotes] = useState('')

  async function handleApprove(requestId: string) {
    try {
      await fetch(`/api/customer-diagnostics/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved', mechanicNotes }),
      })
      setRequests(requests.map(r => 
        r.id === requestId ? { ...r, status: 'approved' } : r
      ))
      setSelectedRequest(null)
    } catch (error) {
      console.error('Approve error:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Customer Diagnostic Reviews</h1>
        <p className="text-muted-foreground">Review and approve AI-generated diagnoses</p>
      </div>

      <div className="grid gap-4">
        {requests.filter(r => r.status === 'pending_review').map((request) => (
          <Card key={request.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{request.customer_name}</CardTitle>
                <Badge className="bg-yellow-500">Pending Review</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {request.vehicle_year} {request.vehicle_make} {request.vehicle_model}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-1">Customer Description:</h4>
                <p className="text-sm text-muted-foreground">{request.description}</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-1">AI Diagnosis:</h4>
                <p className="text-sm">{request.ai_diagnosis}</p>
              </div>

              {request.recommended_parts && request.recommended_parts.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-1">Recommended Parts:</h4>
                  <ul className="list-disc list-inside text-sm">
                    {request.recommended_parts.map((part, idx) => (
                      <li key={idx}>{part}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-1">Estimated Cost:</h4>
                <p className="text-lg font-bold">${request.estimated_cost?.toFixed(2)}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Mechanic Notes (Optional):</h4>
                <Textarea
                  placeholder="Add any additional notes or modifications..."
                  value={selectedRequest?.id === request.id ? mechanicNotes : ''}
                  onChange={(e) => {
                    setSelectedRequest(request)
                    setMechanicNotes(e.target.value)
                  }}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={() => handleApprove(request.id)}>
                  Approve & Contact Customer
                </Button>
                <Button variant="outline">Revise Diagnosis</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
