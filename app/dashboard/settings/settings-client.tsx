'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function SettingsClient() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Manage your API keys and integrations</p>
        </CardContent>
      </Card>
    </div>
  )
}
