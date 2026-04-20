import { createClient } from '@/lib/supabase/server'
import { formatSGD, getWeekCutoffDate } from '@/lib/utils/order'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface OrderItem {
  quantity: number
  unit_price: number
  product: { name: string }
}

interface DormOrder {
  id: string
  total_amount: number
  payment_status: string
  user: { full_name: string | null; phone: string } | null
  order_items: OrderItem[]
}

export default async function DeliveryPage() {
  const supabase = await createClient()
  const weekCutoff = getWeekCutoffDate()

  const { data: dormitories } = await supabase
    .from('dormitories')
    .select('id, name, address, delivery_day')
    .eq('is_active', true)
    .order('name')

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id, dormitory_id, total_amount, payment_status,
      user:users(full_name, phone),
      order_items(quantity, unit_price, product:products(name))
    `)
    .eq('week_cutoff', weekCutoff)
    .eq('payment_status', 'paid')

  // Group by dormitory
  const byDorm: Record<string, DormOrder[]> = {}
  for (const order of orders ?? []) {
    const key = order.dormitory_id
    if (!byDorm[key]) byDorm[key] = []
    byDorm[key].push(order as unknown as DormOrder)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Delivery Manifest</h1>
        <p className="text-sm text-gray-500">Week cutoff: {weekCutoff} · Paid orders only</p>
      </div>

      {(dormitories ?? []).map((dorm) => {
        const dormOrders = byDorm[dorm.id] ?? []
        if (dormOrders.length === 0) return null

        const dormTotal = dormOrders.reduce((s, o) => s + o.total_amount, 0)

        // Aggregate items across orders for this dorm
        const itemMap: Record<string, { name: string; qty: number }> = {}
        for (const order of dormOrders) {
          for (const item of order.order_items ?? []) {
            const name = item.product?.name ?? 'Unknown'
            if (!itemMap[name]) itemMap[name] = { name, qty: 0 }
            itemMap[name].qty += item.quantity
          }
        }

        return (
          <Card key={dorm.id} className="p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold">{dorm.name}</h2>
                <p className="text-xs text-gray-400">{dorm.address}</p>
                <Badge className="mt-1 bg-blue-100 text-blue-700">Delivery: {dorm.delivery_day}</Badge>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-green-600">{formatSGD(dormTotal)}</p>
                <p className="text-xs text-gray-400">{dormOrders.length} order{dormOrders.length !== 1 ? 's' : ''}</p>
              </div>
            </div>

            {/* Consolidated items */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Items to pack</p>
              <div className="space-y-1">
                {Object.values(itemMap).map(({ name, qty }) => (
                  <div key={name} className="flex justify-between text-sm border-b pb-1">
                    <span>{name}</span>
                    <span className="font-semibold">× {qty}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Individual orders */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Customers ({dormOrders.length})</p>
              <div className="space-y-1">
                {dormOrders.map((order) => (
                  <div key={order.id} className="flex justify-between text-sm">
                    <span>
                      {order.user?.full_name ?? 'Unknown'} · {order.user?.phone}
                    </span>
                    <span className="font-semibold">{formatSGD(order.total_amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )
      })}

      {Object.keys(byDorm).length === 0 && (
        <div className="text-center py-12 text-gray-400">
          No paid orders for this week yet
        </div>
      )}
    </div>
  )
}
