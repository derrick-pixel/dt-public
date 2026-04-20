'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { calcDiscountPct } from '@/lib/utils/order'
import { toast } from 'sonner'
import { Category } from '@/lib/types'

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'beverages', label: 'Beverages' },
  { value: 'snacks', label: 'Snacks' },
  { value: 'instant_noodles', label: 'Instant Noodles' },
  { value: 'canned_goods', label: 'Canned Goods' },
  { value: 'rice_grains', label: 'Rice & Grains' },
  { value: 'cooking_essentials', label: 'Cooking Essentials' },
  { value: 'personal_care', label: 'Personal Care' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'other', label: 'Other' },
]

export default function NewProductPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '' as Category,
    original_price: '',
    sale_price: '',
    expiry_date: '',
    stock_qty: '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const discountPct = form.original_price && form.sale_price
    ? calcDiscountPct(Number(form.original_price), Number(form.sale_price))
    : 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.category || !form.original_price || !form.sale_price || !form.expiry_date || !form.stock_qty) {
      toast.error('Please fill in all required fields')
      return
    }
    if (discountPct < 10) {
      toast.error('Sale price must be at least 10% off original price')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      let image_url: string | null = null

      if (imageFile) {
        const ext = imageFile.name.split('.').pop()
        const path = `products/${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(path, imageFile, { contentType: imageFile.type })

        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path)
          image_url = urlData.publicUrl
        }
      }

      const { error } = await supabase.from('products').insert({
        name: form.name,
        description: form.description || null,
        category: form.category,
        original_price: Number(form.original_price),
        sale_price: Number(form.sale_price),
        discount_pct: discountPct,
        expiry_date: form.expiry_date,
        stock_qty: Number(form.stock_qty),
        image_url,
        is_active: true,
      })

      if (error) throw error
      toast.success('Product added!')
      router.push('/admin/products')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to add product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/admin/products" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold">Add Product</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="p-5 space-y-4">
          <div className="space-y-1">
            <Label>Product Name *</Label>
            <Input placeholder="e.g. Milo 3-in-1 (Box of 20)" value={form.name} onChange={(e) => set('name', e.target.value)} />
          </div>

          <div className="space-y-1">
            <Label>Description</Label>
            <Input placeholder="Optional short description" value={form.description} onChange={(e) => set('description', e.target.value)} />
          </div>

          <div className="space-y-1">
            <Label>Category *</Label>
            <Select value={form.category} onValueChange={(v) => v && set('category', v)}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Original Price (S$) *</Label>
              <Input type="number" step="0.01" min="0" placeholder="12.90" value={form.original_price} onChange={(e) => set('original_price', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Sale Price (S$) *</Label>
              <Input type="number" step="0.01" min="0" placeholder="4.90" value={form.sale_price} onChange={(e) => set('sale_price', e.target.value)} />
            </div>
          </div>

          {discountPct > 0 && (
            <p className="text-sm font-semibold text-red-600">Discount: {discountPct}% off</p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Expiry Date *</Label>
              <Input type="date" value={form.expiry_date} onChange={(e) => set('expiry_date', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Stock Quantity *</Label>
              <Input type="number" min="0" placeholder="100" value={form.stock_qty} onChange={(e) => set('stock_qty', e.target.value)} />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Product Image</Label>
            <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700">
            {loading ? 'Saving...' : 'Add Product'}
          </Button>
        </Card>
      </form>
    </div>
  )
}
