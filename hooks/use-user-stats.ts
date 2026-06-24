"use client"

import useSWR from "swr"
import { useAuth } from "@/contexts/auth-context"
import { fetchJson } from "@/lib/fetch-json"

export type UserStats = {
  orders?: number
  courses?: number
  favorites?: number
  assignments?: number
  learningDays?: number
  completedCourses?: number
}

export type UserStatsApiResponse = {
  stats: UserStats
}

export function useUserStats(refreshKey?: number) {
  const { user, getToken } = useAuth()

  const key = user ? ["user-stats", user.id, refreshKey] : null

  const swr = useSWR<UserStatsApiResponse | null>(
    key,
    async () => {
      const token = await getToken()
      if (!token) return null

      return fetchJson<UserStatsApiResponse>("/api/user/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeoutMs: 10000,
        retries: 1,
      })
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 15000,
    }
  )

  return {
    data: swr.data ?? null,
    loading: swr.isLoading,
    error: swr.error as Error | undefined,
    mutate: swr.mutate,
  }
}
