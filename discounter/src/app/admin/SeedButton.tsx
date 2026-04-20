'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function SeedButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSeed() {
    if (!confirm('Load the 30 starter SKUs into the products catalogue?')) return
    setLoading(true)
    try {
      const res = await fetch('/api/admin/seed-products', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(`${data.seeded} products loaded!`)
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Seed failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleSeed}
      disabled={loading}
      variant="outline"
      className="border-dashed border-orange-400 text-orange-600 hover:bg-orange-50"
    >
      {loading ? 'Loading...' : '🌱 Load 30 Starter SKUs'}
    </Button>
  )
}
