import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Video, Clock } from 'lucide-react'

export default function CustomerPortalPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">AI-Powered Vehicle Diagnostics</h1>
          <p className="text-xl text-muted-foreground">
            Get instant diagnostic insights before you visit the shop
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-12">
          <Card>
            <CardHeader>
              <FileText className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Submit Diagnostic</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Describe your vehicle issue and upload photos or audio
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Video className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Watch Videos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Learn about your vehicle issue with educational videos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Clock className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Track Status</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Mechanic reviews and approves diagnosis before contact
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center space-y-4">
          <Button asChild size="lg">
            <Link href="/customer/request">Submit Diagnostic Request</Link>
          </Button>
          <p className="text-sm text-muted-foreground">
            Already submitted? Check your email for the status link
          </p>
        </div>
      </div>
    </div>
  )
}
