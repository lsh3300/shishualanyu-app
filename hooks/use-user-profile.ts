"use client"

import useSWR from "swr"
import { useAuth } from "@/contexts/auth-context"
import { fetchJson } from "@/lib/fetch-json"

export type UserProfile = {
  avatar_url?: string | null
  full_name?: string | null
}

export function useUserProfile(refreshKey?: number) {
  const { user, getToken } = useAuth()

  const key = user ? ["user-profile", user.id, refreshKey] : null

  const swr = useSWR<UserProfile | null>(
    key,
    async () => {
      const token = await getToken()
      if (!token) return null

      return fetchJson<UserProfile>("/api/user/profile", {
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
    profile: swr.data ?? null,
    loading: swr.isLoading,
    error: swr.error as Error | undefined,
    mutate: swr.mutate,
  }
}
