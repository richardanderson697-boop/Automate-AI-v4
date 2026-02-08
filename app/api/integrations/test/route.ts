import { NextRequest, NextResponse } from 'next/server'
import { Mitchell1Integration } from '@/lib/integrations/mitchell1'
import { TekmetricIntegration } from '@/lib/integrations/tekmetric'
import { ShopWareIntegration } from '@/lib/integrations/shopware'

export async function POST(request: NextRequest) {
  try {
    const { provider, credentials } = await request.json()

    let result
    switch (provider) {
      case 'mitchell1':
        const mitchell1 = new Mitchell1Integration(
          credentials.api_key,
          credentials.client_id,
          credentials.client_secret
        )
        result = await mitchell1.testConnection()
        break
        
      case 'tekmetric':
        const tekmetric = new TekmetricIntegration(credentials.api_key)
        result = await tekmetric.testConnection()
        break
        
      case 'shopware':
        const shopware = new ShopWareIntegration(
          credentials.api_key,
          credentials.shop_id
        )
        result = await shopware.testConnection()
        break
        
      default:
        return NextResponse.json(
          { error: 'Invalid provider' },
          { status: 400 }
        )
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message || 'Connection successful',
      })
    } else {
      return NextResponse.json(
        { error: result.error || 'Connection failed' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('[v0] Integration test error:', error)
    return NextResponse.json(
      { error: 'Failed to test connection' },
      { status: 500 }
    )
  }
}
