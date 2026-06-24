"use client"

import useSWR from "swr"
import { useAuth } from "@/contexts/auth-context"
import { fetchJson } from "@/lib/fetch-json"

export type MarketListing = {
  id: string
  shop_id: string
  seller_id: string
  seller_name: string
  cloth_data: {
    id: string
    name: string
    pattern: string
    colors: string[]
    technique: string
    score: number
    grade: string
    preview_url?: string | null
  }
  price: number
  original_price: number
  is_featured: boolean
  status: string
  created_at: string
  is_system?: boolean
} & Record<string, unknown>

type MarketResponse = {
  success: boolean
  data: {
    listings: MarketListing[]
  }
}

export function useMarketListings() {
  const { user, getToken } = useAuth()

  const key = user ? ["market", user.id] : null

  const swr = useSWR<MarketListing[]>(
    key,
    async () => {
      const token = await getToken()
      if (!token) return []

      const res = await fetchJson<MarketResponse>("/api/market", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeoutMs: 12000,
        retries: 1,
      })

      return res.data?.listings ?? []
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 15000,
    }
  )

  return {
    listings: swr.data ?? [],
    loading: user ? swr.isLoading : false,
    error: swr.error as Error | undefined,
    mutate: swr.mutate,
  }
}
