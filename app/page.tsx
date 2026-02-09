import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Car, Camera, Mic, Video } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Pocket Mechanic AI
            </h1>
          </div>
          <div className="flex gap-4">
            <Link href="/pricing">
              <Button variant="ghost">Pricing</Button>
            </Link>
            <Link href="/analyze">
              <Button>Start Analysis</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20 px-4">
          <div className="container mx-auto max-w-6xl text-center space-y-8">
            <h2 className="text-6xl font-bold text-balance leading-tight">
              Your AI Auto Mechanic,{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                In Your Pocket
              </span>
            </h2>
            
            <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
              Upload photos, record sounds, or describe the problem. Get instant AI-powered diagnostics 
              and watch step-by-step repair videos.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Link href="/analyze">
                <Button size="lg" className="text-lg px-8 h-14">
                  Analyze Your Vehicle Now
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="text-lg px-8 h-14">
                  View Pricing
                </Button>
              </Link>
            </div>

            <p className="text-sm text-muted-foreground">
              $4.99 per analysis or $9.99 for 3-pack
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <h3 className="text-3xl font-bold text-center mb-12">
              How It Works
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl border">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                  <Camera className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold text-xl mb-3">Upload Photos</h4>
                <p className="text-muted-foreground">
                  Snap pictures of warning lights, leaks, or damaged parts for visual analysis
                </p>
              </div>

              <div className="p-8 bg-gradient-to-br from-accent/10 to-primary/10 rounded-xl border">
                <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4">
                  <Mic className="h-6 w-6 text-accent" />
                </div>
                <h4 className="font-semibold text-xl mb-3">Record Sounds</h4>
                <p className="text-muted-foreground">
                  Capture engine noises, squealing, or knocking sounds for audio diagnosis
                </p>
              </div>

              <div className="p-8 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl border">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                  <Video className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold text-xl mb-3">Watch & Learn</h4>
                <p className="text-muted-foreground">
                  Get AI diagnosis plus curated YouTube tutorials for your specific issue
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Preview */}
        <section className="bg-gradient-to-br from-muted/30 to-background py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h3 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h3>
            <p className="text-muted-foreground mb-12">
              No subscriptions. Pay only when you need help.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <div className="p-8 bg-card rounded-xl border-2 hover:border-primary transition-colors">
                <h4 className="text-lg font-semibold mb-2">Single Analysis</h4>
                <p className="text-4xl font-bold mb-4">$4.99</p>
                <p className="text-sm text-muted-foreground mb-6">
                  Perfect for one-time diagnostics
                </p>
                <Link href="/analyze">
                  <Button className="w-full">Get Started</Button>
                </Link>
              </div>

              <div className="p-8 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl border-2 border-primary">
                <div className="inline-block px-3 py-1 bg-primary/20 rounded-full text-xs font-semibold mb-2">
                  BEST VALUE
                </div>
                <h4 className="text-lg font-semibold mb-2">3-Pack Bundle</h4>
                <p className="text-4xl font-bold mb-4">$9.99</p>
                <p className="text-sm text-muted-foreground mb-6">
                  Save 33% - Great for car shopping
                </p>
                <Link href="/analyze">
                  <Button className="w-full" variant="default">Get Started</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>© 2026 Pocket Mechanic AI. Powered by Gemini AI.</p>
      </footer>
    </div>
  )
}
