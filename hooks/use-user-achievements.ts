"use client"

import useSWR from "swr"
import { useAuth } from "@/contexts/auth-context"
import { fetchJson } from "@/lib/fetch-json"

export type AchievementsData = {
  user_id: string | null
  completed_courses: number
  in_progress_courses: number
  learning_days: number
  total_likes: number
  total_comments: number
  total_engagements: number
  first_learning_date?: string | null
  last_learning_date?: string | null
}

export function useUserAchievements() {
  const { user, getToken } = useAuth()

  const key = user ? ["user-achievements", user.id] : null

  const swr = useSWR<AchievementsData | null>(
    key,
    async () => {
      const token = await getToken()
      if (!token) return null

      return fetchJson<AchievementsData>("/api/user/achievements", {
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
      dedupingInterval: 30000,
    }
  )

  return {
    data: swr.data ?? null,
    loading: user ? swr.isLoading : false,
    error: swr.error as Error | undefined,
    mutate: swr.mutate,
  }
}
