# C2 Dormitory Worker Storefront — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the discounter Next.js app as the dormitory-worker storefront on the event-based merged Supabase backend — 5-language UI, dormitory/gathering-spot delivery, phone-OTP checkout with a 180-day session, PayNow-upfront payment.

**Architecture:** Evolve the existing discounter app in place (Approach A). The catalogue is fetched server-side via the service-role client, scoped to the `dormitory-workers` event. A lightweight client-side i18n layer (JSON catalogues + React context) drives 5 languages. Checkout is a linear client wizard; orders are created through a route handler that requires a phone-authenticated session. Admin is removed (flashcart owns it).

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind v4, `@supabase/ssr`, zustand, `qrcode`, vitest. Backend: Supabase project `mvbxnvrkxgfeylrwsuom`.

**Spec:** `docs/superpowers/specs/2026-05-16-spec-c2-dormitory-storefront-design.md`

---

## Conventions for the implementer

- Branch: do all work on a feature branch `c2-dormitory-storefront`, not `main`.
- The repo has no React-component test infra (only pure-function vitest tests). Keep that: unit-test pure logic; verify UI with `npm run build` + `npm run lint` + manual browser checks.
- Run `npm run test`, `npm run lint`, `npm run build` before each commit where code changed.
- Existing UI components are the styling reference. Match their Tailwind patterns. The new brand palette is Elitez navy `#003a70` (primary) + orange `#F26522` (accent only) — replace the old red (`red-600`) theme as you touch each file.
- The Supabase service-role key must be in `.env.local` as `SUPABASE_SERVICE_ROLE_KEY` and in the Vercel `discounter-elitez` project. `NEXT_PUBLIC_PAYNOW_MOBILE` must be added too (Task 11).

---

## File Structure

**Create:**
- `src/lib/event.ts` — event slug constant + server-side event/products fetch
- `src/lib/utils/phone.ts` — Singapore mobile-number normalisation
- `src/lib/utils/delivery.ts` — delivery-day resolution
- `src/lib/utils/reference.ts` — PayNow payment-reference generator
- `src/lib/i18n/translate.ts` — pure translation lookup + catalogue registry
- `src/lib/i18n/LanguageProvider.tsx` — React context provider
- `src/lib/i18n/useTranslation.ts` — hook
- `src/messages/{en,hi,id,my,ta}.json` — UI string catalogues
- `src/components/layout/LanguageBar.tsx` — 5-language switcher
- `src/components/layout/Footer.tsx` — Elitez-attributed footer
- `src/components/store/StoreClient.tsx` — client catalogue (search/filter)
- `src/components/checkout/CheckoutWizard.tsx` — the checkout wizard
- `src/lib/utils/phone.test.ts`, `delivery.test.ts`, `reference.test.ts`, `src/lib/i18n/translate.test.ts`

**Modify:**
- `src/lib/types.ts` — `event_id` on Product, `GatheringSpot`, `Order` shape, `DeliveryMode`
- `src/lib/store/cart.ts` — drop dormitory state
- `src/app/(store)/page.tsx` — server component
- `src/app/(store)/layout.tsx` — `LanguageProvider`, `Footer`, branding
- `src/app/layout.tsx` — metadata, theme colour
- `src/app/(store)/cart/page.tsx` — review only, i18n
- `src/app/(store)/checkout/page.tsx` — renders `CheckoutWizard`
- `src/app/(store)/account/page.tsx` + `account/orders/page.tsx` — session-aware
- `src/app/(store)/out-of-stock/page.tsx` — `event_id` query
- `src/app/api/orders/create/route.ts` — event-based, session-authed
- `src/app/api/orders/lookup/route.ts` — session-based
- `src/components/products/ProductCard.tsx`, `CategoryFilter.tsx` — i18n
- `src/components/layout/Navbar.tsx`, `CutoffBanner.tsx` — i18n, branding

**Delete:**
- `src/app/admin/**`, `src/app/api/admin/**`
- `src/lib/tenant.ts`

---

## Task 1: Types, event config, remove tenant

**Files:**
- Modify: `src/lib/types.ts`
- Create: `src/lib/event.ts`
- Delete: `src/lib/tenant.ts`

- [ ] **Step 1: Update `src/lib/types.ts`**

Add `event_id` to `Product`, add `GatheringSpot` and `DeliveryMode`, update `Order`. Replace the `Dormitory`, `User`, `Order` interfaces and add the new ones:

```typescript
export interface Product {
  id: string
  name: string
  description: string | null
  image_url: string | null
  category: Category
  event_id: string
  original_price: number
  sale_price: number
  discount_pct: number
  expiry_date: string
  stock_qty: number
  is_active: boolean
  created_at: string
}

export interface Dormitory {
  id: string
  name: string
  address: string
  delivery_day: string // e.g. "Saturday"
  is_active: boolean
}

export interface GatheringSpot {
  id: string
  name: string
  area: string
  description: string | null
  is_active: boolean
  sort_order: number
}

export type DeliveryMode = 'dormitory' | 'gathering_spot'

export interface User {
  id: string
  phone: string
  full_name: string | null
  dormitory_id: string | null
  default_gathering_spot_id: string | null
  role: 'customer' | 'admin'
  created_at: string
}

export interface Order {
  id: string
  user_id: string
  event_id: string
  dormitory_id: string | null
  gathering_spot_id: string | null
  status: string
  total_amount: number
  payment_status: string
  payment_ref: string | null
  delivery_day: string | null
  fulfillment_status: 'pending' | 'picked' | 'packed' | 'out_for_delivery' | 'delivered' | 'cancelled'
  notes: string | null
  created_at: string
  dormitory?: Dormitory
  gathering_spot?: GatheringSpot
  order_items?: OrderItem[]
}
```

Keep `Category`, `OrderItem`, `CartItem` as they are.

- [ ] **Step 2: Create `src/lib/event.ts`**

```typescript
import { createAdminClient } from '@/lib/supabase/admin'
import { Product } from '@/lib/types'

/** The single event this storefront serves. */
export const EVENT_SLUG = 'dormitory-workers'

export interface EventBranding {
  id: string
  slug: string
  name: string
  badge_text: string | null
  tagline_text: string | null
  subtitle_text: string | null
}

/**
 * Server-only. Fetches the dormitory-workers event and its active products
 * via the service-role client, bypassing RLS (the event may be is_active=false
 * pre-launch). Never import this into a client component.
 */
export async function getEventWithProducts(): Promise<{
  event: EventBranding
  products: Product[]
}> {
  const supabase = createAdminClient()

  const { data: event, error: eventErr } = await supabase
    .from('events')
    .select('id, slug, name, badge_text, tagline_text, subtitle_text')
    .eq('slug', EVENT_SLUG)
    .single()
  if (eventErr || !event) {
    throw new Error(`C2: event "${EVENT_SLUG}" not found on the backend`)
  }

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('event_id', event.id)
    .eq('is_active', true)
    .order('discount_pct', { ascending: false })

  return { event, products: products ?? [] }
}
```

- [ ] **Step 3: Delete `src/lib/tenant.ts`**

```bash
git rm src/lib/tenant.ts
```

Leaves dangling imports in several files — those files are all rewritten in later tasks. Do not fix imports here.

- [ ] **Step 4: Commit**

```bash
git add src/lib/types.ts src/lib/event.ts
git commit -m "feat(c2): event-based types + event config, drop tenant"
```

---

## Task 2: Singapore phone normalisation (TDD)

**Files:**
- Create: `src/lib/utils/phone.ts`, `src/lib/utils/phone.test.ts`

- [ ] **Step 1: Write the failing test — `src/lib/utils/phone.test.ts`**

```typescript
import { describe, it, expect } from 'vitest'
import { normalizeSgPhone } from './phone'

describe('normalizeSgPhone', () => {
  it('normalises a plain 8-digit mobile', () => {
    expect(normalizeSgPhone('98479776')).toBe('+6598479776')
  })
  it('accepts spaces and a +65 prefix', () => {
    expect(normalizeSgPhone('+65 9847 9776')).toBe('+6598479776')
  })
  it('accepts a bare 65 country code', () => {
    expect(normalizeSgPhone('6598479776')).toBe('+6598479776')
  })
  it('accepts numbers starting with 8', () => {
    expect(normalizeSgPhone('83638499')).toBe('+6583638499')
  })
  it('rejects non-mobile prefixes', () => {
    expect(normalizeSgPhone('63638499')).toBeNull()
  })
  it('rejects wrong length', () => {
    expect(normalizeSgPhone('9847977')).toBeNull()
    expect(normalizeSgPhone('984797766')).toBeNull()
  })
  it('rejects empty or junk input', () => {
    expect(normalizeSgPhone('')).toBeNull()
    expect(normalizeSgPhone('abcd')).toBeNull()
  })
})
```

- [ ] **Step 2: Run the test, verify it fails**

Run: `npm run test -- phone`
Expected: FAIL — `normalizeSgPhone` is not defined.

- [ ] **Step 3: Implement `src/lib/utils/phone.ts`**

```typescript
/**
 * Normalise a Singapore mobile number to the E.164 form `+65XXXXXXXX`.
 * Returns null if the input is not a valid SG mobile (8 digits, starts 8 or 9).
 */
export function normalizeSgPhone(input: string): string | null {
  const digits = input.replace(/\D/g, '')
  const local =
    digits.length === 10 && digits.startsWith('65') ? digits.slice(2) : digits
  if (!/^[89]\d{7}$/.test(local)) return null
  return `+65${local}`
}
```

- [ ] **Step 4: Run the test, verify it passes**

Run: `npm run test -- phone`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/utils/phone.ts src/lib/utils/phone.test.ts
git commit -m "feat(c2): SG phone normalisation util"
```

---

## Task 3: Delivery-day resolution (TDD)

**Files:**
- Create: `src/lib/utils/delivery.ts`, `src/lib/utils/delivery.test.ts`

- [ ] **Step 1: Write the failing test — `src/lib/utils/delivery.test.ts`**

```typescript
import { describe, it, expect } from 'vitest'
import { resolveDeliveryDay, GATHERING_SPOT_DAY } from './delivery'

describe('resolveDeliveryDay', () => {
  it('returns the dormitory delivery_day in dormitory mode', () => {
    expect(resolveDeliveryDay('dormitory', { delivery_day: 'Saturday' })).toBe('Saturday')
  })
  it('returns Sunday in gathering-spot mode regardless of arg', () => {
    expect(resolveDeliveryDay('gathering_spot', null)).toBe('Sunday')
    expect(GATHERING_SPOT_DAY).toBe('Sunday')
  })
  it('throws if dormitory mode is given no dormitory', () => {
    expect(() => resolveDeliveryDay('dormitory', null)).toThrow()
  })
})
```

- [ ] **Step 2: Run the test, verify it fails**

Run: `npm run test -- delivery`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/lib/utils/delivery.ts`**

```typescript
import { DeliveryMode } from '@/lib/types'

/** Gathering-spot collection always happens on Sunday. */
export const GATHERING_SPOT_DAY = 'Sunday'

/**
 * The day an order will be delivered/collected.
 * Dormitory mode reads the chosen dormitory's `delivery_day`.
 * Gathering-spot mode is always Sunday.
 */
export function resolveDeliveryDay(
  mode: DeliveryMode,
  dormitory: { delivery_day: string } | null,
): string {
  if (mode === 'gathering_spot') return GATHERING_SPOT_DAY
  if (!dormitory) throw new Error('dormitory mode requires a dormitory')
  return dormitory.delivery_day
}
```

- [ ] **Step 4: Run the test, verify it passes**

Run: `npm run test -- delivery`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/utils/delivery.ts src/lib/utils/delivery.test.ts
git commit -m "feat(c2): delivery-day resolution util"
```

---

## Task 4: PayNow reference generator (TDD)

**Files:**
- Create: `src/lib/utils/reference.ts`, `src/lib/utils/reference.test.ts`

- [ ] **Step 1: Write the failing test — `src/lib/utils/reference.test.ts`**

```typescript
import { describe, it, expect } from 'vitest'
import { generatePaymentRef } from './reference'

describe('generatePaymentRef', () => {
  it('starts with the DW prefix', () => {
    expect(generatePaymentRef()).toMatch(/^DW/)
  })
  it('is 8 chars, uppercase alphanumeric, no ambiguous chars', () => {
    const ref = generatePaymentRef()
    expect(ref).toHaveLength(8)
    expect(ref).toMatch(/^DW[A-HJ-NP-Z2-9]{6}$/)
  })
  it('is reasonably unique across many calls', () => {
    const refs = new Set(Array.from({ length: 500 }, () => generatePaymentRef()))
    expect(refs.size).toBeGreaterThan(495)
  })
})
```

- [ ] **Step 2: Run the test, verify it fails**

Run: `npm run test -- reference`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/lib/utils/reference.ts`**

```typescript
// Crockford-ish alphabet — no 0/O/1/I to avoid worker mis-typing.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

/** A unique-enough PayNow payment reference, e.g. "DW7F3K9Q". */
export function generatePaymentRef(): string {
  let body = ''
  for (let i = 0; i < 6; i++) {
    body += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  }
  return `DW${body}`
}
```

- [ ] **Step 4: Run the test, verify it passes**

Run: `npm run test -- reference`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/utils/reference.ts src/lib/utils/reference.test.ts
git commit -m "feat(c2): PayNow payment-reference generator"
```

---

## Task 5: i18n core — English catalogue + translate() (TDD)

**Files:**
- Create: `src/messages/en.json`, `src/lib/i18n/translate.ts`, `src/lib/i18n/translate.test.ts`

- [ ] **Step 1: Create `src/messages/en.json`**

This is the source catalogue. Flat string keys. `{name}`-style placeholders are interpolated by `translate()`.

```json
{
  "_status": "source",
  "brand.product": "Dormitory Store",
  "nav.account": "Account",
  "nav.cart": "Cart",
  "common.back": "Back",
  "common.loading": "Loading…",
  "common.continue": "Continue",
  "common.total": "Total",
  "common.subtotal": "Subtotal",
  "common.free": "FREE",
  "common.delivery": "Delivery",
  "common.cancel": "Cancel",
  "footer.attribution": "Operated by Elitez Group of Companies",
  "home.search": "Search products…",
  "home.noResults": "No products found",
  "cutoff.label": "Order closes in",
  "cutoff.suffix": "— order now for this week's delivery",
  "cat.all": "All",
  "cat.pain_relief": "Pain Relief",
  "cat.cold_flu": "Cold & Flu",
  "cat.vitamins": "Vitamins",
  "cat.supplements": "Supplements",
  "cat.digestive": "Digestive",
  "cat.oral_care": "Oral Care",
  "cat.denture_care": "Denture Care",
  "cat.skincare": "Skincare",
  "product.addToCart": "Add to cart",
  "product.soldOut": "SOLD OUT",
  "product.maxStock": "Maximum stock reached",
  "product.added": "{name} added to cart",
  "cart.title": "Your Cart",
  "cart.empty": "Your cart is empty",
  "cart.browse": "Browse products",
  "cart.checkout": "Proceed to checkout",
  "checkout.title": "Checkout",
  "checkout.summary": "Order summary",
  "checkout.deliveryQuestion": "How would you like to receive your order?",
  "checkout.modeDormitory": "Deliver to my dormitory",
  "checkout.modeGathering": "Collect at a gathering point",
  "checkout.pickDormitory": "Select your dormitory",
  "checkout.pickGathering": "Select a gathering point",
  "checkout.deliveryDay": "Delivery day: {day}",
  "checkout.collectionDay": "Collection day: Sunday",
  "checkout.phoneTitle": "Verify your phone number",
  "checkout.phoneHelp": "We will send a one-time code by SMS.",
  "checkout.phonePlaceholder": "9XXX XXXX",
  "checkout.sendCode": "Send code",
  "checkout.otpTitle": "Enter the 6-digit code",
  "checkout.otpSentTo": "Sent to {phone}",
  "checkout.verify": "Verify",
  "checkout.resend": "Resend code",
  "checkout.resendIn": "Resend in {seconds}s",
  "checkout.payTitle": "Pay with PayNow",
  "checkout.payScan": "Scan with your banking app (DBS, OCBC, UOB, PayLah!)",
  "checkout.payAmount": "Amount",
  "checkout.payRef": "Payment reference",
  "checkout.payRefHelp": "Use this exact reference in your payment remarks.",
  "checkout.payConfirmLabel": "Re-enter the reference to confirm payment",
  "checkout.confirm": "I have paid — confirm order",
  "checkout.successTitle": "Order received",
  "checkout.successBody": "We will prepare your order for {day}.",
  "checkout.orderNumber": "Order number",
  "checkout.viewOrders": "View my orders",
  "checkout.keepShopping": "Keep shopping",
  "account.title": "Account",
  "account.signInPrompt": "Verify your phone number to view your orders.",
  "account.myOrders": "My Orders",
  "account.signedInAs": "Signed in as {phone}",
  "account.signOut": "Sign out",
  "orders.title": "My Orders",
  "orders.empty": "You have no orders yet",
  "orders.placedOn": "Placed {date}",
  "err.cartEmpty": "Your cart is empty",
  "err.pickDestination": "Please choose where to receive your order",
  "err.invalidPhone": "Enter a valid Singapore mobile number",
  "err.invalidOtp": "Incorrect or expired code. Please try again.",
  "err.refMismatch": "The reference does not match. Please check and re-enter.",
  "err.priceChanged": "Prices have changed. Please review your cart.",
  "err.generic": "Something went wrong. Please try again."
}
```

- [ ] **Step 2: Write the failing test — `src/lib/i18n/translate.test.ts`**

```typescript
import { describe, it, expect } from 'vitest'
import { translate } from './translate'

describe('translate', () => {
  it('returns the string for a known key in the locale', () => {
    expect(translate('en', 'cart.title')).toBe('Your Cart')
  })
  it('falls back to English for a missing locale key', () => {
    // 'en' always has the key; force a fallback by using a real key.
    expect(translate('ta', 'cart.title')).toBeTruthy()
  })
  it('returns the key itself when unknown everywhere', () => {
    expect(translate('en', 'nonexistent.key')).toBe('nonexistent.key')
  })
  it('interpolates {placeholder} params', () => {
    expect(translate('en', 'product.added', { name: 'Panadol' })).toBe(
      'Panadol added to cart',
    )
  })
  it('interpolates numeric params', () => {
    expect(translate('en', 'checkout.resendIn', { seconds: 42 })).toBe(
      'Resend in 42s',
    )
  })
})
```

- [ ] **Step 3: Run the test, verify it fails**

Run: `npm run test -- translate`
Expected: FAIL — module not found.

- [ ] **Step 4: Implement `src/lib/i18n/translate.ts`**

The other four catalogues are created in Task 6; import them now and the build will fail until then — that is fine, this task ends after the test passes (the test only needs `en`). To keep this task self-contained, create empty placeholder catalogues first:

```bash
for l in hi id my ta; do echo '{"_status":"machine-draft"}' > src/messages/$l.json; done
```

Then:

```typescript
import en from '@/messages/en.json'
import hi from '@/messages/hi.json'
import id from '@/messages/id.json'
import my from '@/messages/my.json'
import ta from '@/messages/ta.json'

export const LOCALES = ['en', 'hi', 'id', 'my', 'ta'] as const
export type Locale = (typeof LOCALES)[number]

export const LOCALE_LABELS: Record<Locale, string> = {
  en: '🇬🇧 EN',
  hi: '🇮🇳 हिन्दी',
  ta: '🇮🇳 தமிழ்',
  my: '🇲🇲 မြန်မာ',
  id: '🇮🇩 Bahasa',
}

const CATALOGUES: Record<Locale, Record<string, string>> = { en, hi, id, my, ta }

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value)
}

/** Look up a UI string, falling back to English, then to the key itself. */
export function translate(
  locale: Locale,
  key: string,
  params?: Record<string, string | number>,
): string {
  const raw = CATALOGUES[locale]?.[key] ?? CATALOGUES.en[key] ?? key
  if (!params) return raw
  return raw.replace(/\{(\w+)\}/g, (m, name) =>
    name in params ? String(params[name]) : m,
  )
}
```

- [ ] **Step 5: Run the test, verify it passes**

Run: `npm run test -- translate`
Expected: PASS (5 tests).

- [ ] **Step 6: Commit**

```bash
git add src/messages src/lib/i18n/translate.ts src/lib/i18n/translate.test.ts
git commit -m "feat(c2): i18n core — English catalogue + translate()"
```

---

## Task 6: Translation catalogues (hi, id, my, ta)

**Files:**
- Modify: `src/messages/hi.json`, `src/messages/id.json`, `src/messages/my.json`, `src/messages/ta.json`

- [ ] **Step 1: Translate each catalogue**

For each of `hi` (Hindi), `id` (Indonesian), `my` (Burmese), `ta` (Tamil): produce a JSON file with **exactly the same keys** as `src/messages/en.json`, with each value translated into that language. The implementer (an LLM) performs the translation directly.

Rules:
- Keep every key from `en.json`. Do not add or drop keys.
- Preserve `{placeholder}` tokens verbatim — do not translate or reorder the brace tokens' names.
- Keep emoji and brand names (`PayNow`, `DBS`, `OCBC`, `UOB`, `PayLah!`, `Elitez Group of Companies`) untranslated.
- Set `"_status": "machine-draft"` (these are first-pass translations pending human review).
- Translate naturally for a low-literacy migrant-worker audience: short, plain, concrete.

Example — `src/messages/id.json` (Indonesian), abbreviated; the implementer produces the **full** file with all keys:

```json
{
  "_status": "machine-draft",
  "brand.product": "Toko Asrama",
  "nav.account": "Akun",
  "nav.cart": "Keranjang",
  "common.back": "Kembali",
  "cart.title": "Keranjang Anda",
  "checkout.confirm": "Saya sudah bayar — konfirmasi pesanan",
  "checkout.successBody": "Kami akan menyiapkan pesanan Anda untuk hari {day}."
}
```

- [ ] **Step 2: Verify key parity**

Run this check — it must print nothing (all four catalogues have the exact `en` key set):

```bash
node -e "
const en=Object.keys(require('./src/messages/en.json')).sort();
for (const l of ['hi','id','my','ta']) {
  const k=Object.keys(require('./src/messages/'+l+'.json')).sort();
  const miss=en.filter(x=>!k.includes(x)), extra=k.filter(x=>!en.includes(x));
  if(miss.length||extra.length) console.log(l,'MISSING',miss,'EXTRA',extra);
}
"
```

Expected: no output.

- [ ] **Step 3: Run the full test suite**

Run: `npm run test`
Expected: all pass (the `translate` fallback tests now exercise real catalogues).

- [ ] **Step 4: Commit**

```bash
git add src/messages
git commit -m "feat(c2): Hindi/Indonesian/Burmese/Tamil catalogues (machine-draft)"
```

---

## Task 7: i18n provider + hook + language bar

**Files:**
- Create: `src/lib/i18n/LanguageProvider.tsx`, `src/lib/i18n/useTranslation.ts`, `src/components/layout/LanguageBar.tsx`

- [ ] **Step 1: Implement `src/lib/i18n/LanguageProvider.tsx`**

```tsx
'use client'

import { createContext, useCallback, useEffect, useState } from 'react'
import { Locale, isLocale, translate } from './translate'

const STORAGE_KEY = 'dormstore.lang'

interface LanguageContextValue {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

export const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && isLocale(saved)) setLocaleState(saved)
  }, [])

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    localStorage.setItem(STORAGE_KEY, l)
    document.cookie = `${STORAGE_KEY}=${l};path=/;max-age=31536000;samesite=lax`
    document.documentElement.lang = l
  }, [])

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) =>
      translate(locale, key, params),
    [locale],
  )

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  )
}
```

- [ ] **Step 2: Implement `src/lib/i18n/useTranslation.ts`**

```typescript
'use client'

import { useContext } from 'react'
import { LanguageContext } from './LanguageProvider'

export function useTranslation() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useTranslation must be used within LanguageProvider')
  return ctx
}
```

- [ ] **Step 3: Implement `src/components/layout/LanguageBar.tsx`**

```tsx
'use client'

import { LOCALES, LOCALE_LABELS } from '@/lib/i18n/translate'
import { useTranslation } from '@/lib/i18n/useTranslation'

export default function LanguageBar() {
  const { locale, setLocale } = useTranslation()
  return (
    <div className="flex justify-center gap-1 bg-[#003a70] px-2 py-1.5">
      {LOCALES.map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${
            locale === l
              ? 'bg-white text-[#003a70]'
              : 'text-white/80 hover:text-white'
          }`}
        >
          {LOCALE_LABELS[l]}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: compiles (these modules are not yet imported anywhere — that happens in Task 9).

- [ ] **Step 5: Commit**

```bash
git add src/lib/i18n/LanguageProvider.tsx src/lib/i18n/useTranslation.ts src/components/layout/LanguageBar.tsx
git commit -m "feat(c2): language provider, hook and language bar"
```

---

## Task 8: Cart store — drop dormitory state

**Files:**
- Modify: `src/lib/store/cart.ts`

Delivery selection moves to the checkout wizard (held in component state), so the cart store no longer carries `dormitoryId`.

- [ ] **Step 1: Rewrite `src/lib/store/cart.ts`**

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem, Product } from '@/lib/types'

interface CartStore {
  items: CartItem[]
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  totalItems: () => number
  totalAmount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        const items = get().items
        const existing = items.find((i) => i.product.id === product.id)
        if (existing) {
          set({
            items: items.map((i) =>
              i.product.id === product.id
                ? { ...i, quantity: Math.min(i.quantity + 1, product.stock_qty) }
                : i,
            ),
          })
        } else {
          set({ items: [...items, { product, quantity: 1 }] })
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.product.id !== productId) })
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        const item = get().items.find((i) => i.product.id === productId)
        if (!item) return
        const clampedQty = Math.min(quantity, item.product.stock_qty)
        set({
          items: get().items.map((i) =>
            i.product.id === productId ? { ...i, quantity: clampedQty } : i,
          ),
        })
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalAmount: () =>
        get().items.reduce((sum, i) => sum + i.product.sale_price * i.quantity, 0),
    }),
    { name: 'dormstore-cart' },
  ),
)
```

- [ ] **Step 2: Update the existing cart test**

Open `src/lib/store/cart.test.ts`. Remove any test referencing `dormitoryId` / `setDormitory`. Keep add/remove/update/total tests.

- [ ] **Step 3: Run the cart test**

Run: `npm run test -- cart`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/lib/store/cart.ts src/lib/store/cart.test.ts
git commit -m "feat(c2): cart store — drop dormitory state"
```

---

## Task 9: Server-side catalogue (home page)

**Files:**
- Modify: `src/app/(store)/page.tsx`
- Create: `src/components/store/StoreClient.tsx`

- [ ] **Step 1: Create `src/components/store/StoreClient.tsx`**

The client half — search + category filter. Receives products and the event hero copy as props.

```tsx
'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import ProductCard from '@/components/products/ProductCard'
import CategoryFilter from '@/components/products/CategoryFilter'
import { Product, Category } from '@/lib/types'
import { useTranslation } from '@/lib/i18n/useTranslation'

interface Props {
  products: Product[]
  hero: { badge: string | null; tagline: string | null; subtitle: string | null }
}

export default function StoreClient({ products, hero }: Props) {
  const { t } = useTranslation()
  const [category, setCategory] = useState<Category | 'all'>('all')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    let result = products
    if (category !== 'all') result = result.filter((p) => p.category === category)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((p) => p.name.toLowerCase().includes(q))
    }
    return result
  }, [products, category, search])

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-[#003a70] p-4 text-center text-white">
        {hero.badge && (
          <span className="inline-block rounded-full bg-[#F26522] px-2.5 py-0.5 text-xs font-bold">
            {hero.badge}
          </span>
        )}
        {hero.tagline && <p className="mt-1.5 text-xl font-bold">{hero.tagline}</p>}
        {hero.subtitle && (
          <p className="mt-0.5 text-sm text-white/85">{hero.subtitle}</p>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder={t('home.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-white pl-9"
        />
      </div>

      <CategoryFilter selected={category} onChange={setCategory} />

      {filtered.length === 0 ? (
        <div className="py-16 text-center text-gray-400">
          <p className="mb-2 text-4xl">😕</p>
          <p>{t('home.noResults')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Rewrite `src/app/(store)/page.tsx` as a server component**

```tsx
import StoreClient from '@/components/store/StoreClient'
import { getEventWithProducts } from '@/lib/event'

export const dynamic = 'force-dynamic'

export default async function StorePage() {
  const { event, products } = await getEventWithProducts()
  return (
    <StoreClient
      products={products}
      hero={{
        badge: event.badge_text,
        tagline: event.tagline_text,
        subtitle: event.subtitle_text,
      }}
    />
  )
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: compiles. `ProductCard` / `CategoryFilter` still reference old strings — they are updated in Task 14; that does not break the build.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(store\)/page.tsx src/components/store/StoreClient.tsx
git commit -m "feat(c2): server-side catalogue scoped to the dormitory event"
```

---

## Task 10: Store layout, navbar, footer, cutoff banner

**Files:**
- Modify: `src/app/(store)/layout.tsx`, `src/components/layout/Navbar.tsx`, `src/components/layout/CutoffBanner.tsx`
- Create: `src/components/layout/Footer.tsx`

- [ ] **Step 1: Rewrite `src/app/(store)/layout.tsx`**

```tsx
import { LanguageProvider } from '@/lib/i18n/LanguageProvider'
import LanguageBar from '@/components/layout/LanguageBar'
import Navbar from '@/components/layout/Navbar'
import CutoffBanner from '@/components/layout/CutoffBanner'
import Footer from '@/components/layout/Footer'

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <div className="flex min-h-screen flex-col">
        <LanguageBar />
        <Navbar />
        <CutoffBanner />
        <main className="mx-auto w-full max-w-lg flex-1 px-4 py-4">{children}</main>
        <Footer />
      </div>
    </LanguageProvider>
  )
}
```

- [ ] **Step 2: Rewrite `src/components/layout/Navbar.tsx`**

Navy brand bar, Elitez logo, i18n labels.

```tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, User } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import { useTranslation } from '@/lib/i18n/useTranslation'

export default function Navbar() {
  const { t } = useTranslation()
  const totalItems = useCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.quantity, 0),
  )

  return (
    <header className="sticky top-0 z-50 bg-[#003a70] text-white shadow-md">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
          <Image src="/elitez-logo.png" alt="Elitez" width={32} height={32} />
          <span className="text-base">{t('brand.product')}</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/account" aria-label={t('nav.account')} className="p-1">
            <User className="h-5 w-5" />
          </Link>
          <Link href="/cart" aria-label={t('nav.cart')} className="relative p-1">
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#F26522] text-xs font-bold text-white">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
```

Then copy the Elitez logo into `public/`:

```bash
cp ~/.claude/assets/elitez-logo.png public/elitez-logo.png
git add public/elitez-logo.png
```

- [ ] **Step 3: Rewrite `src/components/layout/CutoffBanner.tsx`**

Keep the countdown; translate the copy via `useTranslation`. Replace the yellow bar with an `#F26522`-tinted strip.

```tsx
'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { getWeeklyCutoff } from '@/lib/utils/order'
import { useTranslation } from '@/lib/i18n/useTranslation'

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export default function CutoffBanner() {
  const { t } = useTranslation()
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    function update() {
      const diff = getWeeklyCutoff().getTime() - Date.now()
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      })
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-[#F26522]/10 px-4 py-2 text-center text-[#003a70]">
      <div className="flex items-center justify-center gap-2 text-sm font-semibold">
        <Clock className="h-4 w-4 flex-shrink-0" />
        <span>{t('cutoff.label')}</span>
        <span className="font-mono">
          {timeLeft.days}d {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
        </span>
        <span className="hidden sm:inline">{t('cutoff.suffix')}</span>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create `src/components/layout/Footer.tsx`**

```tsx
'use client'

import Image from 'next/image'
import { useTranslation } from '@/lib/i18n/useTranslation'

export default function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="border-t py-5 text-center">
      <div className="flex items-center justify-center gap-1.5">
        <Image src="/elitez-logo.png" alt="Elitez" width={20} height={20} />
        <a
          href="https://elitez.com.sg"
          className="text-xs text-gray-500 hover:text-[#003a70]"
        >
          {t('footer.attribution')}
        </a>
      </div>
    </footer>
  )
}
```

- [ ] **Step 5: Verify build**

Run: `npm run build && npm run lint`
Expected: compiles, lints clean.

- [ ] **Step 6: Commit**

```bash
git add src/app/\(store\)/layout.tsx src/components/layout public/elitez-logo.png
git commit -m "feat(c2): store layout, navbar, footer, cutoff banner with i18n + Elitez brand"
```

---

## Task 11: Order create + lookup APIs

**Files:**
- Modify: `src/app/api/orders/create/route.ts`, `src/app/api/orders/lookup/route.ts`
- Modify: `.env.local`, `.env.local.example`

- [ ] **Step 1: Add the PayNow env var**

Append to `.env.local` and `.env.local.example`:

```
NEXT_PUBLIC_PAYNOW_MOBILE=83638499
```

(The merchant's PayNow receiving number. It is printed on every QR the worker scans, so `NEXT_PUBLIC_` exposure is intentional. Confirm the actual number with the user before launch; `83638499` is the legacy value.)

- [ ] **Step 2: Rewrite `src/app/api/orders/create/route.ts`**

The order is created after a phone-OTP session exists. The route reads the session user from the cookie-bound server client, then writes with the admin client.

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { EVENT_SLUG } from '@/lib/event'

interface IncomingItem {
  productId: string
  quantity: number
}
interface Body {
  requestId: string
  deliveryMode: 'dormitory' | 'gathering_spot'
  dormitoryId: string | null
  gatheringSpotId: string | null
  deliveryDay: string
  paymentRef: string
  total: number
  items: IncomingItem[]
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Body

  // --- shape validation ---
  if (
    !UUID_RE.test(body.requestId ?? '') ||
    (body.deliveryMode !== 'dormitory' && body.deliveryMode !== 'gathering_spot') ||
    !body.deliveryDay ||
    !body.paymentRef ||
    !Array.isArray(body.items) ||
    body.items.length === 0
  ) {
    return NextResponse.json({ error: 'Invalid order' }, { status: 400 })
  }
  const hasDorm = !!body.dormitoryId
  const hasSpot = !!body.gatheringSpotId
  if (hasDorm === hasSpot) {
    // exactly one destination required
    return NextResponse.json({ error: 'Invalid destination' }, { status: 400 })
  }
  if (body.deliveryMode === 'dormitory' ? !hasDorm : !hasSpot) {
    return NextResponse.json({ error: 'Destination does not match mode' }, { status: 400 })
  }

  // --- require a phone-authenticated session ---
  const ssr = await createClient()
  const {
    data: { user: authUser },
  } = await ssr.auth.getUser()
  if (!authUser) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // --- resolve the event ---
  const { data: event } = await supabase
    .from('events')
    .select('id')
    .eq('slug', EVENT_SLUG)
    .single()
  if (!event) {
    return NextResponse.json({ error: 'Event unavailable' }, { status: 500 })
  }

  // --- idempotency ---
  const { data: existing } = await supabase
    .from('orders')
    .select('id')
    .eq('client_request_id', body.requestId)
    .maybeSingle()
  if (existing) {
    return NextResponse.json({ orderId: existing.id, duplicate: true })
  }

  // --- verify products + recompute total server-side ---
  const productIds = body.items.map((i) => i.productId)
  const { data: products, error: prodErr } = await supabase
    .from('products')
    .select('id, name, sale_price, stock_qty, is_active, event_id')
    .eq('event_id', event.id)
    .in('id', productIds)
  if (prodErr) {
    return NextResponse.json({ error: prodErr.message }, { status: 500 })
  }
  if (!products || products.length !== new Set(productIds).size) {
    return NextResponse.json({ error: 'Unknown product in cart' }, { status: 400 })
  }

  const byId = new Map(products.map((p) => [p.id, p]))
  let serverTotal = 0
  let itemCount = 0
  const itemRows: { product_id: string; quantity: number; unit_price: number }[] = []
  for (const i of body.items) {
    const p = byId.get(i.productId)
    if (!p || !p.is_active) {
      return NextResponse.json({ error: 'Product no longer available' }, { status: 400 })
    }
    if (!Number.isInteger(i.quantity) || i.quantity < 1 || i.quantity > 99) {
      return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 })
    }
    if (p.stock_qty < i.quantity) {
      return NextResponse.json({ error: `Insufficient stock for ${p.name}` }, { status: 409 })
    }
    serverTotal += Number(p.sale_price) * i.quantity
    itemCount += i.quantity
    itemRows.push({ product_id: p.id, quantity: i.quantity, unit_price: Number(p.sale_price) })
  }
  serverTotal = Math.round(serverTotal * 100) / 100

  // reject stale client total (half-cent tolerance)
  if (Math.abs(serverTotal - Number(body.total)) > 0.005) {
    return NextResponse.json(
      { error: 'Prices have changed. Please refresh and try again.' },
      { status: 409 },
    )
  }

  // --- upsert the public.users profile keyed to the auth uid ---
  await supabase.from('users').upsert(
    {
      id: authUser.id,
      phone: authUser.phone ? `+${authUser.phone.replace(/^\+/, '')}` : '',
      dormitory_id: body.dormitoryId,
      default_gathering_spot_id: body.gatheringSpotId,
      role: 'customer',
    },
    { onConflict: 'id' },
  )

  // --- create the order ---
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert({
      event_id: event.id,
      user_id: authUser.id,
      dormitory_id: body.dormitoryId,
      gathering_spot_id: body.gatheringSpotId,
      delivery_day: body.deliveryDay,
      total_amount: serverTotal,
      item_count: itemCount,
      payment_ref: body.paymentRef,
      payment_status: 'unpaid',
      status: 'pending_payment',
      fulfillment_status: 'pending',
      client_request_id: body.requestId,
    })
    .select('id')
    .single()

  if (orderErr || !order) {
    if (orderErr?.code === '23505') {
      const { data: raced } = await supabase
        .from('orders')
        .select('id')
        .eq('client_request_id', body.requestId)
        .maybeSingle()
      if (raced) return NextResponse.json({ orderId: raced.id, duplicate: true })
    }
    return NextResponse.json({ error: orderErr?.message ?? 'Insert failed' }, { status: 500 })
  }

  // --- order items ---
  const { error: itemsErr } = await supabase
    .from('order_items')
    .insert(itemRows.map((r) => ({ ...r, order_id: order.id })))
  if (itemsErr) {
    return NextResponse.json({ error: itemsErr.message }, { status: 500 })
  }

  // --- decrement stock ---
  for (const item of body.items) {
    const { error: stockErr } = await supabase.rpc('decrement_stock', {
      product_id: item.productId,
      qty: item.quantity,
    })
    if (stockErr) {
      await supabase.from('orders').update({ status: 'cancelled' }).eq('id', order.id)
      return NextResponse.json(
        { error: 'Insufficient stock. Please refresh and try again.' },
        { status: 409 },
      )
    }
  }

  return NextResponse.json({ orderId: order.id })
}
```

- [ ] **Step 3: Rewrite `src/app/api/orders/lookup/route.ts`**

Lookup now uses the session user, not a posted phone number.

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const ssr = await createClient()
  const {
    data: { user },
  } = await ssr.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const { data: orders } = await supabase
    .from('orders')
    .select(
      `id, status, fulfillment_status, total_amount, delivery_day, created_at,
       dormitory:dormitories(name),
       gathering_spot:gathering_spots(name),
       order_items(quantity, unit_price, product:products(name))`,
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return NextResponse.json({ orders: orders ?? [] })
}
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: compiles. (`checkout/page.tsx` still references the old flow — rewritten in Task 12; it does not block the build.)

- [ ] **Step 5: Commit**

```bash
git add src/app/api/orders .env.local.example
git commit -m "feat(c2): event-based, session-authed order create + lookup APIs"
```

---

## Task 12: Checkout wizard

**Files:**
- Create: `src/components/checkout/CheckoutWizard.tsx`
- Modify: `src/app/(store)/checkout/page.tsx`

- [ ] **Step 1: Create `src/components/checkout/CheckoutWizard.tsx`**

A linear wizard. Steps: `review` → `destination` → `phone`/`otp` (skipped if a session already exists) → `pay` → `success`. QR is generated client-side with the `qrcode` package.

```tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import QRCode from 'qrcode'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useCartStore } from '@/lib/store/cart'
import { createClient } from '@/lib/supabase/client'
import { formatSGD } from '@/lib/utils/order'
import { normalizeSgPhone } from '@/lib/utils/phone'
import { resolveDeliveryDay } from '@/lib/utils/delivery'
import { generatePaymentRef } from '@/lib/utils/reference'
import { buildPayNowQRString } from '@/lib/utils/paynow'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { Dormitory, GatheringSpot, DeliveryMode } from '@/lib/types'
import { toast } from 'sonner'

type Step = 'review' | 'destination' | 'phone' | 'otp' | 'pay' | 'success'
const PAYNOW_MOBILE = process.env.NEXT_PUBLIC_PAYNOW_MOBILE ?? '83638499'

export default function CheckoutWizard() {
  const { t } = useTranslation()
  const supabase = useMemo(() => createClient(), [])
  const { items, totalAmount, clearCart } = useCartStore()

  const [step, setStep] = useState<Step>('review')
  const [mode, setMode] = useState<DeliveryMode>('dormitory')
  const [dormitories, setDormitories] = useState<Dormitory[]>([])
  const [spots, setSpots] = useState<GatheringSpot[]>([])
  const [destId, setDestId] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [resendIn, setResendIn] = useState(0)
  const [busy, setBusy] = useState(false)

  const [paymentRef] = useState(() => generatePaymentRef())
  const [refConfirm, setRefConfirm] = useState('')
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [requestId] = useState(() => crypto.randomUUID())

  const total = totalAmount()

  // load destinations
  useEffect(() => {
    supabase.from('dormitories').select('*').eq('is_active', true).order('name')
      .then(({ data }) => setDormitories(data ?? []))
    supabase.from('gathering_spots').select('*').eq('is_active', true).order('sort_order')
      .then(({ data }) => setSpots(data ?? []))
  }, [supabase])

  // resend cooldown ticker
  useEffect(() => {
    if (resendIn <= 0) return
    const id = setTimeout(() => setResendIn((s) => s - 1), 1000)
    return () => clearTimeout(id)
  }, [resendIn])

  const dormitory = dormitories.find((d) => d.id === destId) ?? null
  const deliveryDay =
    mode === 'gathering_spot'
      ? resolveDeliveryDay('gathering_spot', null)
      : dormitory
        ? resolveDeliveryDay('dormitory', dormitory)
        : ''

  // --- step transitions ---

  async function afterDestination() {
    if (!destId) {
      toast.error(t('err.pickDestination'))
      return
    }
    const { data } = await supabase.auth.getUser()
    if (data.user) {
      await preparePayment()
    } else {
      setStep('phone')
    }
  }

  async function sendOtp() {
    const e164 = normalizeSgPhone(phone)
    if (!e164) {
      toast.error(t('err.invalidPhone'))
      return
    }
    setBusy(true)
    const { error } = await supabase.auth.signInWithOtp({ phone: e164 })
    setBusy(false)
    if (error) {
      toast.error(t('err.generic'))
      return
    }
    setResendIn(60)
    setStep('otp')
  }

  async function verifyOtp() {
    const e164 = normalizeSgPhone(phone)!
    setBusy(true)
    const { error } = await supabase.auth.verifyOtp({
      phone: e164,
      token: otp.trim(),
      type: 'sms',
    })
    setBusy(false)
    if (error) {
      toast.error(t('err.invalidOtp'))
      return
    }
    await preparePayment()
  }

  async function preparePayment() {
    const qrString = buildPayNowQRString({
      mobile: PAYNOW_MOBILE,
      amount: total,
      reference: paymentRef,
      merchantName: 'Elitez Dormitory Store',
    })
    setQrUrl(await QRCode.toDataURL(qrString, { width: 300, margin: 2 }))
    setStep('pay')
  }

  async function confirmOrder() {
    if (refConfirm.trim().toUpperCase() !== paymentRef) {
      toast.error(t('err.refMismatch'))
      return
    }
    setBusy(true)
    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          deliveryMode: mode,
          dormitoryId: mode === 'dormitory' ? destId : null,
          gatheringSpotId: mode === 'gathering_spot' ? destId : null,
          deliveryDay,
          paymentRef,
          total,
          items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? t('err.generic'))
      setOrderId(data.orderId)
      clearCart()
      setStep('success')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('err.generic'))
    } finally {
      setBusy(false)
    }
  }

  // --- redirect out if the cart is empty before success ---
  if (items.length === 0 && step !== 'success') {
    return (
      <div className="space-y-4 py-16 text-center">
        <p className="text-gray-500">{t('err.cartEmpty')}</p>
        <Link href="/" className={buttonVariants({ className: 'bg-[#003a70]' })}>
          {t('cart.browse')}
        </Link>
      </div>
    )
  }

  // --- SUCCESS ---
  if (step === 'success') {
    return (
      <div className="space-y-4 py-12 text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-[#003a70]" />
        <h1 className="text-xl font-bold">{t('checkout.successTitle')}</h1>
        <p className="px-4 text-sm text-gray-500">
          {t('checkout.successBody', { day: deliveryDay })}
        </p>
        <p className="text-sm">
          {t('checkout.orderNumber')}:{' '}
          <span className="font-mono font-bold">
            #{orderId?.slice(0, 8).toUpperCase()}
          </span>
        </p>
        <Link href="/account/orders" className={buttonVariants({ className: 'w-full bg-[#003a70]' })}>
          {t('checkout.viewOrders')}
        </Link>
        <Link href="/" className={buttonVariants({ variant: 'outline', className: 'w-full' })}>
          {t('checkout.keepShopping')}
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/cart" aria-label={t('common.back')} className="text-gray-500">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-bold">{t('checkout.title')}</h1>
      </div>

      {/* STEP: review */}
      {step === 'review' && (
        <>
          <Card className="space-y-2 p-4">
            <p className="text-sm font-semibold text-gray-700">{t('checkout.summary')}</p>
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex justify-between text-sm">
                <span className="mr-2 line-clamp-1 flex-1 text-gray-600">
                  {product.name} × {quantity}
                </span>
                <span className="flex-shrink-0 font-medium">
                  {formatSGD(product.sale_price * quantity)}
                </span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between font-bold">
              <span>{t('common.total')}</span>
              <span className="text-[#003a70]">{formatSGD(total)}</span>
            </div>
          </Card>
          <Button onClick={() => setStep('destination')} className="h-12 w-full bg-[#003a70] text-base font-bold">
            {t('common.continue')}
          </Button>
        </>
      )}

      {/* STEP: destination */}
      {step === 'destination' && (
        <>
          <Card className="space-y-3 p-4">
            <p className="text-sm font-semibold">{t('checkout.deliveryQuestion')}</p>
            <div className="grid grid-cols-1 gap-2">
              {(['dormitory', 'gathering_spot'] as DeliveryMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setDestId('') }}
                  className={`rounded-lg border-2 p-3 text-left text-sm font-semibold ${
                    mode === m ? 'border-[#003a70] bg-[#003a70]/5' : 'border-gray-200'
                  }`}
                >
                  {m === 'dormitory' ? t('checkout.modeDormitory') : t('checkout.modeGathering')}
                </button>
              ))}
            </div>
            <Select value={destId} onValueChange={(v) => setDestId(v ?? '')}>
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={mode === 'dormitory' ? t('checkout.pickDormitory') : t('checkout.pickGathering')}
                />
              </SelectTrigger>
              <SelectContent>
                {(mode === 'dormitory' ? dormitories : spots).map((opt) => (
                  <SelectItem key={opt.id} value={opt.id}>
                    {opt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {destId && (
              <p className="text-xs text-gray-500">
                {mode === 'gathering_spot'
                  ? t('checkout.collectionDay')
                  : t('checkout.deliveryDay', { day: deliveryDay })}
              </p>
            )}
          </Card>
          <Button onClick={afterDestination} className="h-12 w-full bg-[#003a70] text-base font-bold">
            {t('common.continue')}
          </Button>
        </>
      )}

      {/* STEP: phone */}
      {step === 'phone' && (
        <>
          <Card className="space-y-3 p-4">
            <p className="text-sm font-semibold">{t('checkout.phoneTitle')}</p>
            <p className="text-xs text-gray-500">{t('checkout.phoneHelp')}</p>
            <Label htmlFor="phone" className="text-xs">+65</Label>
            <Input
              id="phone"
              type="tel"
              inputMode="numeric"
              placeholder={t('checkout.phonePlaceholder')}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </Card>
          <Button disabled={busy} onClick={sendOtp} className="h-12 w-full bg-[#003a70] text-base font-bold">
            {t('checkout.sendCode')}
          </Button>
        </>
      )}

      {/* STEP: otp */}
      {step === 'otp' && (
        <>
          <Card className="space-y-3 p-4">
            <p className="text-sm font-semibold">{t('checkout.otpTitle')}</p>
            <p className="text-xs text-gray-500">
              {t('checkout.otpSentTo', { phone: normalizeSgPhone(phone) ?? phone })}
            </p>
            <Input
              type="tel"
              inputMode="numeric"
              maxLength={6}
              placeholder="••••••"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            />
            <button
              disabled={resendIn > 0 || busy}
              onClick={sendOtp}
              className="text-xs font-semibold text-[#003a70] disabled:text-gray-400"
            >
              {resendIn > 0 ? t('checkout.resendIn', { seconds: resendIn }) : t('checkout.resend')}
            </button>
          </Card>
          <Button
            disabled={busy || otp.length !== 6}
            onClick={verifyOtp}
            className="h-12 w-full bg-[#003a70] text-base font-bold"
          >
            {t('checkout.verify')}
          </Button>
        </>
      )}

      {/* STEP: pay */}
      {step === 'pay' && (
        <>
          <Card className="space-y-4 p-5 text-center">
            <p className="text-sm font-semibold">{t('checkout.payTitle')}</p>
            <p className="text-xs text-gray-500">{t('checkout.payScan')}</p>
            {qrUrl && <img src={qrUrl} alt="PayNow QR" className="mx-auto h-56 w-56 rounded-lg" />}
            <div className="rounded-xl bg-[#003a70]/5 p-3">
              <p className="text-xs text-gray-500">{t('checkout.payAmount')}</p>
              <p className="text-3xl font-bold text-[#003a70]">{formatSGD(total)}</p>
            </div>
            <div className="rounded-xl border border-[#F26522]/40 bg-[#F26522]/10 p-3">
              <p className="text-xs font-semibold text-[#003a70]">{t('checkout.payRef')}</p>
              <p className="font-mono text-lg font-bold tracking-wider text-[#003a70]">{paymentRef}</p>
              <p className="mt-1 text-xs text-gray-600">{t('checkout.payRefHelp')}</p>
            </div>
          </Card>
          <Card className="space-y-2 p-4">
            <Label htmlFor="refc" className="text-xs">{t('checkout.payConfirmLabel')}</Label>
            <Input
              id="refc"
              value={refConfirm}
              onChange={(e) => setRefConfirm(e.target.value.toUpperCase())}
              placeholder={paymentRef}
            />
          </Card>
          <Button
            disabled={busy}
            onClick={confirmOrder}
            className="h-12 w-full bg-[#003a70] text-base font-bold"
          >
            {t('checkout.confirm')}
          </Button>
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Rewrite `src/app/(store)/checkout/page.tsx`**

```tsx
import CheckoutWizard from '@/components/checkout/CheckoutWizard'

export default function CheckoutPage() {
  return <CheckoutWizard />
}
```

- [ ] **Step 3: Verify build + lint**

Run: `npm run build && npm run lint`
Expected: compiles, lints clean.

- [ ] **Step 4: Commit**

```bash
git add src/components/checkout src/app/\(store\)/checkout/page.tsx
git commit -m "feat(c2): checkout wizard — delivery picker, phone OTP, PayNow"
```

---

## Task 13: Cart page — review only

**Files:**
- Modify: `src/app/(store)/cart/page.tsx`

The dormitory selector and weekly-cutoff notice move out (destination is now chosen in checkout). The cart becomes review + quantity edit + "proceed".

- [ ] **Step 1: Rewrite `src/app/(store)/cart/page.tsx`**

```tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Trash2, ShoppingBag, ChevronRight } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useCartStore } from '@/lib/store/cart'
import { formatSGD } from '@/lib/utils/order'
import { useTranslation } from '@/lib/i18n/useTranslation'

export default function CartPage() {
  const { t } = useTranslation()
  const { items, updateQuantity, removeItem, totalAmount } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="space-y-4 py-20 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-gray-200" />
        <p className="text-gray-500">{t('cart.empty')}</p>
        <Link href="/" className={buttonVariants({ className: 'bg-[#003a70]' })}>
          {t('cart.browse')}
        </Link>
      </div>
    )
  }

  const total = totalAmount()

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold">{t('cart.title')}</h1>

      <div className="space-y-3">
        {items.map(({ product, quantity }) => (
          <Card key={product.id} className="flex gap-3 p-3">
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
              {product.image_url ? (
                <Image src={product.image_url} alt={product.name} fill className="object-cover" sizes="64px" />
              ) : (
                <div className="flex h-full items-center justify-center text-2xl">🛒</div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-sm font-semibold">{product.name}</p>
              <p className="text-sm font-bold text-[#003a70]">{formatSGD(product.sale_price)}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <button
                  className="flex h-6 w-6 items-center justify-center rounded-full border text-sm font-bold text-gray-600"
                  onClick={() => updateQuantity(product.id, quantity - 1)}
                >−</button>
                <span className="w-4 text-center text-sm">{quantity}</span>
                <button
                  className="flex h-6 w-6 items-center justify-center rounded-full border text-sm font-bold text-gray-600"
                  onClick={() => updateQuantity(product.id, quantity + 1)}
                >+</button>
              </div>
            </div>
            <div className="flex flex-col items-end justify-between">
              <button onClick={() => removeItem(product.id)} className="text-gray-300 hover:text-[#F26522]">
                <Trash2 className="h-4 w-4" />
              </button>
              <p className="text-sm font-bold">{formatSGD(product.sale_price * quantity)}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="space-y-3 p-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">{t('common.subtotal')}</span>
          <span>{formatSGD(total)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">{t('common.delivery')}</span>
          <span className="font-semibold text-[#003a70]">{t('common.free')}</span>
        </div>
        <Separator />
        <div className="flex justify-between font-bold">
          <span>{t('common.total')}</span>
          <span className="text-lg text-[#003a70]">{formatSGD(total)}</span>
        </div>
      </Card>

      <Link
        href="/checkout"
        className={buttonVariants({
          className: 'flex h-12 w-full items-center justify-center gap-2 bg-[#003a70] text-base font-bold',
        })}
      >
        {t('cart.checkout')} <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: compiles.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(store\)/cart/page.tsx
git commit -m "feat(c2): cart page — review only, i18n, brand palette"
```

---

## Task 14: Account pages — session-aware

**Files:**
- Modify: `src/app/(store)/account/page.tsx`, `src/app/(store)/account/orders/page.tsx`

- [ ] **Step 1: Rewrite `src/app/(store)/account/page.tsx`**

```tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ShoppingBag, ChevronRight, Home } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/i18n/useTranslation'

export default function AccountPage() {
  const { t } = useTranslation()
  const supabase = useMemo(() => createClient(), [])
  const [phone, setPhone] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setPhone(data.user?.phone ? `+${data.user.phone}` : null)
      setLoaded(true)
    })
  }, [supabase])

  async function signOut() {
    await supabase.auth.signOut()
    setPhone(null)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold">{t('account.title')}</h1>

      {loaded && phone ? (
        <Card className="flex items-center justify-between p-4">
          <p className="text-sm text-gray-600">{t('account.signedInAs', { phone })}</p>
          <Button variant="outline" size="sm" onClick={signOut}>
            {t('account.signOut')}
          </Button>
        </Card>
      ) : loaded ? (
        <Card className="p-4">
          <p className="text-sm text-gray-600">{t('account.signInPrompt')}</p>
        </Card>
      ) : null}

      <div className="space-y-2">
        <Link href="/account/orders">
          <Card className="flex items-center gap-3 p-4 transition-colors hover:bg-gray-50">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#003a70]/10">
              <ShoppingBag className="h-5 w-5 text-[#003a70]" />
            </div>
            <p className="flex-1 text-sm font-semibold">{t('account.myOrders')}</p>
            <ChevronRight className="h-4 w-4 text-gray-300" />
          </Card>
        </Link>
        <Link href="/">
          <Card className="flex items-center gap-3 p-4 transition-colors hover:bg-gray-50">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F26522]/10">
              <Home className="h-5 w-5 text-[#F26522]" />
            </div>
            <p className="flex-1 text-sm font-semibold">{t('cart.browse')}</p>
            <ChevronRight className="h-4 w-4 text-gray-300" />
          </Card>
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Rewrite `src/app/(store)/account/orders/page.tsx`**

Orders now come from the session (`GET /api/orders/lookup`), no phone input.

```tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Package } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { formatSGD } from '@/lib/utils/order'
import { format } from 'date-fns'
import { useTranslation } from '@/lib/i18n/useTranslation'

interface OrderRow {
  id: string
  fulfillment_status: string
  total_amount: number
  delivery_day: string | null
  created_at: string
  dormitory: { name: string } | null
  gathering_spot: { name: string } | null
  order_items: { quantity: number; unit_price: number; product: { name: string } | null }[]
}

export default function MyOrdersPage() {
  const { t } = useTranslation()
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [state, setState] = useState<'loading' | 'unauth' | 'ready'>('loading')

  useEffect(() => {
    fetch('/api/orders/lookup')
      .then(async (res) => {
        if (res.status === 401) { setState('unauth'); return }
        const data = await res.json()
        setOrders(data.orders ?? [])
        setState('ready')
      })
      .catch(() => setState('ready'))
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/" aria-label={t('common.back')} className="text-gray-500">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-bold">{t('orders.title')}</h1>
      </div>

      {state === 'loading' && <p className="text-sm text-gray-400">{t('common.loading')}</p>}

      {state === 'unauth' && (
        <Card className="space-y-3 p-4 text-center">
          <p className="text-sm text-gray-600">{t('account.signInPrompt')}</p>
          <Link href="/cart" className={buttonVariants({ className: 'bg-[#003a70]' })}>
            {t('cart.checkout')}
          </Link>
        </Card>
      )}

      {state === 'ready' && orders.length === 0 && (
        <div className="py-8 text-center text-gray-400">
          <Package className="mx-auto mb-2 h-12 w-12 text-gray-200" />
          <p>{t('orders.empty')}</p>
        </div>
      )}

      {orders.map((order) => (
        <Card key={order.id} className="space-y-3 p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold">#{order.id.slice(0, 8).toUpperCase()}</p>
              <p className="text-xs text-gray-400">
                {t('orders.placedOn', {
                  date: format(new Date(order.created_at), 'd MMM yyyy'),
                })}
              </p>
            </div>
            <Badge className="bg-[#003a70]/10 text-[#003a70]">
              {order.fulfillment_status.replace(/_/g, ' ')}
            </Badge>
          </div>
          <div className="space-y-1">
            {order.order_items?.map((item, i) => (
              <div key={i} className="flex justify-between text-sm text-gray-600">
                <span className="line-clamp-1 flex-1">
                  {item.product?.name ?? '—'} × {item.quantity}
                </span>
                <span className="ml-2 flex-shrink-0">
                  {formatSGD(item.unit_price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between border-t pt-1">
            <p className="text-xs text-gray-400">
              📍 {order.dormitory?.name ?? order.gathering_spot?.name ?? '—'}
            </p>
            <p className="font-bold text-[#003a70]">{formatSGD(order.total_amount)}</p>
          </div>
        </Card>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: compiles.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(store\)/account
git commit -m "feat(c2): session-aware account + order history"
```

---

## Task 15: Product card, category filter, out-of-stock, root layout

**Files:**
- Modify: `src/components/products/ProductCard.tsx`, `src/components/products/CategoryFilter.tsx`, `src/app/(store)/out-of-stock/page.tsx`, `src/app/layout.tsx`

- [ ] **Step 1: Update `src/components/products/ProductCard.tsx`**

Apply i18n + brand palette. Change: import `useTranslation`; replace the toast strings — `toast.error('Max stock reached')` → `toast.error(t('product.maxStock'))`, `toast.success(\`${product.name} added to cart\`)` → `toast.success(t('product.added', { name: product.name }))`; replace the `Add to cart` button text with `{t('product.addToCart')}`; replace `SOLD OUT` with `{t('product.soldOut')}`; replace every `red-600`/`red-700`/`red-50` class with the navy equivalent (`bg-[#003a70]`, `hover:bg-[#003a70]/90`, `bg-[#003a70]/5`, `text-[#003a70]`). Add `const { t } = useTranslation()` at the top of the component.

- [ ] **Step 2: Update `src/components/products/CategoryFilter.tsx`**

Replace the hard-coded `label` strings with i18n keys. Change the `CATEGORIES` array to carry a `key` instead of `label`:

```tsx
'use client'

import { Category } from '@/lib/types'
import { useTranslation } from '@/lib/i18n/useTranslation'

const CATEGORIES: { value: Category | 'all'; key: string; emoji: string }[] = [
  { value: 'all', key: 'cat.all', emoji: '🛒' },
  { value: 'pain_relief', key: 'cat.pain_relief', emoji: '💊' },
  { value: 'cold_flu', key: 'cat.cold_flu', emoji: '🤧' },
  { value: 'vitamins', key: 'cat.vitamins', emoji: '🧬' },
  { value: 'supplements', key: 'cat.supplements', emoji: '🫀' },
  { value: 'digestive', key: 'cat.digestive', emoji: '🌿' },
  { value: 'oral_care', key: 'cat.oral_care', emoji: '🪥' },
  { value: 'denture_care', key: 'cat.denture_care', emoji: '🦷' },
  { value: 'skincare', key: 'cat.skincare', emoji: '🧴' },
]

interface Props {
  selected: Category | 'all'
  onChange: (cat: Category | 'all') => void
}

export default function CategoryFilter({ selected, onChange }: Props) {
  const { t } = useTranslation()
  return (
    <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onChange(cat.value)}
          className={`flex flex-shrink-0 flex-col items-center gap-0.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
            selected === cat.value
              ? 'border-[#003a70] bg-[#003a70] text-white'
              : 'border-gray-200 bg-white text-gray-600'
          }`}
        >
          <span className="text-base">{cat.emoji}</span>
          {t(cat.key)}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Update `src/app/(store)/out-of-stock/page.tsx`**

Replace the `tenant`-based query with an `event_id` query. Remove `import { TENANT } from '@/lib/tenant'`. Change the fetch to resolve the event first:

```tsx
const supabase = createClient()
const { data: event } = await supabase
  .from('events').select('id').eq('slug', 'dormitory-workers').single()
if (event) {
  supabase
    .from('products')
    .select('*')
    .eq('event_id', event.id)
    .eq('is_active', true)
    .eq('stock_qty', 0)
    .order('name')
    .then(({ data }) => { setProducts(data ?? []); setLoading(false) })
} else {
  setLoading(false)
}
```

Wrap that in the existing `useEffect`. (This page reads via the anon browser client; it works only when the event is active — acceptable, it is an unlinked internal page.)

- [ ] **Step 4: Update `src/app/layout.tsx`**

Replace the metadata block and theme colour:

```tsx
export const metadata: Metadata = {
  title: 'Elitez Dormitory Store',
  description: 'Weekly catalogue for dormitory workers — delivered to your dormitory or Sunday gathering point.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Dormitory Store' },
}

export const viewport: Viewport = {
  themeColor: '#003a70',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}
```

Keep the rest of the file.

- [ ] **Step 5: Verify build + lint + tests**

Run: `npm run test && npm run lint && npm run build`
Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/products src/app/\(store\)/out-of-stock/page.tsx src/app/layout.tsx
git commit -m "feat(c2): i18n + brand palette on product card, filter, OOS, metadata"
```

---

## Task 16: Remove admin, archive the static site

**Files:**
- Delete: `src/app/admin/**`, `src/app/api/admin/**`
- Move: `index.html`, `locations.html` → `archive/`

- [ ] **Step 1: Delete admin**

```bash
git rm -r src/app/admin src/app/api/admin
```

- [ ] **Step 2: Archive the static site**

```bash
mkdir -p archive
git mv index.html archive/index.html
git mv locations.html archive/locations.html
```

- [ ] **Step 3: Check for dangling references**

Run: `grep -rn "lib/tenant\|app/admin\|api/admin\|SeedButton" src` — expected: no output.

Run: `npm run build`
Expected: compiles with no missing-module errors.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore(c2): remove admin routes, archive the static GH Pages site"
```

---

## Task 17: Supabase session config + Vercel env

This task touches infrastructure, not the repo. It needs the Supabase Management API PAT (`~/.supabase-claude-pat`) and Vercel access.

- [ ] **Step 1: Set the 180-day inactivity timeout**

⚠️ The field's unit is **hours**. `4320` = 180 days. Do **not** pass a seconds value — that crash-loops GoTrue.

```bash
PAT=$(cat ~/.supabase-claude-pat | tr -d '[:space:]')
curl -s -X PATCH "https://api.supabase.com/v1/projects/mvbxnvrkxgfeylrwsuom/config/auth" \
  -H "Authorization: Bearer $PAT" -H "Content-Type: application/json" \
  -d '{"sessions_inactivity_timeout": 4320}'
```

- [ ] **Step 2: Restart the project**

A Management-API config PATCH does not reload GoTrue. Ask the user to restart the project from the Supabase dashboard (Settings → General → Restart project), then verify auth is healthy:

```bash
PAT=$(cat ~/.supabase-claude-pat | tr -d '[:space:]')
curl -s "https://api.supabase.com/v1/projects/mvbxnvrkxgfeylrwsuom/health?services=auth" \
  -H "Authorization: Bearer $PAT"
```

Expected: auth service `"healthy": true`.

- [ ] **Step 3: Confirm Vercel env vars**

The `discounter-elitez` Vercel project must have: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_PAYNOW_MOBILE`. Ask the user to verify/add any missing ones in the Vercel dashboard. The service-role key is required for the server-side catalogue fetch (Task 9).

- [ ] **Step 4: No commit** — infrastructure only.

---

## Task 18: Final verification

- [ ] **Step 1: Full local check**

Run: `npm run test && npm run lint && npm run build`
Expected: all green.

- [ ] **Step 2: Manual smoke test**

`npm run dev`, then in a browser:
1. Catalogue loads with the dormitory products and the event-driven hero copy.
2. Switch language to Tamil and to Burmese — all chrome translates; reload keeps the language.
3. Add items, open `/cart`, edit quantities, proceed to `/checkout`.
4. Checkout: review → choose "Deliver to my dormitory" → pick a dormitory → phone step appears (no session) → enter a real SG mobile → receive SMS OTP → verify → PayNow QR renders → re-enter the reference → confirm → success page.
5. Repeat checkout in the same browser — the phone/OTP steps are skipped (session persists).
6. `/account` shows the signed-in number; `/account/orders` lists the order.
7. Run the gathering-spot path: confirm the collection day shows "Sunday".

If the dormitory-workers event is `is_active = false`, the server-side catalogue still loads (admin client). The OOS page (Task 15) will be empty until the event is active — acceptable.

- [ ] **Step 3: Verify the order landed**

Confirm the new order appears in flashcart's `/admin/orders` and has `event_id`, exactly one of `dormitory_id`/`gathering_spot_id`, a `delivery_day`, `fulfillment_status='pending'`, and the phone `user_id`.

- [ ] **Step 4: Final commit + push**

```bash
git add -A
git commit -m "chore(c2): final verification" --allow-empty
git push -u origin c2-dormitory-storefront
```

Then use `superpowers:finishing-a-development-branch` to merge.

---

## Self-review notes (addressed)

- **Spec §6.1 server fetch** → Task 1 (`event.ts`) + Task 9.
- **Spec §8 i18n** → Tasks 5–7, 9–15.
- **Spec §9 checkout wizard** → Task 12 (all 7 steps; OTP skip via `afterDestination` session check).
- **Spec §10 order APIs** → Task 11.
- **Spec §11 persistent session** → Task 17 (`4320` hours, restart) + no `signOut` in the wizard.
- **Spec §12 branding** → Tasks 9, 10, 15 (navy/orange, Elitez logo, footer).
- **Spec §15 retirement** → Task 16. GitHub Pages disable is a dashboard action — flagged for the user.
- **Spec §10.1 `dormitory_id` xor `gathering_spot_id`** → Task 11 validates it; the optional DB check constraint (spec §5/§10) is **not** added here (out of C2's no-schema-change scope) — noted for C3.
- Type names are consistent: `DeliveryMode`, `GatheringSpot`, `EventBranding`, `Locale` used identically across tasks.
