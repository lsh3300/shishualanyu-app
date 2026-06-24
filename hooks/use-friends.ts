"use client"

import { useCallback, useEffect, useState } from "react"

import { useAuth } from "@/contexts/auth-context"
import { fetchJson, HttpError } from "@/lib/fetch-json"
import type { FriendAction } from "@/lib/friends"

export type FriendRelationStatus = "pending" | "accepted" | "rejected"

export type FriendCard = {
  id: string
  friendshipId: string
  fullName: string
  username: string
  avatarUrl: string | null
  createdAt: string
  status: FriendRelationStatus
}

export type FriendLookupResult = {
  candidate: {
    id: string
    fullName: string
    username: string
    avatarUrl: string | null
  } | null
  relation: {
    state: "none" | "self" | "incoming" | "outgoing" | "accepted" | "rejected"
    friendshipId?: string
    status?: FriendRelationStatus
  }
}

type FriendsPayload = {
  friends: FriendCard[]
  incomingRequests: FriendCard[]
  outgoingRequests: FriendCard[]
}

type UseFriendsReturn = FriendsPayload & {
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  lookupCandidate: (value: string) => Promise<FriendLookupResult>
  sendRequest: (targetUserId: string) => Promise<{ message: string; friendshipId?: string }>
  updateFriendship: (friendshipId: string, action: FriendAction) => Promise<{ message: string }>
}

const EMPTY_STATE: FriendsPayload = {
  friends: [],
  incomingRequests: [],
  outgoingRequests: [],
}

export function useFriends(): UseFriendsReturn {
  const { user, getToken } = useAuth()
  const [state, setState] = useState<FriendsPayload>(EMPTY_STATE)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const runAuthedFetch = useCallback(
    async <T,>(url: string, init?: RequestInit) => {
      const token = await getToken()
      if (!token) {
        throw new HttpError("Unauthorized", 401)
      }

      return fetchJson<T>(url, {
        ...init,
        headers: {
          ...(init?.headers || {}),
          Authorization: `Bearer ${token}`,
        },
      })
    },
    [getToken],
  )

  const refresh = useCallback(async () => {
    if (!user) {
      setState(EMPTY_STATE)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await runAuthedFetch<FriendsPayload>("/api/friends")
      setState({
        friends: data.friends || [],
        incomingRequests: data.incomingRequests || [],
        outgoingRequests: data.outgoingRequests || [],
      })
    } catch (err) {
      console.error("Failed to load friends:", err)
      setError("加载好友数据失败")
    } finally {
      setLoading(false)
    }
  }, [runAuthedFetch, user])

  useEffect(() => {
    refresh()
  }, [refresh])

  const lookupCandidate = useCallback(
    async (value: string) => {
      return runAuthedFetch<FriendLookupResult>(`/api/friends?lookup=${encodeURIComponent(value)}`)
    },
    [runAuthedFetch],
  )

  const sendRequest = useCallback(
    async (targetUserId: string) => {
      const result = await runAuthedFetch<{ message: string; friendshipId?: string }>("/api/friends", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetUserId }),
      })
      await refresh()
      return result
    },
    [refresh, runAuthedFetch],
  )

  const updateFriendship = useCallback(
    async (friendshipId: string, action: FriendAction) => {
      const result = await runAuthedFetch<{ message: string }>("/api/friends", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ friendshipId, action }),
      })
      await refresh()
      return result
    },
    [refresh, runAuthedFetch],
  )

  return {
    ...state,
    loading,
    error,
    refresh,
    lookupCandidate,
    sendRequest,
    updateFriendship,
  }
}
