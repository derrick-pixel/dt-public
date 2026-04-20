import { createClient } from '@/lib/supabase/server'
import { formatSGD, getWeekCutoffDate } from '@/lib/utils/order'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import MarkPaidButton from './MarkPaidButton'

const statusColors: Record<string, string> = {
  pending_payment: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  out_for_delivery: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default async function AdminOrdersPage() {
  const supabase = await createClient()
  const weekCutoff = getWeekCutoffDate()

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id, status, payment_status, total_amount, payment_ref, postal_code, created_at,
      dormitory:dormitories(name),
      user:users(full_name, phone)
    `)
    .eq('week_cutoff', weekCutoff)
    .order('created_at', { ascending: false })

  const unpaidCount = (orders ?? []).filter((o) => o.payment_status === 'unpaid').length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-sm text-gray-500">
            Week: {weekCutoff} · {orders?.length ?? 0} orders
            {unpaidCount > 0 && (
              <span className="ml-2 text-orange-600 font-semibold">· {unpaidCount} pending payment</span>
            )}
          </p>
        </div>
      </div>

      {unpaidCount > 0 && (
        <Card className="p-3 bg-orange-50 border-orange-200">
          <p className="text-sm text-orange-800">
            💡 Check your PayNow (+65 8363 8499) for incoming transfers. Match by the payment reference shown below.
          </p>
        </Card>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Order', 'Customer', 'Dormitory', 'Payment Ref', 'Total', 'Payment', 'Status', 'Date', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {(orders ?? []).map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{(order.user as { full_name?: string } | null)?.full_name ?? '—'}</p>
                    <p className="text-xs text-gray-400">{(order.user as { phone?: string } | null)?.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {(order.dormitory as { name?: string } | null)?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs bg-yellow-50 border border-yellow-200 px-2 py-1 rounded text-yellow-800 font-semibold">
                      {order.payment_ref ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold">{formatSGD(order.total_amount)}</td>
                  <td className="px-4 py-3">
                    <Badge className={order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                      {order.payment_status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={statusColors[order.status] ?? 'bg-gray-100 text-gray-700'}>
                      {order.status.replace(/_/g, ' ')}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                    {format(new Date(order.created_at), 'd MMM, h:mm a')}
                  </td>
                  <td className="px-4 py-3">
                    {order.payment_status === 'unpaid' && (
                      <MarkPaidButton orderId={order.id} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
