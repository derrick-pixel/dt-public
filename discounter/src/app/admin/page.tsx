import { createClient } from '@/lib/supabase/server'
import { formatSGD, getWeekCutoffDate } from '@/lib/utils/order'
import { ShoppingBag, Package, DollarSign, Users } from 'lucide-react'
import { Card } from '@/components/ui/card'
import SeedButton from './SeedButton'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const weekCutoff = getWeekCutoffDate()

  const [ordersRes, productsRes, usersRes] = await Promise.all([
    supabase.from('orders').select('id, total_amount, payment_status').eq('week_cutoff', weekCutoff),
    supabase.from('products').select('id, stock_qty').eq('is_active', true),
    supabase.from('users').select('id').eq('role', 'customer'),
  ])

  const orders = ordersRes.data ?? []
  const products = productsRes.data ?? []
  const users = usersRes.data ?? []

  const paidOrders = orders.filter((o) => o.payment_status === 'paid')
  const weekRevenue = paidOrders.reduce((sum, o) => sum + o.total_amount, 0)
  const lowStockCount = products.filter((p) => p.stock_qty <= 5).length

  const stats = [
    { label: 'Orders This Week', value: orders.length, icon: ShoppingBag, color: 'text-blue-600 bg-blue-50' },
    { label: 'Revenue This Week', value: formatSGD(weekRevenue), icon: DollarSign, color: 'text-green-600 bg-green-50' },
    { label: 'Active Products', value: products.length, icon: Package, color: 'text-orange-600 bg-orange-50' },
    { label: 'Total Customers', value: users.length, icon: Users, color: 'text-purple-600 bg-purple-50' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Week cutoff: {weekCutoff}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="p-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </Card>
        ))}
      </div>

      {lowStockCount > 0 && (
        <Card className="p-4 border-orange-200 bg-orange-50">
          <p className="text-sm font-semibold text-orange-800">
            ⚠️ {lowStockCount} product{lowStockCount > 1 ? 's' : ''} running low on stock (≤5 units)
          </p>
        </Card>
      )}

      {products.length === 0 && (
        <Card className="p-6 border-dashed border-2 border-gray-200 text-center space-y-3">
          <p className="text-gray-500 text-sm">No products yet. Load the 30 starter SKUs to get started.</p>
          <SeedButton />
        </Card>
      )}
    </div>
  )
}
