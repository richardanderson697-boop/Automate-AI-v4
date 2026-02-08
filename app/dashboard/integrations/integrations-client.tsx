'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

interface Integration {
  id: string
  provider: 'mitchell1' | 'tekmetric' | 'shopware'
  is_active: boolean
  last_sync_at: string | null
  sync_status: 'success' | 'failed' | 'pending' | null
}

interface IntegrationsClientProps {
  integrations: Integration[]
}

export function IntegrationsClient({ integrations }: IntegrationsClientProps) {
  const [mitchell1Credentials, setMitchell1Credentials] = useState({
    apiKey: '',
    subscriptionId: '',
  })
  const [tekmetricCredentials, setTekmetricCredentials] = useState({
    apiKey: '',
    shopId: '',
  })
  const [shopwareCredentials, setShopwareCredentials] = useState({
    apiKey: '',
    clientId: '',
    clientSecret: '',
  })
  
  const [testing, setTesting] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)

  const mitchell1Integration = integrations.find(i => i.provider === 'mitchell1')
  const tekmetricIntegration = integrations.find(i => i.provider === 'tekmetric')
  const shopwareIntegration = integrations.find(i => i.provider === 'shopware')

  async function testConnection(provider: string, credentials: any) {
    setTesting(provider)
    try {
      const response = await fetch('/api/integrations/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, credentials }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        alert(`✓ Connection successful! ${data.message}`)
      } else {
        alert(`✗ Connection failed: ${data.error}`)
      }
    } catch (error) {
      alert('Connection test failed')
    } finally {
      setTesting(null)
    }
  }

  async function saveIntegration(provider: string, credentials: any) {
    setSaving(provider)
    try {
      const response = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, credentials }),
      })
      
      if (response.ok) {
        alert('✓ Integration saved successfully')
        window.location.reload()
      } else {
        const data = await response.json()
        alert(`✗ Failed to save: ${data.error}`)
      }
    } catch (error) {
      alert('Failed to save integration')
    } finally {
      setSaving(null)
    }
  }

  async function toggleIntegration(id: string, isActive: boolean) {
    try {
      await fetch(`/api/integrations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: isActive }),
      })
      window.location.reload()
    } catch (error) {
      alert('Failed to update integration')
    }
  }

  function getStatusBadge(integration?: Integration) {
    if (!integration) return <Badge variant="outline">Not Connected</Badge>
    if (!integration.is_active) return <Badge variant="outline">Disabled</Badge>
    if (integration.sync_status === 'success') return <Badge className="bg-green-500">Connected</Badge>
    if (integration.sync_status === 'failed') return <Badge variant="destructive">Error</Badge>
    return <Badge variant="outline">Pending</Badge>
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Shop Management Integrations</h1>
        <p className="text-muted-foreground">
          Connect your existing shop management software to enhance it with AI diagnostics
        </p>
      </div>

      <Tabs defaultValue="mitchell1" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="mitchell1">Mitchell 1</TabsTrigger>
          <TabsTrigger value="tekmetric">Tekmetric</TabsTrigger>
          <TabsTrigger value="shopware">Shop-Ware</TabsTrigger>
        </TabsList>

        {/* Mitchell 1 */}
        <TabsContent value="mitchell1">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Mitchell 1 Shop Management</CardTitle>
                  <CardDescription>
                    Connect to Mitchell 1 ProDemand and Manager SE
                  </CardDescription>
                </div>
                {getStatusBadge(mitchell1Integration)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {mitchell1Integration && (
                <div className="flex items-center justify-between border rounded-lg p-4">
                  <div>
                    <p className="font-medium">Integration Active</p>
                    <p className="text-sm text-muted-foreground">
                      Last synced: {mitchell1Integration.last_sync_at ? new Date(mitchell1Integration.last_sync_at).toLocaleString() : 'Never'}
                    </p>
                  </div>
                  <Switch
                    checked={mitchell1Integration.is_active}
                    onCheckedChange={(checked) => toggleIntegration(mitchell1Integration.id, checked)}
                  />
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="mitchell1-apikey">API Key</Label>
                  <Input
                    id="mitchell1-apikey"
                    type="password"
                    placeholder="Enter your Mitchell 1 API key"
                    value={mitchell1Credentials.apiKey}
                    onChange={(e) => setMitchell1Credentials({ ...mitchell1Credentials, apiKey: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="mitchell1-subscription">Subscription ID</Label>
                  <Input
                    id="mitchell1-subscription"
                    placeholder="Your Mitchell 1 subscription ID"
                    value={mitchell1Credentials.subscriptionId}
                    onChange={(e) => setMitchell1Credentials({ ...mitchell1Credentials, subscriptionId: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => testConnection('mitchell1', mitchell1Credentials)}
                    disabled={testing === 'mitchell1' || !mitchell1Credentials.apiKey}
                    variant="outline"
                  >
                    {testing === 'mitchell1' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Test Connection
                  </Button>
                  <Button
                    onClick={() => saveIntegration('mitchell1', mitchell1Credentials)}
                    disabled={saving === 'mitchell1' || !mitchell1Credentials.apiKey}
                  >
                    {saving === 'mitchell1' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save Integration
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tekmetric */}
        <TabsContent value="tekmetric">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tekmetric</CardTitle>
                  <CardDescription>
                    Connect to Tekmetric shop management platform
                  </CardDescription>
                </div>
                {getStatusBadge(tekmetricIntegration)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {tekmetricIntegration && (
                <div className="flex items-center justify-between border rounded-lg p-4">
                  <div>
                    <p className="font-medium">Integration Active</p>
                    <p className="text-sm text-muted-foreground">
                      Last synced: {tekmetricIntegration.last_sync_at ? new Date(tekmetricIntegration.last_sync_at).toLocaleString() : 'Never'}
                    </p>
                  </div>
                  <Switch
                    checked={tekmetricIntegration.is_active}
                    onCheckedChange={(checked) => toggleIntegration(tekmetricIntegration.id, checked)}
                  />
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="tekmetric-apikey">API Key</Label>
                  <Input
                    id="tekmetric-apikey"
                    type="password"
                    placeholder="Enter your Tekmetric API key"
                    value={tekmetricCredentials.apiKey}
                    onChange={(e) => setTekmetricCredentials({ ...tekmetricCredentials, apiKey: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="tekmetric-shopid">Shop ID</Label>
                  <Input
                    id="tekmetric-shopid"
                    placeholder="Your Tekmetric shop ID"
                    value={tekmetricCredentials.shopId}
                    onChange={(e) => setTekmetricCredentials({ ...tekmetricCredentials, shopId: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => testConnection('tekmetric', tekmetricCredentials)}
                    disabled={testing === 'tekmetric' || !tekmetricCredentials.apiKey}
                    variant="outline"
                  >
                    {testing === 'tekmetric' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Test Connection
                  </Button>
                  <Button
                    onClick={() => saveIntegration('tekmetric', tekmetricCredentials)}
                    disabled={saving === 'tekmetric' || !tekmetricCredentials.apiKey}
                  >
                    {saving === 'tekmetric' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save Integration
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shop-Ware */}
        <TabsContent value="shopware">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Shop-Ware</CardTitle>
                  <CardDescription>
                    Connect to Shop-Ware management system
                  </CardDescription>
                </div>
                {getStatusBadge(shopwareIntegration)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {shopwareIntegration && (
                <div className="flex items-center justify-between border rounded-lg p-4">
                  <div>
                    <p className="font-medium">Integration Active</p>
                    <p className="text-sm text-muted-foreground">
                      Last synced: {shopwareIntegration.last_sync_at ? new Date(shopwareIntegration.last_sync_at).toLocaleString() : 'Never'}
                    </p>
                  </div>
                  <Switch
                    checked={shopwareIntegration.is_active}
                    onCheckedChange={(checked) => toggleIntegration(shopwareIntegration.id, checked)}
                  />
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="shopware-apikey">API Key</Label>
                  <Input
                    id="shopware-apikey"
                    type="password"
                    placeholder="Enter your Shop-Ware API key"
                    value={shopwareCredentials.apiKey}
                    onChange={(e) => setShopwareCredentials({ ...shopwareCredentials, apiKey: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="shopware-clientid">Client ID</Label>
                  <Input
                    id="shopware-clientid"
                    placeholder="Your Shop-Ware client ID"
                    value={shopwareCredentials.clientId}
                    onChange={(e) => setShopwareCredentials({ ...shopwareCredentials, clientId: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="shopware-clientsecret">Client Secret</Label>
                  <Input
                    id="shopware-clientsecret"
                    type="password"
                    placeholder="Your Shop-Ware client secret"
                    value={shopwareCredentials.clientSecret}
                    onChange={(e) => setShopwareCredentials({ ...shopwareCredentials, clientSecret: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => testConnection('shopware', shopwareCredentials)}
                    disabled={testing === 'shopware' || !shopwareCredentials.apiKey}
                    variant="outline"
                  >
                    {testing === 'shopware' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Test Connection
                  </Button>
                  <Button
                    onClick={() => saveIntegration('shopware', shopwareCredentials)}
                    disabled={saving === 'shopware' || !shopwareCredentials.apiKey}
                  >
                    {saving === 'shopware' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save Integration
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>How Integrations Work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Your AI diagnostic layer sits on top of existing software
            </h4>
            <p className="text-sm text-muted-foreground pl-6">
              We don't replace your Mitchell 1, Tekmetric, or Shop-Ware - we enhance it with AI-powered diagnostics
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Automatic sync of customer, vehicle, and repair order data
            </h4>
            <p className="text-sm text-muted-foreground pl-6">
              AI diagnostics automatically attach to work orders in your existing system
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Two-way sync keeps everything in sync
            </h4>
            <p className="text-sm text-muted-foreground pl-6">
              Updates in either system are reflected in both platforms
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
