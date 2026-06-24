"use client"

import { useCallback } from "react"
import useSWR from "swr"

import { useAuth } from "@/contexts/auth-context"
import { fetchJson, HttpError } from "@/lib/fetch-json"

export interface UserOrderItem {
  id: string
  product_id?: string
  quantity: number
  price: number
  products?: {
    id?: string
    name?: string
    image_url?: string | null
    images?: string[] | null
    category?: string | null
    price?: number | null
  } | null
}

export interface UserOrder {
  id: string
  order_number?: string | null
  status?: string | null
  payment_status?: string | null
  total?: number | string | null
  total_amount?: number | string | null
  created_at?: string | null
  updated_at?: string | null
  order_items?: UserOrderItem[]
}

interface UserOrdersResponse {
  orders: {
    total: number
    completed: number
    pending: number
    list: UserOrder[]
  }
}

export function useUserOrders() {
  const { user, getToken } = useAuth()

  const swr = useSWR<UserOrdersResponse>(
    user ? ["user-orders", user.id] : null,
    async () => {
      const token = await getToken()
      if (!token) {
        throw new HttpError("Unauthorized", 401)
      }

      return fetchJson<UserOrdersResponse>("/api/user/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeoutMs: 15000,
        retries: 1,
      })
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 15000,
    },
  )

  const refresh = useCallback(async () => {
    await swr.mutate()
  }, [swr])

  return {
    ordersData: swr.data?.orders,
    loading: swr.isLoading,
    error: swr.error as Error | undefined,
    refresh,
  }
}
