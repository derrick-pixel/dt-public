'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Trash2, ShoppingBag, ChevronRight } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useCartStore } from '@/lib/store/cart'
import { createClient } from '@/lib/supabase/client'
import { Dormitory } from '@/lib/types'
import { formatSGD, getWeeklyCutoffLabel } from '@/lib/utils/order'

export default function CartPage() {
  const { items, dormitoryId, updateQuantity, removeItem, setDormitory, totalAmount } = useCartStore()
  const [dormitories, setDormitories] = useState<Dormitory[]>([])

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('dormitories')
      .select('*')
      .eq('is_active', true)
      .order('name')
      .then(({ data }) => setDormitories(data ?? []))
  }, [])

  if (items.length === 0) {
    return (
      <div className="text-center py-20 space-y-4">
        <ShoppingBag className="w-16 h-16 mx-auto text-gray-200" />
        <p className="text-gray-500">Your cart is empty</p>
        <Link href="/" className={buttonVariants({ className: 'bg-red-600 hover:bg-red-700' })}>
          Browse deals
        </Link>
      </div>
    )
  }

  const total = totalAmount()
  const canCheckout = !!dormitoryId && items.length > 0

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold">Your Cart</h1>

      {/* Dormitory selector */}
      <Card className="p-4 space-y-2">
        <p className="text-sm font-semibold">Deliver to which dormitory?</p>
        <Select value={dormitoryId ?? ''} onValueChange={(v) => setDormitory(v ?? '')}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select your dormitory" />
          </SelectTrigger>
          <SelectContent>
            {dormitories.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {dormitoryId && (
          <p className="text-xs text-gray-500">
            Delivery day: {dormitories.find((d) => d.id === dormitoryId)?.delivery_day}
          </p>
        )}
      </Card>

      {/* Order cutoff notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
        Order by <strong>{getWeeklyCutoffLabel()}</strong> to be included in this week&apos;s delivery.
      </div>

      {/* Cart items */}
      <div className="space-y-3">
        {items.map(({ product, quantity }) => (
          <Card key={product.id} className="p-3 flex gap-3">
            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              {product.image_url ? (
                <Image src={product.image_url} alt={product.name} fill className="object-cover" sizes="64px" />
              ) : (
                <div className="flex items-center justify-center h-full text-2xl">🛒</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold line-clamp-1">{product.name}</p>
              <p className="text-red-600 font-bold text-sm">{formatSGD(product.sale_price)}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <button
                  className="w-6 h-6 rounded-full border flex items-center justify-center text-sm font-bold text-gray-600"
                  onClick={() => updateQuantity(product.id, quantity - 1)}
                >
                  −
                </button>
                <span className="text-sm w-4 text-center">{quantity}</span>
                <button
                  className="w-6 h-6 rounded-full border flex items-center justify-center text-sm font-bold text-gray-600"
                  onClick={() => updateQuantity(product.id, quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>
            <div className="flex flex-col items-end justify-between">
              <button onClick={() => removeItem(product.id)} className="text-gray-300 hover:text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
              <p className="text-sm font-bold">{formatSGD(product.sale_price * quantity)}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card className="p-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Subtotal</span>
          <span>{formatSGD(total)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Delivery</span>
          <span className="text-green-600 font-semibold">FREE</span>
        </div>
        <Separator />
        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span className="text-red-600 text-lg">{formatSGD(total)}</span>
        </div>
      </Card>

      {canCheckout ? (
        <Link
          href="/checkout"
          className={buttonVariants({ className: 'w-full bg-red-600 hover:bg-red-700 h-12 text-base font-bold flex items-center justify-center gap-2' })}
        >
          Proceed to Checkout <ChevronRight className="w-4 h-4" />
        </Link>
      ) : (
        <Button disabled className="w-full bg-red-600 h-12 text-base font-bold opacity-50">
          Select a dormitory to continue
        </Button>
      )}
    </div>
  )
}
