'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import ProductCard from '@/components/products/ProductCard'
import { createClient } from '@/lib/supabase/client'
import { Product } from '@/lib/types'

/**
 * Hidden page at /out-of-stock. Not linked from navigation. Shows legacy SKUs
 * that have been taken out of stock (stock_qty = 0) so we still have a trail.
 * ProductCard already renders a SOLD OUT overlay and disables add-to-cart
 * when stock_qty === 0.
 */
export default function OutOfStockPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .eq('stock_qty', 0)
      .order('name', { ascending: true })
      .then(({ data }) => {
        setProducts(data ?? [])
        setLoading(false)
      })
  }, [])

  return (
    <div className="space-y-4">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to store
      </Link>

      <div className="bg-gray-100 rounded-xl p-4">
        <p className="text-lg font-bold text-gray-900">Out of stock</p>
        <p className="text-sm text-gray-600 mt-0.5">
          These items have sold out. Browse the main store for what&apos;s in
          stock this week.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-2">✨</p>
          <p>Nothing out of stock right now</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
