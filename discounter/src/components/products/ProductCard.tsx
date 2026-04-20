'use client'

import Image from 'next/image'
import { ShoppingCart, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Product } from '@/lib/types'
import { formatSGD, expiryLabel, expiryUrgency } from '@/lib/utils/order'
import { useCartStore } from '@/lib/store/cart'
import { toast } from 'sonner'

const urgencyColors = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  warning: 'bg-orange-100 text-orange-700 border-orange-200',
  ok: 'bg-green-100 text-green-700 border-green-200',
}

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem)
  const items = useCartStore((s) => s.items)
  const cartQty = items.find((i) => i.product.id === product.id)?.quantity ?? 0
  const urgency = expiryUrgency(product.expiry_date)
  const outOfStock = product.stock_qty === 0

  function handleAdd() {
    if (outOfStock) return
    if (cartQty >= product.stock_qty) {
      toast.error('Max stock reached')
      return
    }
    addItem(product)
    toast.success(`${product.name} added to cart`)
  }

  return (
    <Card className="overflow-hidden flex flex-col">
      {/* Product image */}
      <div className="relative aspect-square bg-gray-100">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-4xl">
            🛒
          </div>
        )}
        {/* Discount badge */}
        <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">
          -{product.discount_pct}%
        </div>
        {outOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold text-sm">SOLD OUT</span>
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col gap-2 flex-1">
        <p className="text-sm font-semibold leading-snug line-clamp-2">{product.name}</p>

        {/* Expiry */}
        <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border w-fit ${urgencyColors[urgency]}`}>
          {urgency === 'critical' && <AlertCircle className="w-3 h-3 flex-shrink-0" />}
          {expiryLabel(product.expiry_date)}
        </div>

        {/* Pricing */}
        <div className="flex items-baseline gap-2 mt-auto">
          <span className="text-red-600 font-bold text-base">{formatSGD(product.sale_price)}</span>
          <span className="text-gray-400 text-xs line-through">{formatSGD(product.original_price)}</span>
        </div>

        {/* Add to cart */}
        {cartQty > 0 ? (
          <div className="flex items-center justify-between bg-red-50 rounded-lg px-2 py-1">
            <button
              className="text-red-600 font-bold text-lg w-7 h-7 flex items-center justify-center"
              onClick={() => useCartStore.getState().updateQuantity(product.id, cartQty - 1)}
            >
              −
            </button>
            <span className="text-sm font-semibold">{cartQty}</span>
            <button
              className="text-red-600 font-bold text-lg w-7 h-7 flex items-center justify-center"
              onClick={handleAdd}
            >
              +
            </button>
          </div>
        ) : (
          <Button
            size="sm"
            className="w-full bg-red-600 hover:bg-red-700 text-white"
            onClick={handleAdd}
            disabled={outOfStock}
          >
            <ShoppingCart className="w-3.5 h-3.5 mr-1" />
            Add to cart
          </Button>
        )}
      </div>
    </Card>
  )
}
