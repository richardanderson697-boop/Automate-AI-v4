'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface WorkOrder {
  id: string
  customer_name: string
  vehicle_info: string
  description: string
  status: string
  total_cost: number
  created_at: string
}

export function WorkOrdersClient({ initialWorkOrders }: { initialWorkOrders: WorkOrder[] }) {
  const [workOrders] = useState(initialWorkOrders)

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500',
    in_progress: 'bg-blue-500',
    completed: 'bg-green-500',
    cancelled: 'bg-red-500',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Work Orders</h1>
          <p className="text-muted-foreground">Track vehicle repairs and services</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Work Order
        </Button>
      </div>

      <div className="grid gap-4">
        {workOrders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{order.customer_name}</CardTitle>
                <Badge className={statusColors[order.status] || 'bg-gray-500'}>
                  {order.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{order.vehicle_info}</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-2">{order.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString()}
                </span>
                <span className="font-bold">${order.total_cost?.toFixed(2) || '0.00'}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
