import { Mitchell1Integration } from './mitchell1'
import { TekmetricIntegration } from './tekmetric'
import { ShopWareIntegration } from './shopware'
import { createClient } from '@/lib/supabase/server'

export type IntegrationType = 'mitchell1' | 'tekmetric' | 'shopware' | 'none'

export interface IntegrationConfig {
  type: IntegrationType
  apiKey: string
  shopId: string
  locationId?: string
  baseUrl?: string
  enabled: boolean
}

export class IntegrationManager {
  private organizationId: string
  private config?: IntegrationConfig

  constructor(organizationId: string) {
    this.organizationId = organizationId
  }

  async loadConfig(): Promise<IntegrationConfig | null> {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('organization_integrations')
      .select('*')
      .eq('organization_id', this.organizationId)
      .single()

    if (error || !data) {
      return null
    }

    this.config = {
      type: data.integration_type,
      apiKey: data.api_key,
      shopId: data.shop_id,
      locationId: data.location_id,
      baseUrl: data.base_url,
      enabled: data.enabled,
    }

    return this.config
  }

  async saveConfig(config: IntegrationConfig): Promise<void> {
    const supabase = await createClient()

    await supabase
      .from('organization_integrations')
      .upsert({
        organization_id: this.organizationId,
        integration_type: config.type,
        api_key: config.apiKey,
        shop_id: config.shopId,
        location_id: config.locationId,
        base_url: config.baseUrl,
        enabled: config.enabled,
        updated_at: new Date().toISOString(),
      })

    this.config = config
  }

  getIntegration() {
    if (!this.config || !this.config.enabled) {
      return null
    }

    switch (this.config.type) {
      case 'mitchell1':
        return new Mitchell1Integration({
          apiKey: this.config.apiKey,
          shopId: this.config.shopId,
          baseUrl: this.config.baseUrl,
        })
      
      case 'tekmetric':
        return new TekmetricIntegration({
          apiKey: this.config.apiKey,
          shopId: this.config.shopId,
          baseUrl: this.config.baseUrl,
        })
      
      case 'shopware':
        return new ShopWareIntegration({
          apiKey: this.config.apiKey,
          locationId: this.config.locationId || this.config.shopId,
          baseUrl: this.config.baseUrl,
        })
      
      default:
        return null
    }
  }

  async syncDiagnosticResult(externalOrderId: string, diagnostic: {
    diagnosis: string
    recommendedParts: string[]
    estimatedCost: number
    confidence: number
    educationalVideos?: Array<{ title: string; url: string }>
  }) {
    const integration = this.getIntegration()
    
    if (!integration) {
      console.log('[v0] No integration configured, skipping sync')
      return { synced: false, reason: 'no_integration' }
    }

    try {
      await integration.pushDiagnosticResults(externalOrderId, diagnostic)
      
      // Log sync activity
      const supabase = await createClient()
      await supabase.from('integration_sync_log').insert({
        organization_id: this.organizationId,
        integration_type: this.config?.type,
        action: 'push_diagnostic',
        external_id: externalOrderId,
        status: 'success',
        created_at: new Date().toISOString(),
      })

      return { synced: true }
    } catch (error) {
      console.error('[v0] Integration sync failed:', error)
      
      // Log failure
      const supabase = await createClient()
      await supabase.from('integration_sync_log').insert({
        organization_id: this.organizationId,
        integration_type: this.config?.type,
        action: 'push_diagnostic',
        external_id: externalOrderId,
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        created_at: new Date().toISOString(),
      })

      return { synced: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    const integration = this.getIntegration()
    
    if (!integration) {
      return { success: false, message: 'No integration configured' }
    }

    try {
      // Try a simple API call to test credentials
      if ('searchCustomers' in integration) {
        await integration.searchCustomers('test')
      }
      
      return { success: true, message: 'Connection successful' }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed',
      }
    }
  }
}
