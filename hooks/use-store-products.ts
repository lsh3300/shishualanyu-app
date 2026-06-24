"use client"

import useSWR from "swr"
import { fetchJson } from "@/lib/fetch-json"

export type StoreProduct = {
  id: string
  slug?: string | null
  name: string
  price: number
  description?: string | null
  images?: unknown
  coverImage?: string | null
  image_url?: string | null
  sales?: number | null
  originalPrice?: number | null
  isNew?: boolean | null
  discount?: number | null
} & Record<string, unknown>

type ProductsResponse = {
  products?: StoreProduct[]
}

export function useStoreProducts() {
  const swr = useSWR<ProductsResponse>(
    ["store-products"],
    () =>
      fetchJson<ProductsResponse>("/api/products", {
        timeoutMs: 12000,
        retries: 1,
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000,
    }
  )

  return {
    products: swr.data?.products ?? [],
    loading: swr.isLoading,
    error: swr.error as Error | undefined,
    mutate: swr.mutate,
  }
}
