'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Phone, User, CheckCircle2, MapPin, Copy, Check } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useCartStore } from '@/lib/store/cart'
import { formatSGD } from '@/lib/utils/order'
import { toast } from 'sonner'

const PAYNOW_DISPLAY = '+65 8363 8499'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, dormitoryId, totalAmount, clearCart } = useCartStore()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [paymentStep, setPaymentStep] = useState<'form' | 'paynow' | 'confirmed'>('form')
  const [orderId, setOrderId] = useState<string | null>(null)
  const [paymentRef, setPaymentRef] = useState<string>('')
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  const total = totalAmount()

  useEffect(() => {
    if (items.length === 0 && paymentStep === 'form') {
      router.push('/cart')
    }
  }, [items.length, paymentStep, router])

  async function handleSubmitOrder() {
    if (!name.trim()) { toast.error('Please enter your name'); return }
    if (!phone.trim()) { toast.error('Please enter your phone number'); return }
    if (!/^\d{6}$/.test(postalCode.trim())) { toast.error('Please enter a valid 6-digit postal code'); return }
    if (!dormitoryId) { toast.error('No dormitory selected — go back to cart'); return }
    if (items.length === 0) { router.push('/'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          postalCode: postalCode.trim(),
          dormitoryId,
          items: items.map((i) => ({
            productId: i.product.id,
            quantity: i.quantity,
            unitPrice: i.product.sale_price,
          })),
          totalAmount: total,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create order')

      setOrderId(data.orderId)
      setPaymentRef(data.paymentRef)
      setQrDataUrl(data.qrDataUrl)
      setPaymentStep('paynow')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function handleCopyRef() {
    navigator.clipboard.writeText(paymentRef)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handlePaymentDone() {
    setPaymentStep('confirmed')
    clearCart()
  }

  if (paymentStep === 'confirmed') {
    return (
      <div className="text-center py-16 space-y-4">
        <CheckCircle2 className="w-16 h-16 mx-auto text-green-500" />
        <h1 className="text-xl font-bold">Order Submitted!</h1>
        <p className="text-gray-500 text-sm px-4">
          Order <span className="font-mono font-bold">#{orderId?.slice(0, 8).toUpperCase()}</span> received.
          We&apos;ll confirm once payment is verified and deliver to your dormitory on the scheduled day.
        </p>
        <Link
          href="/"
          className={buttonVariants({ className: 'bg-red-600 hover:bg-red-700 w-full flex items-center justify-center' })}
        >
          Back to shopping
        </Link>
        <Link
          href="/account/orders"
          className={buttonVariants({ variant: 'outline', className: 'w-full flex items-center justify-center' })}
        >
          View my orders
        </Link>
      </div>
    )
  }

  if (paymentStep === 'paynow') {
    return (
      <div className="space-y-4">
        <h1 className="text-lg font-bold">Pay via PayNow</h1>

        {/* QR Code */}
        <Card className="p-5 space-y-4 text-center">
          <p className="text-sm text-gray-600 font-medium">
            Scan with your banking app (DBS, OCBC, UOB, GrabPay, PayLah!, etc.)
          </p>

          <div className="flex justify-center">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="PayNow QR Code" className="w-56 h-56 rounded-lg" />
            ) : (
              <div className="w-56 h-56 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                Loading QR...
              </div>
            )}
          </div>

          {/* Amount */}
          <div className="bg-red-50 rounded-xl p-3 space-y-1">
            <p className="text-xs text-gray-500">Amount</p>
            <p className="text-3xl font-bold text-red-600">{formatSGD(total)}</p>
            <p className="text-xs text-gray-400">PayNow to {PAYNOW_DISPLAY}</p>
          </div>

          {/* Payment reference */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 space-y-1">
            <p className="text-xs font-semibold text-yellow-800">Payment Reference / Remarks</p>
            <div className="flex items-center justify-center gap-2">
              <p className="font-mono font-bold text-lg tracking-wider text-yellow-900">{paymentRef}</p>
              <button
                onClick={handleCopyRef}
                className="text-yellow-600 hover:text-yellow-800 transition-colors"
                title="Copy reference"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-yellow-700">
              ⚠️ Enter this exactly in the &quot;Remarks&quot; field when paying
            </p>
          </div>
        </Card>

        {/* Manual steps */}
        <Card className="p-4 space-y-2">
          <p className="text-sm font-semibold">How to pay:</p>
          <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
            <li>Open your banking app</li>
            <li>Scan the QR code above, OR transfer to <strong>{PAYNOW_DISPLAY}</strong></li>
            <li>Enter amount: <strong>{formatSGD(total)}</strong></li>
            <li>In the <strong>Remarks</strong> field, enter: <strong className="font-mono">{paymentRef}</strong></li>
            <li>Complete the transfer</li>
          </ol>
        </Card>

        <Button
          onClick={handlePaymentDone}
          className="w-full bg-green-600 hover:bg-green-700 h-12 text-base font-bold"
        >
          I&apos;ve completed payment ✓
        </Button>

        <p className="text-xs text-center text-gray-400">
          Questions? WhatsApp us at {PAYNOW_DISPLAY}
        </p>
      </div>
    )
  }

  // Form step
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/cart" className="text-gray-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-bold">Checkout</h1>
      </div>

      {/* Order summary */}
      <Card className="p-4 space-y-2">
        <p className="text-sm font-semibold text-gray-700">Order Summary</p>
        {items.map(({ product, quantity }) => (
          <div key={product.id} className="flex justify-between text-sm">
            <span className="text-gray-600 line-clamp-1 flex-1 mr-2">
              {product.name} × {quantity}
            </span>
            <span className="font-medium flex-shrink-0">{formatSGD(product.sale_price * quantity)}</span>
          </div>
        ))}
        <Separator />
        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span className="text-red-600">{formatSGD(total)}</span>
        </div>
        <p className="text-xs text-green-600 font-medium">Delivery: FREE to your dormitory</p>
      </Card>

      {/* Contact details */}
      <Card className="p-4 space-y-4">
        <p className="text-sm font-semibold text-gray-700">Your Details</p>

        <div className="space-y-1">
          <Label htmlFor="name" className="flex items-center gap-1.5 text-xs">
            <User className="w-3.5 h-3.5" /> Full Name
          </Label>
          <Input
            id="name"
            placeholder="e.g. Ravi Kumar"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <p className="text-xs text-gray-400">Your last name will be used as payment reference</p>
        </div>

        <div className="space-y-1">
          <Label htmlFor="postal" className="flex items-center gap-1.5 text-xs">
            <MapPin className="w-3.5 h-3.5" /> Postal Code
          </Label>
          <Input
            id="postal"
            placeholder="e.g. 238859"
            type="tel"
            inputMode="numeric"
            maxLength={6}
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ''))}
          />
          <p className="text-xs text-gray-400">Your Singapore postal code — used as payment reference</p>
        </div>

        <div className="space-y-1">
          <Label htmlFor="phone" className="flex items-center gap-1.5 text-xs">
            <Phone className="w-3.5 h-3.5" /> WhatsApp / Phone
          </Label>
          <Input
            id="phone"
            placeholder="+65 9123 4567"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <p className="text-xs text-gray-400">We&apos;ll send order updates here</p>
        </div>
      </Card>

      {/* Payment method */}
      <Card className="p-4 space-y-2">
        <p className="text-sm font-semibold text-gray-700">Payment</p>
        <div className="flex items-center gap-3 p-3 border-2 border-red-600 rounded-lg bg-red-50">
          <span className="text-2xl">📱</span>
          <div>
            <p className="text-sm font-semibold">PayNow</p>
            <p className="text-xs text-gray-500">Scan QR · No credit card needed</p>
          </div>
          <CheckCircle2 className="w-5 h-5 text-red-600 ml-auto" />
        </div>
        <p className="text-xs text-gray-400 text-center">
          DBS PayLah! · OCBC · UOB · GrabPay and all PayNow apps
        </p>
      </Card>

      <Button
        onClick={handleSubmitOrder}
        disabled={loading}
        className="w-full bg-red-600 hover:bg-red-700 h-12 text-base font-bold"
      >
        {loading ? 'Generating QR...' : `Get PayNow QR for ${formatSGD(total)}`}
      </Button>
    </div>
  )
}
