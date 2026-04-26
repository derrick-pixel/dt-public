# FlashCart (by Elitez) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build FlashCart — a stripped-down Next.js clone of Discounter SG — as a standalone in-person PayNow transactional tool with 22 CENTRUM/CALTRATE SKUs, no delivery, no admin, no orders DB, and a screenshot-friendly receipt on the pay page.

**Architecture:** Standalone Next.js 16 app in a new repo (`/Users/derrickteo/codings/flashcart`), separate Vercel project, separate Supabase project (products table only, public-read). Catalogue + cart + PayNow QR + receipt, all client-side. Scaffold by copying Discounter files selectively.

**Tech Stack:** Next.js 16 + React 19 (App Router), TypeScript, Tailwind CSS 4, ShadCN/UI (Base UI primitives), Supabase JS SDK, Zustand (persisted cart), `qrcode` for QR, vitest for unit tests.

**Spec:** `docs/superpowers/specs/2026-04-21-flashcart-design.md`

**Source paths referenced throughout:**
- Discounter repo (source of copies): `/Users/derrickteo/codings/discounter`
- FlashCart repo (new, to be created): `/Users/derrickteo/codings/flashcart`
- Product xlsx: `/Users/derrickteo/codings/discounter/new project, Jack/Product for Elitez (for AMGEN w ELITEZ Excl. pricing) (1).xlsx`

---

## Phase 1 — Scaffold (local only)

### Task 1: Initialize repo skeleton

**Files:**
- Create: `/Users/derrickteo/codings/flashcart/` (directory)
- Create: `/Users/derrickteo/codings/flashcart/.gitignore`
- Create: `/Users/derrickteo/codings/flashcart/package.json`
- Create: `/Users/derrickteo/codings/flashcart/.env.local.example`

- [ ] **Step 1: Create directory and init git**

Run:
```bash
mkdir -p /Users/derrickteo/codings/flashcart
cd /Users/derrickteo/codings/flashcart
git init -b main
```

- [ ] **Step 2: Copy `.gitignore` from Discounter**

Run:
```bash
cp /Users/derrickteo/codings/discounter/.gitignore /Users/derrickteo/codings/flashcart/.gitignore
```

If Discounter doesn't have one (verify with `ls -a`), create this at `/Users/derrickteo/codings/flashcart/.gitignore`:

```
node_modules/
.next/
out/
.env
.env.local
.env*.local
*.tsbuildinfo
next-env.d.ts
.DS_Store
```

- [ ] **Step 3: Write `package.json`**

Create `/Users/derrickteo/codings/flashcart/package.json`:

```json
{
  "name": "flashcart",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@base-ui/react": "^1.3.0",
    "@supabase/ssr": "^0.10.0",
    "@supabase/supabase-js": "^2.101.1",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^1.7.0",
    "next": "16.2.2",
    "qrcode": "^1.5.4",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.5.0",
    "zustand": "^5.0.12"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/qrcode": "^1.5.6",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.2.2",
    "tailwindcss": "^4",
    "typescript": "^5",
    "vitest": "^4.1.3",
    "@vitejs/plugin-react": "^4",
    "jsdom": "^25"
  }
}
```

Dependencies removed vs Discounter: `canvas` (not needed — we generate QR in browser via `qrcode`), `date-fns` (unused for FlashCart), `next-themes` (single theme), `shadcn` (CLI, not needed at runtime), `tw-animate-css` (unused).

- [ ] **Step 4: Write `.env.local.example`**

Create `/Users/derrickteo/codings/flashcart/.env.local.example`:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxxxxxxx
```

- [ ] **Step 5: Install deps**

Run:
```bash
cd /Users/derrickteo/codings/flashcart && npm install
```

Expected: installs cleanly, no peer-dep errors. `node_modules/` populated, `package-lock.json` created.

- [ ] **Step 6: Commit**

```bash
cd /Users/derrickteo/codings/flashcart
git add .gitignore package.json package-lock.json .env.local.example
git commit -m "chore: initialize FlashCart Next.js repo"
```

---

### Task 2: Copy project configuration files

**Files:**
- Create: `/Users/derrickteo/codings/flashcart/next.config.ts`
- Create: `/Users/derrickteo/codings/flashcart/tsconfig.json`
- Create: `/Users/derrickteo/codings/flashcart/postcss.config.mjs`
- Create: `/Users/derrickteo/codings/flashcart/eslint.config.mjs`
- Create: `/Users/derrickteo/codings/flashcart/vitest.config.ts`
- Create: `/Users/derrickteo/codings/flashcart/next-env.d.ts`
- Create: `/Users/derrickteo/codings/flashcart/components.json`

- [ ] **Step 1: Copy configs from Discounter**

```bash
cd /Users/derrickteo/codings/flashcart
cp /Users/derrickteo/codings/discounter/next.config.ts .
cp /Users/derrickteo/codings/discounter/tsconfig.json .
cp /Users/derrickteo/codings/discounter/postcss.config.mjs .
cp /Users/derrickteo/codings/discounter/eslint.config.mjs .
cp /Users/derrickteo/codings/discounter/vitest.config.ts .
cp /Users/derrickteo/codings/discounter/next-env.d.ts .
cp /Users/derrickteo/codings/discounter/components.json .
```

- [ ] **Step 2: Verify TypeScript compiles**

Run:
```bash
cd /Users/derrickteo/codings/flashcart
npx tsc --noEmit
```

Expected: no errors (there's no source yet, so it's a noop).

- [ ] **Step 3: Commit**

```bash
git add next.config.ts tsconfig.json postcss.config.mjs eslint.config.mjs vitest.config.ts next-env.d.ts components.json
git commit -m "chore: add project configs (Next, TS, Tailwind, ESLint, vitest)"
```

---

### Task 3: Port ShadCN UI primitives and global CSS

We'll port only the primitives we use: `button`, `card`, `input`, `label`, `separator`, `skeleton`, `utils`.

**Files:**
- Create: `/Users/derrickteo/codings/flashcart/src/app/globals.css`
- Create: `/Users/derrickteo/codings/flashcart/src/lib/utils.ts`
- Create: `/Users/derrickteo/codings/flashcart/src/components/ui/button.tsx`
- Create: `/Users/derrickteo/codings/flashcart/src/components/ui/card.tsx`
- Create: `/Users/derrickteo/codings/flashcart/src/components/ui/input.tsx`
- Create: `/Users/derrickteo/codings/flashcart/src/components/ui/label.tsx`
- Create: `/Users/derrickteo/codings/flashcart/src/components/ui/separator.tsx`
- Create: `/Users/derrickteo/codings/flashcart/src/components/ui/skeleton.tsx`

- [ ] **Step 1: Create directory tree**

```bash
cd /Users/derrickteo/codings/flashcart
mkdir -p src/app src/components/ui src/components/products src/components/layout src/lib/store src/lib/supabase src/lib/utils supabase/migrations public/products
```

- [ ] **Step 2: Copy globals.css and utils.ts**

```bash
cp /Users/derrickteo/codings/discounter/src/app/globals.css src/app/globals.css
cp /Users/derrickteo/codings/discounter/src/lib/utils.ts src/lib/utils.ts
```

- [ ] **Step 3: Copy the 6 UI primitives**

```bash
cp /Users/derrickteo/codings/discounter/src/components/ui/button.tsx src/components/ui/button.tsx
cp /Users/derrickteo/codings/discounter/src/components/ui/card.tsx src/components/ui/card.tsx
cp /Users/derrickteo/codings/discounter/src/components/ui/input.tsx src/components/ui/input.tsx
cp /Users/derrickteo/codings/discounter/src/components/ui/label.tsx src/components/ui/label.tsx
cp /Users/derrickteo/codings/discounter/src/components/ui/separator.tsx src/components/ui/separator.tsx
cp /Users/derrickteo/codings/discounter/src/components/ui/skeleton.tsx src/components/ui/skeleton.tsx
```

- [ ] **Step 4: Commit**

```bash
git add src/
git commit -m "feat: port ShadCN UI primitives and globals.css"
```

---

### Task 4: Port formatSGD and PayNow QR builder

**Files:**
- Create: `/Users/derrickteo/codings/flashcart/src/lib/utils/format.ts`
- Create: `/Users/derrickteo/codings/flashcart/src/lib/utils/paynow.ts`
- Create: `/Users/derrickteo/codings/flashcart/src/lib/utils/paynow.test.ts`

- [ ] **Step 1: Create `format.ts`**

Create `/Users/derrickteo/codings/flashcart/src/lib/utils/format.ts`:

```ts
export function formatSGD(amount: number): string {
  return `S$${amount.toFixed(2)}`
}
```

- [ ] **Step 2: Copy `paynow.ts` and its tests from Discounter**

```bash
cd /Users/derrickteo/codings/flashcart
cp /Users/derrickteo/codings/discounter/src/lib/utils/paynow.ts src/lib/utils/paynow.ts
cp /Users/derrickteo/codings/discounter/src/lib/utils/paynow.test.ts src/lib/utils/paynow.test.ts
```

- [ ] **Step 3: Open `paynow.ts` and confirm PayNow number constant matches**

Read `src/lib/utils/paynow.ts`. The mobile / UEN constant should reference `+65 8363 8499` (same as Discounter). If Discounter's `paynow.ts` hard-codes `+6583638499`, `+6583638499`, or similar, no edit needed. If it pulls from an env var or a hard-coded different number, edit to use `+6583638499`.

- [ ] **Step 4: Run the ported PayNow tests**

Run:
```bash
cd /Users/derrickteo/codings/flashcart && npx vitest run src/lib/utils/paynow.test.ts
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/utils/format.ts src/lib/utils/paynow.ts src/lib/utils/paynow.test.ts
git commit -m "feat: port formatSGD and PayNow EMVCo QR builder"
```

---

### Task 5: Build `reference.ts` (TDD)

**Files:**
- Create: `/Users/derrickteo/codings/flashcart/src/lib/utils/reference.test.ts`
- Create: `/Users/derrickteo/codings/flashcart/src/lib/utils/reference.ts`

- [ ] **Step 1: Write the failing tests**

Create `/Users/derrickteo/codings/flashcart/src/lib/utils/reference.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { buildPaynowReference } from './reference'

describe('buildPaynowReference', () => {
  it('formats a simple case', () => {
    expect(buildPaynowReference('Tan', 5, 121.05)).toBe('TAN 05 12105')
  })

  it('uses only the first word of a multi-word name', () => {
    expect(buildPaynowReference('Ravi Kumar', 1, 19.48)).toBe('RAVI 01 01948')
  })

  it('strips apostrophes and non-letters', () => {
    expect(buildPaynowReference("O'Brien", 3, 48.99)).toBe('OBRIEN 03 04899')
  })

  it('uppercases lowercase names', () => {
    expect(buildPaynowReference('chen', 1, 10.00)).toBe('CHEN 01 01000')
  })

  it('zero-pads cart size to 2 digits', () => {
    expect(buildPaynowReference('Lim', 7, 5.00)).toBe('LIM 07 00500')
  })

  it('caps cart size at 99', () => {
    expect(buildPaynowReference('Lim', 150, 5.00)).toBe('LIM 99 00500')
  })

  it('rounds cents correctly', () => {
    expect(buildPaynowReference('Wong', 2, 10.125)).toBe('WONG 02 01013')
  })

  it('caps amount at 99999 cents', () => {
    expect(buildPaynowReference('Wong', 2, 1500.00)).toBe('WONG 02 99999')
  })

  it('trims whitespace around the name', () => {
    expect(buildPaynowReference('  Tan  ', 1, 5.00)).toBe('TAN 01 00500')
  })

  it('zero-pads amount to 5 digits', () => {
    expect(buildPaynowReference('Tan', 1, 0.05)).toBe('TAN 01 00005')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run:
```bash
cd /Users/derrickteo/codings/flashcart && npx vitest run src/lib/utils/reference.test.ts
```

Expected: FAIL (`Cannot find module './reference'`).

- [ ] **Step 3: Implement `reference.ts`**

Create `/Users/derrickteo/codings/flashcart/src/lib/utils/reference.ts`:

```ts
export function buildPaynowReference(
  lastName: string,
  cartSize: number,
  total: number,
): string {
  const name = lastName
    .trim()
    .split(/\s+/)[0]
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
  const size = String(Math.min(Math.max(cartSize, 0), 99)).padStart(2, '0')
  const cents = Math.round(total * 100)
  const amount = String(Math.min(Math.max(cents, 0), 99999)).padStart(5, '0')
  return `${name} ${size} ${amount}`
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run:
```bash
cd /Users/derrickteo/codings/flashcart && npx vitest run src/lib/utils/reference.test.ts
```

Expected: all 10 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/utils/reference.ts src/lib/utils/reference.test.ts
git commit -m "feat: add PayNow reference builder (LASTNAME NN NNNNN)"
```

---

### Task 6: Types and Supabase client

**Files:**
- Create: `/Users/derrickteo/codings/flashcart/src/lib/types.ts`
- Create: `/Users/derrickteo/codings/flashcart/src/lib/supabase/client.ts`

- [ ] **Step 1: Create `types.ts`**

Create `/Users/derrickteo/codings/flashcart/src/lib/types.ts`:

```ts
export type Brand = 'CENTRUM' | 'CALTRATE'

export interface Product {
  id: string
  brand: Brand
  name: string
  image_url: string | null
  original_price: number
  sale_price: number
  discount_pct: number
  stock_qty: number
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface CartItem {
  product: Product
  quantity: number
}
```

- [ ] **Step 2: Create `supabase/client.ts`**

Create `/Users/derrickteo/codings/flashcart/src/lib/supabase/client.ts`:

```ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
```

- [ ] **Step 3: Verify TypeScript**

Run:
```bash
cd /Users/derrickteo/codings/flashcart && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/types.ts src/lib/supabase/client.ts
git commit -m "feat: add Product/CartItem types and Supabase browser client"
```

---

### Task 7: Build cart store (TDD)

**Files:**
- Create: `/Users/derrickteo/codings/flashcart/src/lib/store/cart.test.ts`
- Create: `/Users/derrickteo/codings/flashcart/src/lib/store/cart.ts`

- [ ] **Step 1: Write the failing tests**

Create `/Users/derrickteo/codings/flashcart/src/lib/store/cart.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useCartStore } from './cart'
import type { Product } from '@/lib/types'

const p1: Product = {
  id: 'p1',
  brand: 'CENTRUM',
  name: 'Centrum Advance 60s',
  image_url: '/products/a.png',
  original_price: 38.95,
  sale_price: 19.48,
  discount_pct: 50,
  stock_qty: 1000,
  is_active: true,
  sort_order: 1,
  created_at: '',
}

const p2: Product = { ...p1, id: 'p2', name: 'Caltrate 60s', brand: 'CALTRATE', sale_price: 23.50 }

describe('useCartStore', () => {
  beforeEach(() => {
    useCartStore.getState().clear()
  })

  it('starts empty', () => {
    const s = useCartStore.getState()
    expect(s.items).toEqual([])
    expect(s.lastName).toBe('')
    expect(s.size()).toBe(0)
    expect(s.total()).toBe(0)
  })

  it('adds a product with quantity 1', () => {
    useCartStore.getState().add(p1)
    expect(useCartStore.getState().items).toEqual([{ product: p1, quantity: 1 }])
    expect(useCartStore.getState().size()).toBe(1)
  })

  it('increments quantity when the same product is added again', () => {
    useCartStore.getState().add(p1)
    useCartStore.getState().add(p1)
    expect(useCartStore.getState().items[0].quantity).toBe(2)
    expect(useCartStore.getState().size()).toBe(2)
  })

  it('sums total from sale prices', () => {
    useCartStore.getState().add(p1)  // 19.48
    useCartStore.getState().add(p2)  // 23.50
    useCartStore.getState().add(p2)  // 23.50
    expect(useCartStore.getState().total()).toBeCloseTo(66.48, 2)
    expect(useCartStore.getState().size()).toBe(3)
  })

  it('removes an item', () => {
    useCartStore.getState().add(p1)
    useCartStore.getState().add(p2)
    useCartStore.getState().remove('p1')
    expect(useCartStore.getState().items.map((i) => i.product.id)).toEqual(['p2'])
  })

  it('sets quantity directly', () => {
    useCartStore.getState().add(p1)
    useCartStore.getState().setQty('p1', 5)
    expect(useCartStore.getState().items[0].quantity).toBe(5)
  })

  it('removes an item when setQty <= 0', () => {
    useCartStore.getState().add(p1)
    useCartStore.getState().setQty('p1', 0)
    expect(useCartStore.getState().items).toEqual([])
  })

  it('sets and clears last name', () => {
    useCartStore.getState().setLastName('Tan')
    expect(useCartStore.getState().lastName).toBe('Tan')
    useCartStore.getState().clear()
    expect(useCartStore.getState().lastName).toBe('')
    expect(useCartStore.getState().items).toEqual([])
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run:
```bash
cd /Users/derrickteo/codings/flashcart && npx vitest run src/lib/store/cart.test.ts
```

Expected: FAIL (`Cannot find module './cart'`).

- [ ] **Step 3: Implement `cart.ts`**

Create `/Users/derrickteo/codings/flashcart/src/lib/store/cart.ts`:

```ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Product, CartItem } from '@/lib/types'

interface CartState {
  items: CartItem[]
  lastName: string
  add: (product: Product) => void
  remove: (productId: string) => void
  setQty: (productId: string, quantity: number) => void
  setLastName: (name: string) => void
  clear: () => void
  total: () => number
  size: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      lastName: '',
      add: (product) =>
        set((state) => {
          const existing = state.items.find((i) => i.product.id === product.id)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
              ),
            }
          }
          return { items: [...state.items, { product, quantity: 1 }] }
        }),
      remove: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.product.id !== productId) })),
      setQty: (productId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((i) => i.product.id !== productId) }
          }
          return {
            items: state.items.map((i) =>
              i.product.id === productId ? { ...i, quantity } : i,
            ),
          }
        }),
      setLastName: (name) => set({ lastName: name }),
      clear: () => set({ items: [], lastName: '' }),
      total: () =>
        get().items.reduce((sum, { product, quantity }) => sum + product.sale_price * quantity, 0),
      size: () => get().items.reduce((sum, { quantity }) => sum + quantity, 0),
    }),
    {
      name: 'flashcart-cart',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined'
          ? window.localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            },
      ),
    },
  ),
)
```

- [ ] **Step 4: Run tests**

Run:
```bash
cd /Users/derrickteo/codings/flashcart && npx vitest run src/lib/store/cart.test.ts
```

Expected: all 8 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/store/cart.ts src/lib/store/cart.test.ts
git commit -m "feat: add Zustand cart store (items + lastName, persisted)"
```

---

### Task 8: Extract product images from xlsx

**Files:**
- Create: 22 PNGs under `/Users/derrickteo/codings/flashcart/public/products/`

- [ ] **Step 1: Run the extraction script**

This script extracts the 22 embedded PNGs and writes them with kebab-case filenames derived from product names (in sheet order).

Run:
```bash
cd /Users/derrickteo/codings/flashcart && python3 << 'PY'
import zipfile, re, os
xlsx = '/Users/derrickteo/codings/discounter/new project, Jack/Product for Elitez (for AMGEN w ELITEZ Excl. pricing) (1).xlsx'
dst = '/Users/derrickteo/codings/flashcart/public/products'
os.makedirs(dst, exist_ok=True)

# 22 product names in sheet order — must match order in seed SQL (Task 9)
names = [
    'Centrum Advance 60s',
    'Centrum Silver Advance 60s',
    'Centrum Advance 100s',
    'Centrum Men 60s',
    'Centrum Women 60s',
    'Centrum Men 100s',
    'Centrum Women 100s',
    'Centrum Silver Advance 100s',
    'Centrum 50+ Men 60s',
    'Centrum 50+ Women 60s',
    'Centrum 50+ Men 100s',
    'Centrum 50+ Women 100s',
    'Centrum Kids Chews 60s Strawberry',
    'Caltrate 500IU Bone Muscle Health 2in1 60s',
    'Caltrate 500IU Bone Muscle Health 2in1 100s',
    'Caltrate 500IU Bone Muscle Health Plus 3in1 60s',
    'Caltrate 500IU Bone Muscle Health Plus 3in1 100s',
    'Caltrate 600 D 1000IU Bone Muscle Health 60s',
    'Caltrate Joint Health Ucii 30s',
    'Caltrate Joint Health Ucii 90s',
    'Caltrate 1000IU Bone Muscle Vitamin D 60s',
    'Caltrate Joint Speed Hops Uc-ii Collagen 42s',
]

def slug(s):
    s = s.lower()
    s = re.sub(r'[^a-z0-9]+', '-', s)
    s = re.sub(r'-+', '-', s).strip('-')
    return s

z = zipfile.ZipFile(xlsx)
for i, name in enumerate(names, start=1):
    data = z.read(f'xl/media/image{i}.png')
    fn = f'{slug(name)}.png'
    with open(os.path.join(dst, fn), 'wb') as f:
        f.write(data)
    print(i, fn, len(data))
PY
```

Expected: 22 lines printed, each `N filename.png byte-count`. Files in `public/products/`.

- [ ] **Step 2: Verify 22 PNGs exist**

Run:
```bash
ls -1 /Users/derrickteo/codings/flashcart/public/products/ | wc -l
```

Expected: `22`.

- [ ] **Step 3: Commit**

```bash
cd /Users/derrickteo/codings/flashcart
git add public/products/
git commit -m "feat(catalog): extract 22 product images from Elitez xlsx"
```

---

### Task 9: Seed migration SQL

**Files:**
- Create: `/Users/derrickteo/codings/flashcart/supabase/migrations/2026-04-21-flashcart-seed.sql`

- [ ] **Step 1: Create the migration file**

Create `/Users/derrickteo/codings/flashcart/supabase/migrations/2026-04-21-flashcart-seed.sql`:

```sql
-- FlashCart schema + seed (run in Supabase SQL Editor)

create table if not exists products (
  id             uuid primary key default gen_random_uuid(),
  brand          text not null check (brand in ('CENTRUM','CALTRATE')),
  name           text not null,
  image_url      text,
  original_price numeric(10,2) not null,
  sale_price     numeric(10,2) not null,
  discount_pct   integer not null,
  stock_qty      integer not null default 1000,
  is_active      boolean not null default true,
  sort_order     integer not null,
  created_at     timestamptz not null default now()
);

alter table products enable row level security;

drop policy if exists "public read active products" on products;
create policy "public read active products"
  on products for select
  using (is_active = true);

-- Seed 22 SKUs (sheet order)
insert into products (brand, name, image_url, original_price, sale_price, discount_pct, sort_order) values
('CENTRUM',  'Centrum Advance 60''s',                               '/products/centrum-advance-60s.png',                                38.95,  19.48, 50,  1),
('CENTRUM',  'Centrum Silver Advance 60''s',                        '/products/centrum-silver-advance-60s.png',                         44.50,  22.25, 50,  2),
('CENTRUM',  'Centrum Advance 100''s',                              '/products/centrum-advance-100s.png',                               59.50,  40.10, 33,  3),
('CENTRUM',  'Centrum Men 60s',                                      '/products/centrum-men-60s.png',                                    45.50,  31.60, 31,  4),
('CENTRUM',  'Centrum Women 60s',                                    '/products/centrum-women-60s.png',                                  45.50,  31.60, 31,  5),
('CENTRUM',  'Centrum Men 100s',                                     '/products/centrum-men-100s.png',                                   68.50,  47.55, 31,  6),
('CENTRUM',  'Centrum Women 100s',                                   '/products/centrum-women-100s.png',                                 68.50,  47.55, 31,  7),
('CENTRUM',  'Centrum Silver Advance 100''s',                       '/products/centrum-silver-advance-100s.png',                        67.95,  45.85, 33,  8),
('CENTRUM',  'Centrum 50+ Men 60s',                                  '/products/centrum-50-men-60s.png',                                 49.95,  33.00, 34,  9),
('CENTRUM',  'Centrum 50+ Women 60s',                                '/products/centrum-50-women-60s.png',                               49.95,  33.00, 34, 10),
('CENTRUM',  'Centrum 50+ Men 100s',                                 '/products/centrum-50-men-100s.png',                                76.50,  50.55, 34, 11),
('CENTRUM',  'Centrum 50+ Women 100s',                               '/products/centrum-50-women-100s.png',                              76.50,  50.55, 34, 12),
('CENTRUM',  'Centrum Kids Chews 60s (Strawberry)',                  '/products/centrum-kids-chews-60s-strawberry.png',                  25.95,  18.00, 31, 13),
('CALTRATE', 'Caltrate 500IU Bone & Muscle Health (2in1) 60s',       '/products/caltrate-500iu-bone-muscle-health-2in1-60s.png',         33.95,  23.50, 31, 14),
('CALTRATE', 'Caltrate 500IU Bone & Muscle Health (2in1) 100s',      '/products/caltrate-500iu-bone-muscle-health-2in1-100s.png',        51.50,  36.30, 30, 15),
('CALTRATE', 'Caltrate 500IU Bone & Muscle Health Plus (3in1) 60s',  '/products/caltrate-500iu-bone-muscle-health-plus-3in1-60s.png',    37.95,  26.35, 31, 16),
('CALTRATE', 'Caltrate 500IU Bone & Muscle Health Plus (3in1) 100s', '/products/caltrate-500iu-bone-muscle-health-plus-3in1-100s.png',   57.95,  40.20, 31, 17),
('CALTRATE', 'Caltrate 600+D 1000IU Bone & Muscle Health 60s',       '/products/caltrate-600-d-1000iu-bone-muscle-health-60s.png',       43.50,  30.20, 31, 18),
('CALTRATE', 'Caltrate Joint Health Ucii 30s',                       '/products/caltrate-joint-health-ucii-30s.png',                     50.50,  35.05, 31, 19),
('CALTRATE', 'Caltrate Joint Health Ucii 90s',                       '/products/caltrate-joint-health-ucii-90s.png',                    136.50,  94.75, 31, 20),
('CALTRATE', 'Caltrate 1000IU Bone & Muscle Vitamin D 60s',          '/products/caltrate-1000iu-bone-muscle-vitamin-d-60s.png',          21.50,  14.95, 30, 21),
('CALTRATE', 'Caltrate Joint Speed Hops Uc-ii Collagen 42s',         '/products/caltrate-joint-speed-hops-uc-ii-collagen-42s.png',       67.95,  42.85, 37, 22);
```

- [ ] **Step 2: Verify image_url paths match actual files**

Run:
```bash
cd /Users/derrickteo/codings/flashcart
grep -oE "/products/[a-z0-9-]+\.png" supabase/migrations/2026-04-21-flashcart-seed.sql | sort -u > /tmp/seed_paths.txt
ls -1 public/products/ | awk '{print "/products/"$1}' | sort -u > /tmp/disk_paths.txt
diff /tmp/seed_paths.txt /tmp/disk_paths.txt
```

Expected: no diff output (files match).

If paths don't match, rename files to match seed (or fix seed to match files). The slug function in Task 8 should produce exactly these names.

- [ ] **Step 3: Commit**

```bash
cd /Users/derrickteo/codings/flashcart
git add supabase/migrations/2026-04-21-flashcart-seed.sql
git commit -m "feat(db): add products table schema + 22-SKU seed migration"
```

---

### Task 10: Navbar

**Files:**
- Create: `/Users/derrickteo/codings/flashcart/src/components/layout/Navbar.tsx`

- [ ] **Step 1: Create `Navbar.tsx`**

Create `/Users/derrickteo/codings/flashcart/src/components/layout/Navbar.tsx`:

```tsx
'use client'

import Link from 'next/link'
import { ShoppingCart, Zap } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'

export default function Navbar() {
  const size = useCartStore((s) => s.size())

  return (
    <header className="sticky top-0 z-50 bg-red-600 text-white shadow-sm">
      <div className="max-w-md mx-auto h-14 px-4 flex items-center justify-between">
        <Link href="/" className="flex items-baseline gap-1.5 leading-none">
          <Zap className="w-5 h-5 text-yellow-300 self-center" />
          <span className="font-extrabold text-lg tracking-tight">FlashCart</span>
          <span className="text-[11px] opacity-80 font-medium">by Elitez</span>
        </Link>
        <Link href="/cart" className="relative p-1">
          <ShoppingCart className="w-5 h-5" />
          {size > 0 && (
            <span className="absolute -top-1 -right-1 bg-yellow-300 text-red-800 text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {size}
            </span>
          )}
        </Link>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

Run:
```bash
cd /Users/derrickteo/codings/flashcart && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Navbar.tsx
git commit -m "feat(ui): add Navbar with FlashCart branding and cart badge"
```

---

### Task 11: BrandFilter component

**Files:**
- Create: `/Users/derrickteo/codings/flashcart/src/components/products/BrandFilter.tsx`

- [ ] **Step 1: Create `BrandFilter.tsx`**

Create `/Users/derrickteo/codings/flashcart/src/components/products/BrandFilter.tsx`:

```tsx
'use client'

import type { Brand } from '@/lib/types'
import { cn } from '@/lib/utils'

export type BrandFilterValue = 'all' | Brand

interface Props {
  selected: BrandFilterValue
  onChange: (value: BrandFilterValue) => void
}

const OPTIONS: { value: BrandFilterValue; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'CENTRUM', label: 'Centrum' },
  { value: 'CALTRATE', label: 'Caltrate' },
]

export default function BrandFilter({ selected, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border',
            selected === opt.value
              ? 'bg-red-600 text-white border-red-600'
              : 'bg-white text-gray-700 border-gray-200',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/products/BrandFilter.tsx
git commit -m "feat(ui): add BrandFilter (All / Centrum / Caltrate)"
```

---

### Task 12: ProductCard component

**Files:**
- Create: `/Users/derrickteo/codings/flashcart/src/components/products/ProductCard.tsx`

- [ ] **Step 1: Create `ProductCard.tsx`**

Create `/Users/derrickteo/codings/flashcart/src/components/products/ProductCard.tsx`:

```tsx
'use client'

import Image from 'next/image'
import { Plus, Minus } from 'lucide-react'
import type { Product } from '@/lib/types'
import { useCartStore } from '@/lib/store/cart'
import { formatSGD } from '@/lib/utils/format'
import { Card } from '@/components/ui/card'

export default function ProductCard({ product }: { product: Product }) {
  const items = useCartStore((s) => s.items)
  const add = useCartStore((s) => s.add)
  const setQty = useCartStore((s) => s.setQty)

  const inCart = items.find((i) => i.product.id === product.id)?.quantity ?? 0

  return (
    <Card className="overflow-hidden p-0 flex flex-col">
      <div className="relative aspect-square bg-gray-50">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-contain p-2"
            sizes="(max-width: 768px) 50vw, 240px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">💊</div>
        )}
        <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">
          −{product.discount_pct}%
        </span>
      </div>
      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="text-[11px] text-gray-400 uppercase tracking-wide">{product.brand}</p>
        <p className="text-sm font-semibold line-clamp-2 leading-tight min-h-[2.5rem]">{product.name}</p>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-xs text-gray-400 line-through">{formatSGD(product.original_price)}</span>
          <span className="text-base font-bold text-red-600">{formatSGD(product.sale_price)}</span>
        </div>
        <div className="mt-2">
          {inCart === 0 ? (
            <button
              onClick={() => add(product)}
              className="w-full h-9 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm font-semibold flex items-center justify-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          ) : (
            <div className="flex items-center justify-between h-9 rounded-md bg-red-50 border border-red-200 px-1">
              <button
                onClick={() => setQty(product.id, inCart - 1)}
                className="w-7 h-7 rounded-md hover:bg-red-100 flex items-center justify-center"
              >
                <Minus className="w-4 h-4 text-red-600" />
              </button>
              <span className="font-bold text-red-700">{inCart}</span>
              <button
                onClick={() => setQty(product.id, inCart + 1)}
                className="w-7 h-7 rounded-md hover:bg-red-100 flex items-center justify-center"
              >
                <Plus className="w-4 h-4 text-red-600" />
              </button>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/products/ProductCard.tsx
git commit -m "feat(ui): add ProductCard with qty stepper and discount badge"
```

---

### Task 13: Root layout

**Files:**
- Create: `/Users/derrickteo/codings/flashcart/src/app/layout.tsx`

- [ ] **Step 1: Create `layout.tsx`**

Create `/Users/derrickteo/codings/flashcart/src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import Navbar from '@/components/layout/Navbar'
import './globals.css'

export const metadata: Metadata = {
  title: 'FlashCart (by Elitez) — Flash Sale Vitamins',
  description: 'Centrum & Caltrate vitamins at up to 50% off. In-person PayNow checkout.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 antialiased">
        <Navbar />
        <main className="max-w-md mx-auto px-4 py-4">{children}</main>
        <Toaster position="top-center" />
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: add root layout with Navbar and Toaster"
```

---

### Task 14: Catalogue page (`/`)

**Files:**
- Create: `/Users/derrickteo/codings/flashcart/src/app/page.tsx`

- [ ] **Step 1: Create `page.tsx`**

Create `/Users/derrickteo/codings/flashcart/src/app/page.tsx`:

```tsx
'use client'

import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import ProductCard from '@/components/products/ProductCard'
import BrandFilter, { BrandFilterValue } from '@/components/products/BrandFilter'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/lib/types'

export default function CataloguePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [brand, setBrand] = useState<BrandFilterValue>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        setProducts(data ?? [])
        setLoading(false)
      })
  }, [])

  const filtered = products.filter((p) => {
    if (brand !== 'all' && p.brand !== brand) return false
    if (search.trim() && !p.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-4">
      <div className="bg-red-600 text-white rounded-xl p-4 text-center">
        <p className="text-2xl font-bold">⚡ Flash Sale — Today Only</p>
        <p className="text-sm opacity-90 mt-0.5">Up to 50% off vitamins · PayNow checkout</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search vitamins..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-white"
        />
      </div>

      <BrandFilter selected={brand} onChange={setBrand} />

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-2">😕</p>
          <p>No products match</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: add catalogue page (/)"
```

---

### Task 15: Cart page (`/cart`)

**Files:**
- Create: `/Users/derrickteo/codings/flashcart/src/app/cart/page.tsx`

- [ ] **Step 1: Create `cart/page.tsx`**

Create `/Users/derrickteo/codings/flashcart/src/app/cart/page.tsx`:

```tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Trash2, ShoppingBag, ChevronRight, Minus, Plus, User } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useCartStore } from '@/lib/store/cart'
import { formatSGD } from '@/lib/utils/format'

export default function CartPage() {
  const router = useRouter()
  const { items, lastName, setQty, remove, setLastName, total } = useCartStore()

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

  const sum = total()
  const canPay = !!lastName.trim() && items.length > 0

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold">Your Cart</h1>

      <div className="space-y-3">
        {items.map(({ product, quantity }) => (
          <Card key={product.id} className="p-3 flex gap-3">
            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              {product.image_url ? (
                <Image src={product.image_url} alt={product.name} fill className="object-contain p-1" sizes="64px" />
              ) : (
                <div className="flex items-center justify-center h-full text-2xl">💊</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold line-clamp-2 leading-tight">{product.name}</p>
              <p className="text-red-600 font-bold text-sm mt-0.5">{formatSGD(product.sale_price)}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <button
                  className="w-6 h-6 rounded-full border flex items-center justify-center text-gray-600"
                  onClick={() => setQty(product.id, quantity - 1)}
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-sm w-4 text-center">{quantity}</span>
                <button
                  className="w-6 h-6 rounded-full border flex items-center justify-center text-gray-600"
                  onClick={() => setQty(product.id, quantity + 1)}
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="flex flex-col items-end justify-between">
              <button onClick={() => remove(product.id)} className="text-gray-300 hover:text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
              <p className="text-sm font-bold">{formatSGD(product.sale_price * quantity)}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4 space-y-3">
        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span className="text-red-600 text-lg">{formatSGD(sum)}</span>
        </div>
        <Separator />
        <div className="space-y-1">
          <Label htmlFor="lastname" className="flex items-center gap-1.5 text-xs">
            <User className="w-3.5 h-3.5" /> Last name (for PayNow reference)
          </Label>
          <Input
            id="lastname"
            placeholder="e.g. Tan"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
      </Card>

      {canPay ? (
        <Button
          onClick={() => router.push('/pay')}
          className="w-full bg-red-600 hover:bg-red-700 h-12 text-base font-bold flex items-center justify-center gap-2"
        >
          Pay {formatSGD(sum)} <ChevronRight className="w-4 h-4" />
        </Button>
      ) : (
        <Button disabled className="w-full bg-red-600 h-12 text-base font-bold opacity-50">
          Enter last name to pay
        </Button>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/cart/page.tsx
git commit -m "feat: add cart page (/cart) with last-name input"
```

---

### Task 16: Pay page (`/pay`) with receipt snapshot

**Files:**
- Create: `/Users/derrickteo/codings/flashcart/src/app/pay/page.tsx`

- [ ] **Step 1: Create `pay/page.tsx`**

Create `/Users/derrickteo/codings/flashcart/src/app/pay/page.tsx`:

```tsx
'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import QRCode from 'qrcode'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useCartStore } from '@/lib/store/cart'
import { formatSGD } from '@/lib/utils/format'
import { buildPaynowReference } from '@/lib/utils/reference'
import { buildPaynowString } from '@/lib/utils/paynow'

const PAYNOW_NUMBER = '+6583638499'
const PAYNOW_DISPLAY = '+65 8363 8499'

export default function PayPage() {
  const router = useRouter()
  const { items, lastName, total, size, clear } = useCartStore()
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [timestamp] = useState(() =>
    new Date().toLocaleString('en-SG', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }),
  )

  const amount = total()
  const cartSize = size()
  const ref = buildPaynowReference(lastName || 'CUSTOMER', cartSize, amount)

  useEffect(() => {
    if (items.length === 0) {
      router.replace('/')
    }
  }, [items.length, router])

  useEffect(() => {
    if (items.length === 0) return
    const str = buildPaynowString({
      mobile: PAYNOW_NUMBER,
      amount,
      reference: ref,
      editable: false,
    })
    QRCode.toDataURL(str, { width: 512, margin: 1 }).then(setQrDataUrl)
  }, [amount, ref, items.length])

  if (items.length === 0) return null

  function handleCopyRef() {
    navigator.clipboard.writeText(ref)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleBack() {
    clear()
    router.push('/')
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold">Pay with PayNow</h1>

      <Card className="p-5 space-y-4 text-center">
        <p className="text-sm text-gray-600 font-medium">
          Scan with your banking app (DBS, OCBC, UOB, GrabPay, PayLah!)
        </p>

        <div className="flex justify-center">
          {qrDataUrl ? (
            <Image src={qrDataUrl} alt="PayNow QR Code" width={224} height={224} className="rounded-lg" />
          ) : (
            <div className="w-56 h-56 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">
              Loading QR...
            </div>
          )}
        </div>

        <div className="bg-red-50 rounded-xl p-3 space-y-1">
          <p className="text-xs text-gray-500">Amount</p>
          <p className="text-3xl font-bold text-red-600">{formatSGD(amount)}</p>
          <p className="text-xs text-gray-400">PayNow to {PAYNOW_DISPLAY}</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 space-y-1">
          <p className="text-xs font-semibold text-yellow-800">Payment Reference / Remarks</p>
          <div className="flex items-center justify-center gap-2">
            <p className="font-mono font-bold text-lg tracking-wider text-yellow-900">{ref}</p>
            <button onClick={handleCopyRef} className="text-yellow-600 hover:text-yellow-800">
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-yellow-700">⚠ Enter this exactly in the &ldquo;Remarks&rdquo; field</p>
        </div>
      </Card>

      <Card className="p-4 space-y-2">
        <p className="text-sm font-semibold">How to pay:</p>
        <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
          <li>Open your banking app</li>
          <li>Scan the QR, or transfer to <strong>{PAYNOW_DISPLAY}</strong></li>
          <li>Enter amount: <strong>{formatSGD(amount)}</strong></li>
          <li>In <strong>Remarks</strong>, enter: <strong className="font-mono">{ref}</strong></li>
          <li>Complete the transfer</li>
        </ol>
      </Card>

      <div className="flex items-center gap-2 py-1 text-xs text-gray-400 uppercase tracking-wide">
        <div className="flex-1 h-px bg-gray-200" />
        <span>Receipt</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <Card className="p-4 space-y-3 border-2 border-gray-200">
        <div className="text-center">
          <p className="font-extrabold text-lg tracking-tight">⚡ FlashCart</p>
          <p className="text-[11px] text-gray-400">{timestamp}</p>
        </div>
        <Separator />
        <p className="text-xs text-gray-500">
          Ref: <span className="font-mono font-bold">{ref}</span>
        </p>

        <div className="space-y-3">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="flex gap-3">
              <div className="relative w-12 h-12 rounded bg-gray-50 flex-shrink-0">
                {product.image_url ? (
                  <Image src={product.image_url} alt={product.name} fill className="object-contain p-1" sizes="48px" />
                ) : (
                  <div className="flex items-center justify-center h-full text-xl">💊</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold line-clamp-1">{product.name}</p>
                <p className="text-[11px] text-gray-500">
                  <span className="line-through">{formatSGD(product.original_price)}</span>
                  <span> → </span>
                  <span className="text-red-600 font-semibold">{formatSGD(product.sale_price)}</span>
                  <span> × {quantity}</span>
                </p>
              </div>
              <div className="text-sm font-bold whitespace-nowrap">
                {formatSGD(product.sale_price * quantity)}
              </div>
            </div>
          ))}
        </div>

        <Separator />

        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Subtotal</span>
          <span>{formatSGD(amount)}</span>
        </div>
        <div className="flex justify-between text-base font-bold">
          <span>Total</span>
          <span className="text-red-600">{formatSGD(amount)}</span>
        </div>

        <Separator />
        <div className="text-center text-[11px] text-gray-400 space-y-0.5">
          <p>Paid via PayNow to {PAYNOW_DISPLAY}</p>
          <p className="font-semibold">Powered by Elitez</p>
        </div>
      </Card>

      <Button
        onClick={handleBack}
        variant="outline"
        className="w-full h-12 text-base font-bold"
      >
        Back to shop
      </Button>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

Run:
```bash
cd /Users/derrickteo/codings/flashcart && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/pay/page.tsx
git commit -m "feat: add pay page (/pay) with QR and screenshot-friendly receipt"
```

---

### Task 17: Full build + lint

**Files:** (verification only)

- [ ] **Step 1: Set placeholder env vars so `next build` doesn't error**

Run:
```bash
cd /Users/derrickteo/codings/flashcart
cat > .env.local <<EOF
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_placeholder
EOF
```

Don't commit `.env.local` — it's already gitignored.

- [ ] **Step 2: Run the full test suite**

Run:
```bash
cd /Users/derrickteo/codings/flashcart && npm test
```

Expected: all tests PASS (`reference.test.ts`, `cart.test.ts`, `paynow.test.ts`). Total test count = 10 (reference) + 8 (cart) + N (paynow from Discounter).

- [ ] **Step 3: Run lint**

Run:
```bash
cd /Users/derrickteo/codings/flashcart && npm run lint
```

Expected: no errors.

- [ ] **Step 4: Run production build**

Run:
```bash
cd /Users/derrickteo/codings/flashcart && npm run build
```

Expected: build succeeds, all routes (`/`, `/cart`, `/pay`) prerender or mark as dynamic appropriately. No TypeScript errors.

- [ ] **Step 5: Start dev server for local smoke test**

Run:
```bash
cd /Users/derrickteo/codings/flashcart && npm run dev
```

Open `http://localhost:3000` in a browser. The catalogue will be empty (placeholder Supabase URL has no data) but the page should render with hero, search, filter chips, and empty-state `😕 No products match`. The navbar should show `⚡ FlashCart by Elitez` with no cart badge. Stop the server (Ctrl+C).

- [ ] **Step 6: Nothing to commit from this task (verification only)**

---

## Phase 2 — Infra & deploy (operator steps)

These steps require the user's browser to click through GitHub / Supabase / Vercel dashboards. The agent prepares files and SQL; the user applies them.

### Task 18: Create GitHub repo and push

**Files:** none (operation only)

- [ ] **Step 1: Create empty repo on GitHub**

Open https://github.com/new in a browser and create a new repo under `derrick-pixel`:
- Name: `flashcart`
- Visibility: Private (or Public — your call)
- Do NOT add README, .gitignore, or license (we have our own commits already)

Or via `gh` CLI:
```bash
gh repo create derrick-pixel/flashcart --private --source=/Users/derrickteo/codings/flashcart --push=false
```

- [ ] **Step 2: Set remote and push**

Run:
```bash
cd /Users/derrickteo/codings/flashcart
git remote add origin https://github.com/derrick-pixel/flashcart.git
git branch -M main
git push -u origin main
```

Expected: all commits pushed, upstream tracking set.

---

### Task 19: Create Supabase project and run seed

**Files:** referenced `/Users/derrickteo/codings/flashcart/supabase/migrations/2026-04-21-flashcart-seed.sql`

- [ ] **Step 1: Create Supabase project**

Open https://supabase.com/dashboard → New project:
- Name: `flashcart`
- Org: `derrick's Org` (same as Discounter)
- Region: Singapore (ap-southeast-1)
- Plan: Free
- Database password: (save it somewhere)

Wait for provisioning (~1 min).

- [ ] **Step 2: Copy the seed SQL to clipboard**

Run:
```bash
cat /Users/derrickteo/codings/flashcart/supabase/migrations/2026-04-21-flashcart-seed.sql | pbcopy
```

- [ ] **Step 3: Run the seed in Supabase SQL Editor**

In the Supabase dashboard for `flashcart`:
1. Left sidebar → SQL Editor → New query
2. Paste (Cmd+V)
3. Click Run
4. Expect `Success. No rows returned` plus the inserts completing

- [ ] **Step 4: Verify the data**

In the same SQL Editor, run:
```sql
select count(*) as total, count(*) filter (where brand = 'CENTRUM') as centrum, count(*) filter (where brand = 'CALTRATE') as caltrate from products;
```

Expected: `total=22, centrum=13, caltrate=9`.

- [ ] **Step 5: Grab the anon key and URL**

In Supabase dashboard → Settings → API:
- Copy **Project URL** (`https://xxxxxxxxx.supabase.co`)
- Copy **Project API Keys → publishable key** (`sb_publishable_...`)

Save these for Task 20.

---

### Task 20: Create Vercel project and deploy

**Files:** none (operation only)

- [ ] **Step 1: Import repo into Vercel**

Open https://vercel.com/new. Import `derrick-pixel/flashcart`:
- Framework preset: Next.js (auto-detected)
- Root Directory: `./` (default)
- Build & Output: defaults

- [ ] **Step 2: Set environment variables**

In the Environment Variables section (same screen), add:
- `NEXT_PUBLIC_SUPABASE_URL` = the URL from Task 19 step 5
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = the publishable key from Task 19 step 5

Both scoped to Production, Preview, Development.

- [ ] **Step 3: Deploy**

Click Deploy. Wait ~2 min. Expect success and a URL like `https://flashcart-xxxxx.vercel.app`.

- [ ] **Step 4: (Optional) rename production URL**

Vercel project Settings → Domains. Add `flashcart.vercel.app` if available, else `flashcart-elitez.vercel.app`.

---

### Task 21: Smoke test

**Files:** none

- [ ] **Step 1: Open the deployed URL on a mobile browser**

On a phone (or desktop with mobile emulation):
- Catalogue renders with 22 SKUs.
- All 22 images load (no broken icons).
- Prices match the spec's table (e.g. Centrum Advance 60's = S$38.95 slashed → S$19.48, −50% badge).
- Brand filter (All / Centrum / Caltrate) filters correctly.
- Search narrows by name.

- [ ] **Step 2: Walk through checkout**

- Add 3 different items across both brands.
- Cart badge in navbar shows the total quantity.
- Tap cart → qty steppers work; trash removes; subtotal is correct.
- Type a last name; `Pay Sxxx.xx` button becomes active; tap it.
- `/pay` renders QR within 1 sec; amount matches; reference is `LASTNAME NN NNNNN` with correct values.

- [ ] **Step 3: Verify the PayNow QR scans**

Open DBS PayLah (or OCBC / UOB / GrabPay). Scan the QR. Confirm:
- Payee: `+65 8363 8499`
- Amount: matches on-screen total exactly
- Reference: editable field shows the same reference

(Don't complete the transfer unless you actually want to pay yourself. Cancel after verifying.)

- [ ] **Step 4: Screenshot the receipt**

Scroll to the "Receipt" section. Screenshot. Verify the screenshot includes:
- `⚡ FlashCart` title
- Timestamp
- Ref
- All line items with thumbnails, slashed/sale prices, line totals
- Subtotal + Total
- `Powered by Elitez` footer

"Back to shop" button should NOT need to be in the screenshot.

- [ ] **Step 5: Tap Back to shop**

Cart should be cleared (navbar badge gone, `/` loads empty cart).

---

## Self-review checklist (run after writing the plan)

- [x] **Spec coverage:** every section of `2026-04-21-flashcart-design.md` mapped to a task:
  - §1 Product summary → Tasks 14, 15, 16 implement the flow
  - §2 Architecture & separation → Tasks 1, 18, 19, 20
  - §3 Data model → Task 9 (+ types in Task 6, images in Task 8)
  - §4 App structure → Tasks 1–3 scaffolding, 10–16 components/pages
  - §5 Flow → Tasks 14 (catalogue), 15 (cart), 16 (pay)
  - §6 Reference format → Task 5 (TDD)
  - §7 Cart store → Task 7 (TDD)
  - §8 Env vars → Task 20
  - §9 Testing → Tasks 5, 7, 17 (unit) + 21 (manual)
  - §10 Deployment → Tasks 18, 19, 20
- [x] **Placeholder scan:** no `TBD`, `TODO`, or "similar to".
- [x] **Type consistency:** `CartState` used in Tasks 7 matches usage in 15, 16. `Product` fields in Task 6 match seed (Task 9) and consumers (Tasks 12, 15, 16). `buildPaynowReference` signature in Task 5 matches call site in Task 16.
