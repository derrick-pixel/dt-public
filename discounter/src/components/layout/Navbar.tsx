'use client'

import Link from 'next/link'
import { ShoppingCart, User, Tag } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'

export default function Navbar() {
  const totalItems = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0))

  return (
    <header className="sticky top-0 z-50 bg-red-600 text-white shadow-md">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1.5 font-bold text-lg tracking-tight">
          <Tag className="w-5 h-5" />
          Discounter SG
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/account" className="p-1">
            <User className="w-5 h-5" />
          </Link>
          <Link href="/cart" className="relative p-1">
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-yellow-400 text-red-700 text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
