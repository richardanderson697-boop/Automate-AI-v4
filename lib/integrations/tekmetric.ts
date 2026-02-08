/**
 * Tekmetric Integration
 * API Documentation: https://api.tekmetric.com/docs
 * 
 * Modern REST API with webhooks support
 * Great for multi-location shops
 */

export interface TekmetricConfig {
  apiKey: string
  shopId: string
  baseUrl?: string
}

export interface TekmetricCustomer {
  id: number
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  address?: string
  city?: string
  state?: string
  zip?: string
}

export interface TekmetricVehicle {
  id: number
  customerId: number
  year: number
  make: string
  model: string
  vin: string
  licensePlate?: string
  mileage?: number
  engineSize?: string
  transmission?: string
}

export interface TekmetricRepairOrder {
  id: number
  repairOrderNumber: string
  customerId: number
  vehicleId: number
  status: 'estimate' | 'awaiting_authorization' | 'in_progress' | 'ready' | 'completed' | 'invoiced'
  concerns: string
  totalAmount?: number
  createdDate: string
  completedDate?: string
}

export interface TekmetricJob {
  id: number
  repairOrderId: number
  name: string
  description: string
  laborCost: number
  partsCost: number
  status: string
}

export class TekmetricIntegration {
  private config: TekmetricConfig
  private baseUrl: string

  constructor(config: TekmetricConfig) {
    this.config = config
    this.baseUrl = config.baseUrl || 'https://api.tekmetric.com/api/v1'
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const headers = {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'X-Shop-ID': this.config.shopId,
      'Content-Type': 'application/json',
      ...options.headers,
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(`Tekmetric API error: ${error.message || response.statusText}`)
    }

    return response.json()
  }

  // Customer Management
  async getCustomer(customerId: number): Promise<TekmetricCustomer> {
    return this.request(`/customers/${customerId}`)
  }

  async searchCustomers(query: string): Promise<TekmetricCustomer[]> {
    return this.request(`/customers?search=${encodeURIComponent(query)}`)
  }

  async createCustomer(customer: Partial<TekmetricCustomer>): Promise<TekmetricCustomer> {
    return this.request('/customers', {
      method: 'POST',
      body: JSON.stringify(customer),
    })
  }

  // Vehicle Management
  async getVehicle(vehicleId: number): Promise<TekmetricVehicle> {
    return this.request(`/vehicles/${vehicleId}`)
  }

  async getCustomerVehicles(customerId: number): Promise<TekmetricVehicle[]> {
    return this.request(`/customers/${customerId}/vehicles`)
  }

  async createVehicle(vehicle: Partial<TekmetricVehicle>): Promise<TekmetricVehicle> {
    return this.request('/vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicle),
    })
  }

  // Repair Orders
  async getRepairOrder(repairOrderId: number): Promise<TekmetricRepairOrder> {
    return this.request(`/repair-orders/${repairOrderId}`)
  }

  async getRepairOrders(filters?: {
    status?: string
    customerId?: number
    startDate?: string
    endDate?: string
  }): Promise<TekmetricRepairOrder[]> {
    const params = new URLSearchParams(filters as any)
    return this.request(`/repair-orders?${params}`)
  }

  async createRepairOrder(ro: Partial<TekmetricRepairOrder>): Promise<TekmetricRepairOrder> {
    return this.request('/repair-orders', {
      method: 'POST',
      body: JSON.stringify(ro),
    })
  }

  async updateRepairOrder(repairOrderId: number, updates: Partial<TekmetricRepairOrder>): Promise<TekmetricRepairOrder> {
    return this.request(`/repair-orders/${repairOrderId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  // Jobs (Services on RO)
  async addJob(repairOrderId: number, job: Partial<TekmetricJob>): Promise<TekmetricJob> {
    return this.request(`/repair-orders/${repairOrderId}/jobs`, {
      method: 'POST',
      body: JSON.stringify(job),
    })
  }

  // AI Diagnostic Integration
  async pushDiagnosticResults(repairOrderId: number, diagnostic: {
    diagnosis: string
    recommendedParts: string[]
    estimatedCost: number
    confidence: number
  }) {
    // Add as internal note
    await this.request(`/repair-orders/${repairOrderId}/notes`, {
      method: 'POST',
      body: JSON.stringify({
        note: `🤖 AI Diagnosis (${diagnostic.confidence}% confidence):\n\n${diagnostic.diagnosis}\n\nRecommended Parts:\n${diagnostic.recommendedParts.join('\n')}\n\nEstimated Cost: $${diagnostic.estimatedCost.toFixed(2)}`,
        isInternal: false, // Make visible to customer
      }),
    })

    // Optionally create recommended jobs
    for (const part of diagnostic.recommendedParts) {
      await this.addJob(repairOrderId, {
        name: `Replace ${part}`,
        description: `AI-recommended service based on diagnostic analysis`,
        laborCost: 0,
        partsCost: 0,
        status: 'recommended',
      })
    }

    return { success: true }
  }

  // Webhooks
  async setupWebhook(url: string, events: string[]) {
    return this.request('/webhooks', {
      method: 'POST',
      body: JSON.stringify({
        url,
        events, // e.g., ['repair_order.created', 'repair_order.updated']
        active: true,
      }),
    })
  }
}
