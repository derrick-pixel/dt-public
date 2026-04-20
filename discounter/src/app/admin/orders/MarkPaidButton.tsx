'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export default function MarkPaidButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleMarkPaid() {
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: 'paid', status: 'paid' })
        .eq('id', orderId)

      if (error) throw error
      toast.success('Order marked as paid')
      router.refresh()
    } catch {
      toast.error('Failed to update order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      size="sm"
      onClick={handleMarkPaid}
      disabled={loading}
      className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 h-auto whitespace-nowrap"
    >
      {loading ? '...' : 'Mark Paid'}
    </Button>
  )
}
