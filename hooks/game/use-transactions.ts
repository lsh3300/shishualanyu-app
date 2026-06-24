"use client"

import useSWR from "swr"
import { useAuth } from "@/contexts/auth-context"
import { fetchJson } from "@/lib/fetch-json"
import type { ClothLayer } from "@/types/game.types"

export type Transaction = {
  id: string
  cloth_id: string
  seller_id: string
  buyer_id: string | null
  price: number
  actual_price: number
  transaction_type: "player_buy" | "system_buy"
  created_at: string
  cloth?: {
    id: string
    layers?: ClothLayer[]
    score_data?: {
      grade: string
      total_score: number
    } | null
  } | null
  buyer_name?: string
} & Record<string, unknown>

type TransactionsResponse = {
  success: boolean
  data: Transaction[]
}

export function useTransactions(params: {
  type: "sell" | "buy"
  limit?: number
  enabled?: boolean
}) {
  const { type, limit = 50, enabled = true } = params
  const { user, getToken } = useAuth()

  const key = enabled && user ? ["transactions", user.id, type, limit] : null

  const swr = useSWR<Transaction[]>(
    key,
    async () => {
      const token = await getToken()
      if (!token) return []

      const url = `/api/transactions?type=${encodeURIComponent(type)}&limit=${encodeURIComponent(
        String(limit)
      )}`

      const res = await fetchJson<TransactionsResponse>(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeoutMs: 12000,
        retries: 1,
      })

      return res.data || []
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 15000,
    }
  )

  return {
    transactions: swr.data ?? [],
    loading: enabled && !!user ? swr.isLoading : false,
    error: swr.error as Error | undefined,
    mutate: swr.mutate,
  }
}
