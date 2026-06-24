export interface ProductMedia {
  id: string
  product_id?: string
  type: 'image' | 'video'
  url: string
  thumbnail?: string | null
  position: number
  cover?: boolean
  metadata?: Record<string, any>
}

export interface Product {
  id: string
  slug?: string | null
  name: string
  description?: string | null
  price: number
  originalPrice?: number | null
  category?: string | null
  inventory?: number
  status?: string | null
  isNew?: boolean
  discount?: number | null
  metadata?: Record<string, any>
  coverImage?: string | null
  images: string[]
  videos?: string[]
  media?: ProductMedia[]
  createdAt?: string
  updatedAt?: string
}