import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'
import { createAdminClient } from '@/lib/supabase/admin'
import { getWeekCutoffDate } from '@/lib/utils/order'
import { buildPayNowQRString, buildPaymentRef } from '@/lib/utils/paynow'

const PAYNOW_MOBILE = process.env.PAYNOW_MOBILE ?? '83638499'

// Simple in-memory rate limiter: max 5 orders per IP per 15 minutes
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
const RATE_LIMIT_MAX = 5

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return true
  }
  if (entry.count >= RATE_LIMIT_MAX) return false
  entry.count++
  return true
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many orders. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await req.json()
    const { name, phone, postalCode, dormitoryId, items, totalAmount } = body

    if (!name || !phone || !postalCode || !dormitoryId || !items?.length || !totalAmount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Input validation
    if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
      return NextResponse.json({ error: 'Name must be 2-100 characters' }, { status: 400 })
    }
    if (typeof phone !== 'string' || !/^\+?\d[\d\s]{6,15}$/.test(phone.replace(/\s/g, ''))) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
    }
    if (typeof postalCode !== 'string' || !/^\d{6}$/.test(postalCode.trim())) {
      return NextResponse.json({ error: 'Postal code must be exactly 6 digits' }, { status: 400 })
    }
    if (!Array.isArray(items) || items.length > 50) {
      return NextResponse.json({ error: 'Invalid items' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Verify products and stock
    const productIds = items.map((i: { productId: string }) => i.productId)
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('id, name, sale_price, stock_qty, is_active')
      .in('id', productIds)

    if (prodError || !products) {
      return NextResponse.json({ error: 'Failed to verify products' }, { status: 500 })
    }

    // Validate each item and compute server-side total
    let serverTotal = 0
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId)
      if (!product || !product.is_active) {
        return NextResponse.json({ error: 'Product not available' }, { status: 400 })
      }
      if (!Number.isInteger(item.quantity) || item.quantity <= 0 || item.quantity > 100) {
        return NextResponse.json({ error: `Invalid quantity for ${product.name}` }, { status: 400 })
      }
      if (product.stock_qty < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for ${product.name}` }, { status: 400 })
      }
      // Use server-side price, ignore client-sent unitPrice
      serverTotal += product.sale_price * item.quantity
    }

    // Round to 2dp and override client-sent totalAmount
    serverTotal = Math.round(serverTotal * 100) / 100
    const verifiedTotalAmount = serverTotal

    // Upsert user by phone
    let userId: string
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('phone', phone)
      .single()

    if (existingUser) {
      userId = existingUser.id
      await supabase.from('users').update({ full_name: name, dormitory_id: dormitoryId }).eq('id', userId)
    } else {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        phone: phone.startsWith('+') ? phone : `+65${phone.replace(/\s/g, '')}`,
        user_metadata: { full_name: name },
        phone_confirm: true,
      })
      if (authError || !authData.user) {
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
      }
      userId = authData.user.id
      await supabase.from('users').insert({
        id: userId,
        phone,
        full_name: name,
        dormitory_id: dormitoryId,
        role: 'customer',
      })
    }

    // Build payment reference: LASTNAME POSTALCODE
    const paymentRef = buildPaymentRef(name, postalCode)

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        dormitory_id: dormitoryId,
        total_amount: verifiedTotalAmount,
        postal_code: postalCode,
        payment_ref: paymentRef,
        week_cutoff: getWeekCutoffDate(),
        status: 'pending_payment',
        payment_status: 'unpaid',
      })
      .select('id')
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    // Insert order items (use server-side prices, NOT client-sent unitPrice)
    await supabase.from('order_items').insert(
      items.map((i: { productId: string; quantity: number; unitPrice: number }) => {
        const product = products.find((p) => p.id === i.productId)!
        return {
          order_id: order.id,
          product_id: i.productId,
          quantity: i.quantity,
          unit_price: product.sale_price,
        }
      })
    )

    // Decrement stock atomically
    for (const item of items) {
      const { error: stockError } = await supabase.rpc('decrement_stock', {
        product_id: item.productId,
        qty: item.quantity,
      })
      if (stockError) {
        // Stock was depleted between validation and decrement — cancel the order
        await supabase.from('orders').update({ status: 'cancelled' }).eq('id', order.id)
        return NextResponse.json(
          { error: `Insufficient stock. Please refresh and try again.` },
          { status: 409 }
        )
      }
    }

    // Generate PayNow QR code
    const qrString = buildPayNowQRString({
      mobile: PAYNOW_MOBILE,
      amount: verifiedTotalAmount,
      reference: paymentRef,
      merchantName: 'Discounter SG',
    })

    const qrDataUrl = await QRCode.toDataURL(qrString, {
      errorCorrectionLevel: 'M',
      width: 300,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    })

    return NextResponse.json({
      orderId: order.id,
      paymentRef,
      qrDataUrl,
      // Do not expose raw qrString — it contains the PayNow mobile number
    })
  } catch (err: unknown) {
    console.error('Order creation error:', err)
    // Do not expose internal error details to the client
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
