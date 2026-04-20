import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json()

    if (!phone || typeof phone !== 'string' || phone.trim().length < 6) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('phone', phone.trim())
      .single()

    if (!user) {
      return NextResponse.json({ orders: [] })
    }

    const { data: orders } = await supabase
      .from('orders')
      .select(`
        id, status, payment_status, total_amount, created_at,
        dormitory:dormitories(name),
        order_items(quantity, unit_price, product:products(name))
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    return NextResponse.json({ orders: orders ?? [] })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
