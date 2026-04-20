export type Category =
  // Legacy grocery categories — retained so the OOS page can still query legacy SKUs.
  | 'beverages'
  | 'snacks'
  | 'instant_noodles'
  | 'canned_goods'
  | 'rice_grains'
  | 'cooking_essentials'
  | 'personal_care'
  | 'dairy'
  | 'other'
  // GSK catalogue categories
  | 'pain_relief'
  | 'oral_care'
  | 'denture_care'
  | 'vitamins'
  | 'supplements'
  | 'cold_flu'
  | 'skincare'
  | 'digestive'

export interface Product {
  id: string
  name: string
  description: string | null
  image_url: string | null
  category: Category
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

export interface User {
  id: string
  phone: string
  full_name: string | null
  dormitory_id: string | null
  role: 'customer' | 'admin'
  created_at: string
}

export interface Order {
  id: string
  user_id: string
  dormitory_id: string
  status: 'pending_payment' | 'paid' | 'processing' | 'out_for_delivery' | 'delivered' | 'cancelled'
  total_amount: number
  payment_status: 'unpaid' | 'paid' | 'refunded'
  payment_ref: string | null       // PayNow reference (LASTNAME POSTALCODE)
  postal_code: string
  week_cutoff: string // ISO date of the weekly cutoff this order belongs to
  notes: string | null
  created_at: string
  dormitory?: Dormitory
  order_items?: OrderItem[]
  user?: User
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  product?: Product
}

export interface CartItem {
  product: Product
  quantity: number
}
