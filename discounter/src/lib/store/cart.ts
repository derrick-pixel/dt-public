import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem, Product } from '@/lib/types'

interface CartStore {
  items: CartItem[]
  dormitoryId: string | null
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  setDormitory: (dormitoryId: string) => void
  clearCart: () => void
  totalItems: () => number
  totalAmount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      dormitoryId: null,

      addItem: (product) => {
        const items = get().items
        const existing = items.find((i) => i.product.id === product.id)
        if (existing) {
          set({
            items: items.map((i) =>
              i.product.id === product.id
                ? { ...i, quantity: Math.min(i.quantity + 1, product.stock_qty) }
                : i
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
            i.product.id === productId ? { ...i, quantity: clampedQty } : i
          ),
        })
      },

      setDormitory: (dormitoryId) => set({ dormitoryId }),

      clearCart: () => set({ items: [], dormitoryId: null }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalAmount: () =>
        get().items.reduce((sum, i) => sum + i.product.sale_price * i.quantity, 0),
    }),
    { name: 'discounter-cart' }
  )
)
