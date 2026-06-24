"use client"

import useSWR from "swr"
import { useAuth } from "@/contexts/auth-context"
import { fetchJson } from "@/lib/fetch-json"
import type { ClothLayer } from "@/types/game.types"

export type InventoryCapacity = {
  current: number
  max: number
  recentCount: number
  maxRecent: number
}

export type InventoryItem = {
  id: string
  cloth_id: string
  slot_type: "recent" | "inventory"
  cloth: {
    id: string
    cloth_data: {
      layers: ClothLayer[]
      preview_image?: string
    }
    created_at: string
    status?: string
    score_data?: {
      total_score: number
      grade: string
      dimensions: {
        color_score: number
        pattern_score: number
        creativity_score: number
        technique_score: number
      }
    }
  }
} & Record<string, unknown>

function normalizeScoreData(input: unknown): InventoryItem["cloth"]["score_data"] | undefined {
  if (!input || typeof input !== "object") return undefined

  const obj = input as {
    total_score?: number
    grade?: string
    dimensions?: {
      color_score?: number
      pattern_score?: number
      creativity_score?: number
      technique_score?: number
    }
  }

  if (typeof obj.total_score !== "number" || typeof obj.grade !== "string") return undefined

  const d = obj.dimensions
  return {
    total_score: obj.total_score,
    grade: obj.grade,
    dimensions: {
      color_score: typeof d?.color_score === "number" ? d.color_score : 0,
      pattern_score: typeof d?.pattern_score === "number" ? d.pattern_score : 0,
      creativity_score: typeof d?.creativity_score === "number" ? d.creativity_score : 0,
      technique_score: typeof d?.technique_score === "number" ? d.technique_score : 0,
    },
  }
}

function normalizeItem(item: InventoryItem): InventoryItem {
  const clothAny = item.cloth as unknown as {
    score_data?: unknown
    cloth_data?: {
      layers?: unknown
    }
  }

  return {
    ...item,
    cloth: {
      ...item.cloth,
      score_data: normalizeScoreData(clothAny.score_data),
      cloth_data: {
        ...item.cloth.cloth_data,
        layers: Array.isArray(clothAny.cloth_data?.layers) ? (clothAny.cloth_data?.layers as ClothLayer[]) : [],
      },
    },
  }
}

export type InventoryData = {
  recent: InventoryItem[]
  inventory: InventoryItem[]
  capacity: InventoryCapacity
}

type InventoryResponse = {
  success: boolean
  data: InventoryData
}

export function useInventoryData() {
  const { user, getToken } = useAuth()

  const key = user ? ["inventory", user.id] : null

  const swr = useSWR<InventoryData | null>(
    key,
    async () => {
      const token = await getToken()
      if (!token) return null

      const res = await fetchJson<InventoryResponse>("/api/inventory", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeoutMs: 12000,
        retries: 1,
      })

      const d = res.data
      return {
        ...d,
        recent: (d.recent ?? []).map(normalizeItem),
        inventory: (d.inventory ?? []).map(normalizeItem),
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
