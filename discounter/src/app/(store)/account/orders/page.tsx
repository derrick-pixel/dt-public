'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Package } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button, buttonVariants } from '@/components/ui/button'
import { formatSGD } from '@/lib/utils/order'
import { format } from 'date-fns'
import { toast } from 'sonner'

const statusColors: Record<string, string> = {
  pending_payment: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  out_for_delivery: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

interface Order {
  id: string
  status: string
  payment_status: string
  total_amount: number
  created_at: string
  dormitory: { name: string } | null
  order_items: { quantity: number; unit_price: number; product: { name: string } | null }[]
}

export default function MyOrdersPage() {
  const [phone, setPhone] = useState('')
  const [orders, setOrders] = useState<Order[]>([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)

  async function lookup() {
    if (!phone.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/orders/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Lookup failed')
        setOrders([])
        setSearched(true)
        return
      }
      if (data.orders.length === 0) {
        toast.error('No orders found for this number')
      }
      setOrders(data.orders)
      setSearched(true)
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/" className="text-gray-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-bold">My Orders</h1>
      </div>

      {/* Phone lookup */}
      <Card className="p-4 space-y-3">
        <p className="text-sm text-gray-600">Enter your phone number to view your orders</p>
        <div className="flex gap-2">
          <Input
            placeholder="+65 9123 4567"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && lookup()}
          />
          <Button onClick={lookup} disabled={loading} className="bg-red-600 hover:bg-red-700 flex-shrink-0">
            {loading ? '...' : 'Look up'}
          </Button>
        </div>
      </Card>

      {searched && orders.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <Package className="w-12 h-12 mx-auto mb-2 text-gray-200" />
          <p>No orders found</p>
        </div>
      )}

      {orders.map((order) => (
        <Card key={order.id} className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-sm">#{order.id.slice(0, 8).toUpperCase()}</p>
              <p className="text-xs text-gray-400">{format(new Date(order.created_at), 'd MMM yyyy, h:mm a')}</p>
            </div>
            <Badge className={statusColors[order.status] ?? 'bg-gray-100 text-gray-700'}>
              {order.status.replace(/_/g, ' ')}
            </Badge>
          </div>

          <div className="space-y-1">
            {order.order_items?.map((item, i) => (
              <div key={i} className="flex justify-between text-sm text-gray-600">
                <span className="line-clamp-1 flex-1">{item.product?.name ?? 'Item'} × {item.quantity}</span>
                <span className="flex-shrink-0 ml-2">{formatSGD(item.unit_price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-1 border-t">
            <p className="text-xs text-gray-400">📍 {order.dormitory?.name ?? '—'}</p>
            <p className="font-bold text-red-600">{formatSGD(order.total_amount)}</p>
          </div>
        </Card>
      ))}
    </div>
  )
}
