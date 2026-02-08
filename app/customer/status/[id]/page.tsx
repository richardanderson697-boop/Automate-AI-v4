import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { EducationalVideos } from '@/components/educational-videos'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function CustomerStatusPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  
  const { data: request } = await supabase
    .from('customer_diagnostic_requests')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!request) {
    notFound()
  }

  const statusColors: Record<string, string> = {
    pending_review: 'bg-yellow-500',
    reviewed: 'bg-blue-500',
    approved: 'bg-green-500',
    revised: 'bg-orange-500',
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Diagnostic Request Status</CardTitle>
                <CardDescription>Request ID: {request.id}</CardDescription>
              </div>
              <Badge className={statusColors[request.status]}>
                {request.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold">Vehicle Information</h3>
              <p className="text-muted-foreground">
                {request.vehicle_year} {request.vehicle_make} {request.vehicle_model}
              </p>
            </div>

            <div>
              <h3 className="font-semibold">Your Problem Description</h3>
              <p className="text-muted-foreground">{request.description}</p>
            </div>

            {request.ai_diagnosis && (
              <div>
                <h3 className="font-semibold">AI Analysis</h3>
                <p className="text-muted-foreground">{request.ai_diagnosis}</p>
              </div>
            )}

            {request.mechanic_notes && (
              <div className="rounded-lg border border-primary bg-primary/5 p-4">
                <h3 className="font-semibold text-primary">Mechanic Review</h3>
                <p className="mt-2">{request.mechanic_notes}</p>
              </div>
            )}

            {request.estimated_cost && (
              <div>
                <h3 className="font-semibold">Estimated Cost</h3>
                <p className="text-2xl font-bold text-primary">
                  ${request.estimated_cost.toFixed(2)}
                </p>
              </div>
            )}

            {request.status === 'pending_review' && (
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">
                  Your diagnostic request has been received and is awaiting mechanic review. 
                  We'll contact you at {request.customer_email} once reviewed.
                </p>
              </div>
            )}

            {(request.status === 'approved' || request.status === 'revised') && (
              <div className="rounded-lg bg-green-50 dark:bg-green-950 p-4">
                <p className="text-sm">
                  Your diagnostic has been reviewed and approved! 
                  We'll contact you at {request.customer_phone || request.customer_email} to schedule service.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Educational Videos Section - Shows videos specific to diagnosed issue */}
        {request.educational_videos && request.educational_videos.length > 0 && (
          <EducationalVideos 
            videos={request.educational_videos}
            diagnosis={request.ai_diagnosis || request.final_diagnosis}
          />
        )}
      </div>
    </div>
  )
}
