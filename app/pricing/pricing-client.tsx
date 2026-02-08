'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function PricingClient() {
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold text-center mb-12">Choose Your Plan</h1>
      <div className="grid md:grid-cols-3 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Starter</CardTitle>
            <CardDescription>Perfect for small shops</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold mb-4">$99/mo</p>
            <Button className="w-full">Get Started</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Professional</CardTitle>
            <CardDescription>For growing businesses</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold mb-4">$199/mo</p>
            <Button className="w-full">Get Started</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Enterprise</CardTitle>
            <CardDescription>Unlimited everything</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold mb-4">$499/mo</p>
            <Button className="w-full">Get Started</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
