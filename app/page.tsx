import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">A Full Service Auto</h1>
          <div className="flex gap-4">
            <Link href="/customer">
              <Button variant="outline">Customer Portal</Button>
            </Link>
            <Link href="/dashboard">
              <Button>Shop Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 text-center">
        <div className="max-w-4xl space-y-8">
          <h2 className="text-5xl font-bold text-balance leading-tight">
            AI-Powered Auto Repair{' '}
            <span className="text-blue-600">Management Platform</span>
          </h2>
          
          <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
            Transform your auto shop with intelligent diagnostics, seamless integrations, 
            and exceptional customer experiences. Built for modern shops.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/pricing">
              <Button size="lg" className="text-lg px-8">
                View Pricing
              </Button>
            </Link>
            <Link href="/customer/request">
              <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent">
                Submit Diagnostic
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
            <div className="p-6 bg-white rounded-lg border shadow-sm">
              <h3 className="font-semibold text-lg mb-2">AI Diagnostics</h3>
              <p className="text-sm text-muted-foreground">
                RAG-enhanced AI provides accurate diagnostics with repair recommendations
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg border shadow-sm">
              <h3 className="font-semibold text-lg mb-2">Shop Integrations</h3>
              <p className="text-sm text-muted-foreground">
                Connect with Mitchell 1, Tekmetric, and Shop-Ware seamlessly
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg border shadow-sm">
              <h3 className="font-semibold text-lg mb-2">Customer Portal</h3>
              <p className="text-sm text-muted-foreground">
                Educational videos and real-time status updates keep customers engaged
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>© 2026 A Full Service Auto. Powered by AI.</p>
      </footer>
    </div>
  )
}
