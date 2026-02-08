/**
 * Mitchell 1 Shop Management Integration
 * API Documentation: https://www.mitchell1.com/api-documentation
 * 
 * Capabilities:
 * - Sync customer data
 * - Pull vehicle information
 * - Push diagnostic results
 * - Update repair orders
 */

export interface Mitchell1Config {
  apiKey: string
  shopId: string
  baseUrl?: string
}

export interface Mitchell1Customer {
  customerId: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  address?: {
    street: string
    city: string
    state: string
    zip: string
  }
}

export interface Mitchell1Vehicle {
  vehicleId: string
  customerId: string
  year: number
  make: string
  model: string
  vin?: string
  licensePlate?: string
  mileage?: number
}

export interface Mitchell1RepairOrder {
  roNumber: string
  customerId: string
  vehicleId: string
  status: 'open' | 'in_progress' | 'completed' | 'invoiced'
  concerns: string[]
  estimatedCost?: number
  laborHours?: number
}

export class Mitchell1Integration {
  private config: Mitchell1Config
  private baseUrl: string

  constructor(config: Mitchell1Config) {
    this.config = config
    this.baseUrl = config.baseUrl || 'https://api.mitchell1.com/v2'
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
      throw new Error(`Mitchell 1 API error: ${response.statusText}`)
    }

    return response.json()
  }

  // Customer Management
  async getCustomer(customerId: string): Promise<Mitchell1Customer> {
    return this.request(`/customers/${customerId}`)
  }

  async searchCustomers(query: string): Promise<Mitchell1Customer[]> {
    return this.request(`/customers/search?q=${encodeURIComponent(query)}`)
  }

  async createCustomer(customer: Partial<Mitchell1Customer>): Promise<Mitchell1Customer> {
    return this.request('/customers', {
      method: 'POST',
      body: JSON.stringify(customer),
    })
  }

  // Vehicle Management
  async getVehicle(vehicleId: string): Promise<Mitchell1Vehicle> {
    return this.request(`/vehicles/${vehicleId}`)
  }

  async getCustomerVehicles(customerId: string): Promise<Mitchell1Vehicle[]> {
    return this.request(`/customers/${customerId}/vehicles`)
  }

  async createVehicle(vehicle: Partial<Mitchell1Vehicle>): Promise<Mitchell1Vehicle> {
    return this.request('/vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicle),
    })
  }

  // Repair Orders
  async getRepairOrder(roNumber: string): Promise<Mitchell1RepairOrder> {
    return this.request(`/repair-orders/${roNumber}`)
  }

  async createRepairOrder(ro: Partial<Mitchell1RepairOrder>): Promise<Mitchell1RepairOrder> {
    return this.request('/repair-orders', {
      method: 'POST',
      body: JSON.stringify(ro),
    })
  }

  async updateRepairOrder(roNumber: string, updates: Partial<Mitchell1RepairOrder>): Promise<Mitchell1RepairOrder> {
    return this.request(`/repair-orders/${roNumber}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
  }

  // AI Diagnostic Integration
  async pushDiagnosticResults(roNumber: string, diagnostic: {
    diagnosis: string
    recommendedParts: string[]
    estimatedCost: number
    confidence: number
  }) {
    return this.request(`/repair-orders/${roNumber}/notes`, {
      method: 'POST',
      body: JSON.stringify({
        type: 'ai_diagnostic',
        content: `AI Diagnosis (${diagnostic.confidence}% confidence):\n${diagnostic.diagnosis}\n\nRecommended Parts:\n${diagnostic.recommendedParts.join('\n')}\n\nEstimated Cost: $${diagnostic.estimatedCost}`,
        metadata: diagnostic,
      }),
    })
  }
}
