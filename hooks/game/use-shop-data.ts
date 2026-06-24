"use client"

import useSWR from "swr"
import { useAuth } from "@/contexts/auth-context"
import { fetchJson } from "@/lib/fetch-json"
import type { ShopListing, UserShop } from "@/types/shop.types"

type ShopApiResponse = {
  success: boolean
  data: {
    shop: UserShop
    listings: ShopListing[]
    listingCount: number
  }
}

type ExpandListingsApiResponse = {
  success: boolean
  data: {
    currentSlots: number
    maxSlots: number
    canExpand: boolean
    expansionCost: number | null
    expansionAmount: number
  }
}

export type ShopData = {
  shop: UserShop
  listings: ShopListing[]
  listingCount: number
  expansion: {
    currentSlots: number
    maxSlots: number
    canExpand: boolean
    cost: number
    amount: number
  }
}

function normalizeListings(listings: ShopListing[]): ShopListing[] {
  return (listings || []).map((l) => {
    const cloth = l.cloth
    const layers = cloth?.layers
    const safeLayers = Array.isArray(layers) ? layers : []

    return {
      ...l,
      cloth: cloth
        ? {
            ...cloth,
            layers: safeLayers,
          }
        : cloth,
    }
  })
}

export function useShopData() {
  const { user, getToken } = useAuth()

  const key = user ? ["shop-data", user.id] : null

  const swr = useSWR<ShopData | null>(
    key,
    async () => {
      const token = await getToken()
      if (!token) return null

      const headers = {
        Authorization: `Bearer ${token}`,
      }

      const [shopRes, expandRes] = await Promise.all([
        fetchJson<ShopApiResponse>("/api/shop", {
          headers,
          timeoutMs: 12000,
          retries: 1,
        }),
        fetchJson<ExpandListingsApiResponse>("/api/shop/expand-listings", {
          headers,
          timeoutMs: 12000,
          retries: 1,
        }),
      ])

      const shop = shopRes.data.shop
      const listingCount = shopRes.data.listingCount || 0
      const listings = normalizeListings(shopRes.data.listings || [])

      const amount = expandRes.data.expansionAmount || 1
      const cost = typeof expandRes.data.expansionCost === "number" ? expandRes.data.expansionCost : 300

      return {
        shop,
        listings,
        listingCount,
        expansion: {
          currentSlots: expandRes.data.currentSlots,
          maxSlots: expandRes.data.maxSlots,
          canExpand: expandRes.data.canExpand,
          cost,
          amount,
        },
      }
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 15000,
    }
  )

  return {
    data: swr.data ?? null,
    loading: user ? swr.isLoading : false,
    error: swr.error as Error | undefined,
    mutate: swr.mutate,
  }
}
