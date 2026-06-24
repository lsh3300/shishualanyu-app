"use client"

import useSWR from "swr"
import { useAuth } from "@/contexts/auth-context"
import { fetchJson } from "@/lib/fetch-json"
import type { ShopItem } from "@/types/items.types"

export type ItemShopData = {
  items: ShopItem[]
  userItems: Record<string, number>
  activeItems: Record<string, boolean>
}

type ItemsResponse = {
  success: boolean
  data: ItemShopData
}

export function useItemShopData(enabled: boolean) {
  const { user, getToken } = useAuth()

  const key = enabled && user ? ["item-shop", user.id] : null

  const swr = useSWR<ItemShopData | null>(
    key,
    async () => {
      const token = await getToken()
      if (!token) return null

      const res = await fetchJson<ItemsResponse>("/api/items", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeoutMs: 12000,
        retries: 1,
      })

      return res.data
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 15000,
    }
  )

  return {
    data: swr.data ?? null,
    loading: enabled && !!user ? swr.isLoading : false,
    error: swr.error as Error | undefined,
    mutate: swr.mutate,
  }
}
