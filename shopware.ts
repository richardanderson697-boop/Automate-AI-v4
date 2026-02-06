/**
 * Shop-Ware Integration
 * API Documentation: https://shopwareconnect.com/api
 * 
 * Best for digital customer experience
 * Strong focus on customer communication and transparency
 */

export interface ShopWareConfig {
  apiKey: string
  locationId: string
  baseUrl?: string
}

export interface ShopWareCustomer {
  customerId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address?: {
    line1: string
    line2?: string
    city: string
    state: string
    postalCode: string
  }
  communicationPreferences?: {
    email: boolean
    sms: boolean
    app: boolean
  }
}

export interface ShopWareVehicle {
  vehicleId: string
  customerId: string
  year: number
  make: string
  model: string
  trim?: string
  vin: string
  licensePlate?: string
  color?: string
  mileage: number
  lastServiceDate?: string
}

export interface ShopWareServiceOrder {
  orderId: string
  orderNumber: string
  customerId: string
  vehicleId: string
  status: 'pending' | 'approved' | 'in_progress' | 'completed' | 'delivered' | 'invoiced'
  customerConcerns: string[]
  technicianNotes?: string
  subtotal: number
  tax: number
  total: number
  estimatedCompletionDate?: string
  customerApprovalRequired: boolean
}

export interface ShopWareLineItem {
  itemId: string
  orderId: string
  type: 'labor' | 'part' | 'sublet' | 'fee'
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
  approved: boolean
}

export class ShopWareIntegration {
  private config: ShopWareConfig
  private baseUrl: string

  constructor(config: ShopWareConfig) {
    this.config = config
    this.baseUrl = config.baseUrl || 'https://api.shopwareconnect.com/v2'
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const headers = {
      'Authorization': `ApiKey ${this.config.apiKey}`,
      'X-Location-ID': this.config.locationId,
      'Content-Type': 'application/json',
      ...options.headers,
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(`Shop-Ware API error: ${error.message || response.statusText}`)
    }

    return response.json()
  }

  // Customer Management
  async getCustomer(customerId: string): Promise<ShopWareCustomer> {
    return this.request(`/customers/${customerId}`)
  }

  async searchCustomers(query: string): Promise<ShopWareCustomer[]> {
    return this.request(`/customers/search?q=${encodeURIComponent(query)}`)
  }

  async createCustomer(customer: Partial<ShopWareCustomer>): Promise<ShopWareCustomer> {
    return this.request('/customers', {
      method: 'POST',
      body: JSON.stringify(customer),
    })
  }

  async updateCustomer(customerId: string, updates: Partial<ShopWareCustomer>): Promise<ShopWareCustomer> {
    return this.request(`/customers/${customerId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
  }

  // Vehicle Management
  async getVehicle(vehicleId: string): Promise<ShopWareVehicle> {
    return this.request(`/vehicles/${vehicleId}`)
  }

  async getCustomerVehicles(customerId: string): Promise<ShopWareVehicle[]> {
    return this.request(`/customers/${customerId}/vehicles`)
  }

  async createVehicle(vehicle: Partial<ShopWareVehicle>): Promise<ShopWareVehicle> {
    return this.request('/vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicle),
    })
  }

  async updateVehicleMileage(vehicleId: string, mileage: number): Promise<ShopWareVehicle> {
    return this.request(`/vehicles/${vehicleId}`, {
      method: 'PATCH',
      body: JSON.stringify({ mileage }),
    })
  }

  // Service Orders
  async getServiceOrder(orderId: string): Promise<ShopWareServiceOrder> {
    return this.request(`/service-orders/${orderId}`)
  }

  async getServiceOrders(filters?: {
    status?: string
    customerId?: string
    startDate?: string
    endDate?: string
  }): Promise<ShopWareServiceOrder[]> {
    const params = new URLSearchParams(filters as any)
    return this.request(`/service-orders?${params}`)
  }

  async createServiceOrder(order: Partial<ShopWareServiceOrder>): Promise<ShopWareServiceOrder> {
    return this.request('/service-orders', {
      method: 'POST',
      body: JSON.stringify(order),
    })
  }

  async updateServiceOrder(orderId: string, updates: Partial<ShopWareServiceOrder>): Promise<ShopWareServiceOrder> {
    return this.request(`/service-orders/${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
  }

  // Line Items
  async addLineItem(orderId: string, item: Partial<ShopWareLineItem>): Promise<ShopWareLineItem> {
    return this.request(`/service-orders/${orderId}/line-items`, {
      method: 'POST',
      body: JSON.stringify(item),
    })
  }

  async updateLineItem(orderId: string, itemId: string, updates: Partial<ShopWareLineItem>): Promise<ShopWareLineItem> {
    return this.request(`/service-orders/${orderId}/line-items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
  }

  // AI Diagnostic Integration
  async pushDiagnosticResults(orderId: string, diagnostic: {
    diagnosis: string
    recommendedParts: string[]
    estimatedCost: number
    confidence: number
    educationalVideos?: Array<{ title: string; url: string }>
  }) {
    // Add technician note with AI diagnosis
    await this.request(`/service-orders/${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        technicianNotes: `🤖 AI-Powered Diagnostic Analysis (${diagnostic.confidence}% confidence)\n\n${diagnostic.diagnosis}\n\nRecommended Services:\n${diagnostic.recommendedParts.join('\n')}\n\nEstimated Cost: $${diagnostic.estimatedCost.toFixed(2)}`,
      }),
    })

    // Add recommended line items (not approved yet - requires customer approval)
    for (const part of diagnostic.recommendedParts) {
      await this.addLineItem(orderId, {
        type: 'part',
        description: `AI Recommended: ${part}`,
        quantity: 1,
        unitPrice: 0, // Shop will fill in actual pricing
        totalPrice: 0,
        approved: false, // Requires customer approval via Shop-Ware's digital authorization
      })
    }

    // Send customer notification with educational videos (Shop-Ware's strength)
    if (diagnostic.educationalVideos && diagnostic.educationalVideos.length > 0) {
      await this.sendCustomerNotification(orderId, {
        subject: 'Your Vehicle Diagnostic Results',
        message: `We've completed an AI-powered diagnostic analysis of your vehicle.\n\n${diagnostic.diagnosis}\n\nWe've also found some helpful videos that explain the issues and repairs:\n\n${diagnostic.educationalVideos.map(v => `• ${v.title}: ${v.url}`).join('\n')}\n\nPlease review and approve the recommended services in your customer portal.`,
        includeVideoLinks: true,
      })
    }

    return { success: true }
  }

  // Customer Communication (Shop-Ware's specialty)
  async sendCustomerNotification(orderId: string, notification: {
    subject: string
    message: string
    includeVideoLinks?: boolean
  }) {
    return this.request(`/service-orders/${orderId}/notifications`, {
      method: 'POST',
      body: JSON.stringify(notification),
    })
  }

  async requestCustomerApproval(orderId: string, lineItemIds: string[]) {
    return this.request(`/service-orders/${orderId}/request-approval`, {
      method: 'POST',
      body: JSON.stringify({
        lineItemIds,
        message: 'Please review and approve these AI-recommended services via your customer portal.',
      }),
    })
  }
}
