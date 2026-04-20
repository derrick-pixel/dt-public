import { describe, it, expect, beforeEach } from 'vitest'
import { useCartStore } from './cart'
import { Product } from '@/lib/types'

const mockProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'prod-1',
  name: 'Test Product',
  description: null,
  image_url: null,
  category: 'snacks',
  original_price: 10.00,
  sale_price: 4.00,
  discount_pct: 60,
  expiry_date: '2025-12-31',
  stock_qty: 10,
  is_active: true,
  created_at: '2025-01-01',
  ...overrides,
})

describe('Cart Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useCartStore.setState({ items: [], dormitoryId: null })
  })

  describe('addItem', () => {
    it('adds a new product to the cart', () => {
      const product = mockProduct()
      useCartStore.getState().addItem(product)

      const items = useCartStore.getState().items
      expect(items).toHaveLength(1)
      expect(items[0].product.id).toBe('prod-1')
      expect(items[0].quantity).toBe(1)
    })

    it('increments quantity for existing product', () => {
      const product = mockProduct()
      useCartStore.getState().addItem(product)
      useCartStore.getState().addItem(product)

      const items = useCartStore.getState().items
      expect(items).toHaveLength(1)
      expect(items[0].quantity).toBe(2)
    })

    it('caps quantity at stock_qty', () => {
      const product = mockProduct({ stock_qty: 2 })
      useCartStore.getState().addItem(product)
      useCartStore.getState().addItem(product)
      useCartStore.getState().addItem(product) // should not exceed 2

      const items = useCartStore.getState().items
      expect(items[0].quantity).toBe(2)
    })

    it('handles multiple different products', () => {
      useCartStore.getState().addItem(mockProduct({ id: 'prod-1' }))
      useCartStore.getState().addItem(mockProduct({ id: 'prod-2' }))

      expect(useCartStore.getState().items).toHaveLength(2)
    })
  })

  describe('removeItem', () => {
    it('removes a product from the cart', () => {
      useCartStore.getState().addItem(mockProduct())
      useCartStore.getState().removeItem('prod-1')

      expect(useCartStore.getState().items).toHaveLength(0)
    })

    it('does nothing for non-existent product', () => {
      useCartStore.getState().addItem(mockProduct())
      useCartStore.getState().removeItem('non-existent')

      expect(useCartStore.getState().items).toHaveLength(1)
    })
  })

  describe('updateQuantity', () => {
    it('updates the quantity of an item', () => {
      useCartStore.getState().addItem(mockProduct())
      useCartStore.getState().updateQuantity('prod-1', 5)

      expect(useCartStore.getState().items[0].quantity).toBe(5)
    })

    it('removes item when quantity is 0', () => {
      useCartStore.getState().addItem(mockProduct())
      useCartStore.getState().updateQuantity('prod-1', 0)

      expect(useCartStore.getState().items).toHaveLength(0)
    })

    it('removes item when quantity is negative', () => {
      useCartStore.getState().addItem(mockProduct())
      useCartStore.getState().updateQuantity('prod-1', -1)

      expect(useCartStore.getState().items).toHaveLength(0)
    })

    it('clamps quantity to stock_qty', () => {
      useCartStore.getState().addItem(mockProduct({ stock_qty: 5 }))
      useCartStore.getState().updateQuantity('prod-1', 99)

      expect(useCartStore.getState().items[0].quantity).toBe(5)
    })

    it('does nothing for non-existent product', () => {
      useCartStore.getState().addItem(mockProduct())
      useCartStore.getState().updateQuantity('non-existent', 5)

      expect(useCartStore.getState().items).toHaveLength(1)
      expect(useCartStore.getState().items[0].quantity).toBe(1)
    })
  })

  describe('totalItems', () => {
    it('returns 0 for empty cart', () => {
      expect(useCartStore.getState().totalItems()).toBe(0)
    })

    it('sums quantities across all items', () => {
      useCartStore.getState().addItem(mockProduct({ id: 'prod-1' }))
      useCartStore.getState().addItem(mockProduct({ id: 'prod-2' }))
      useCartStore.getState().updateQuantity('prod-1', 3)

      expect(useCartStore.getState().totalItems()).toBe(4) // 3 + 1
    })
  })

  describe('totalAmount', () => {
    it('returns 0 for empty cart', () => {
      expect(useCartStore.getState().totalAmount()).toBe(0)
    })

    it('calculates total based on sale_price * quantity', () => {
      useCartStore.getState().addItem(mockProduct({ id: 'prod-1', sale_price: 4.00 }))
      useCartStore.getState().addItem(mockProduct({ id: 'prod-2', sale_price: 2.50 }))
      useCartStore.getState().updateQuantity('prod-1', 2)

      // (4.00 * 2) + (2.50 * 1) = 10.50
      expect(useCartStore.getState().totalAmount()).toBe(10.50)
    })
  })

  describe('dormitory', () => {
    it('sets dormitory ID', () => {
      useCartStore.getState().setDormitory('dorm-1')
      expect(useCartStore.getState().dormitoryId).toBe('dorm-1')
    })
  })

  describe('clearCart', () => {
    it('clears all items and dormitory', () => {
      useCartStore.getState().addItem(mockProduct())
      useCartStore.getState().setDormitory('dorm-1')
      useCartStore.getState().clearCart()

      expect(useCartStore.getState().items).toHaveLength(0)
      expect(useCartStore.getState().dormitoryId).toBeNull()
    })
  })
})
