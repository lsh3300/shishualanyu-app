export interface Product {
  id: string
  name: string
  description?: string
  price: number
  originalPrice?: number
  category?: string
  image_url?: string
  images: string[]
  videos?: string[]
  in_stock?: boolean
  sales?: number
  isNew?: boolean
  discount?: number
  created_at?: string
  updated_at?: string
}