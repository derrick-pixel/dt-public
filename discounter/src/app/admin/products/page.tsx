import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatSGD, expiryLabel, expiryUrgency } from '@/lib/utils/order'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Plus, AlertCircle } from 'lucide-react'

export default async function AdminProductsPage() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  const urgencyStyle = {
    critical: 'bg-red-100 text-red-700',
    warning: 'bg-orange-100 text-orange-700',
    ok: 'bg-green-100 text-green-700',
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link href="/admin/products/new" className={buttonVariants({ className: 'bg-red-600 hover:bg-red-700 flex items-center gap-1' })}>
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Product', 'Category', 'Price', 'Discount', 'Expiry', 'Stock', 'Status'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {(products ?? []).map((p) => {
                const urgency = expiryUrgency(p.expiry_date)
                return (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/products/${p.id}`} className="font-medium hover:text-red-600">
                        {p.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 capitalize text-gray-500">{p.category.replace('_', ' ')}</td>
                    <td className="px-4 py-3">
                      <span className="text-red-600 font-semibold">{formatSGD(p.sale_price)}</span>
                      <span className="text-gray-400 text-xs ml-1 line-through">{formatSGD(p.original_price)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className="bg-red-100 text-red-700 hover:bg-red-100">-{p.discount_pct}%</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full w-fit ${urgencyStyle[urgency]}`}>
                        {urgency === 'critical' && <AlertCircle className="w-3 h-3" />}
                        {expiryLabel(p.expiry_date)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={p.stock_qty <= 5 ? 'text-orange-600 font-semibold' : ''}>{p.stock_qty}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={p.is_active ? 'default' : 'secondary'}>
                        {p.is_active ? 'Active' : 'Hidden'}
                      </Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
