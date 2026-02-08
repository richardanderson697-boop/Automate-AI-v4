'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ShoppingCart, Trash2 } from 'lucide-react'

interface Part {
  id: string
  name: string
  part_number: string
  price: number
}

interface CartItem extends Part {
  quantity: number
}

export function POSClient({ parts }: { parts: Part[] }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [search, setSearch] = useState('')

  const filteredParts = parts.filter(part =>
    part.name.toLowerCase().includes(search.toLowerCase()) ||
    part.part_number.toLowerCase().includes(search.toLowerCase())
  )

  function addToCart(part: Part) {
    const existing = cart.find(item => item.id === part.id)
    if (existing) {
      setCart(cart.map(item =>
        item.id === part.id ? { ...item, quantity: item.quantity + 1 } : item
      ))
    } else {
      setCart([...cart, { ...part, quantity: 1 }])
    }
  }

  function removeFromCart(partId: string) {
    setCart(cart.filter(item => item.id !== partId))
  }

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  async function handleCheckout() {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart: cart.map(item => ({ partId: item.id, quantity: item.quantity, price: item.price })),
          paymentMethod: 'cash'
        }),
      })

      if (response.ok) {
        setCart([])
        alert('Sale completed successfully!')
      }
    } catch (error) {
      console.error('Checkout error:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Point of Sale</h1>
        <p className="text-muted-foreground">Process customer sales</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Available Parts</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search parts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-4"
            />
            <div className="space-y-2 max-h-96 overflow-auto">
              {filteredParts.map((part) => (
                <div key={part.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="font-medium">{part.name}</p>
                    <p className="text-sm text-muted-foreground">${part.price.toFixed(2)}</p>
                  </div>
                  <Button size="sm" onClick={() => addToCart(part)}>Add</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Cart
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cart.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Cart is empty</p>
            ) : (
              <>
                <div className="space-y-2 mb-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} x ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <Button size="sm" variant="destructive" onClick={() => removeFromCart(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold mb-4">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <Button onClick={handleCheckout} className="w-full">Complete Sale</Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
