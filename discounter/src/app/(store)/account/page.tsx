import Link from 'next/link'
import { ShoppingBag, ChevronRight, Home } from 'lucide-react'
import { Card } from '@/components/ui/card'

export default function AccountPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold">Account</h1>

      <div className="space-y-2">
        <Link href="/account/orders">
          <Card className="p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors">
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">My Orders</p>
              <p className="text-xs text-gray-400">Track your deliveries</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </Card>
        </Link>

        <Link href="/">
          <Card className="p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors">
            <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
              <Home className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Browse Deals</p>
              <p className="text-xs text-gray-400">Up to 80% off today</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </Card>
        </Link>
      </div>

      <div className="mt-6 p-4 bg-red-50 rounded-xl text-center">
        <p className="text-sm font-semibold text-red-700">Need help?</p>
        <p className="text-xs text-red-500 mt-1">WhatsApp us: +65 9123 4567</p>
      </div>
    </div>
  )
}
