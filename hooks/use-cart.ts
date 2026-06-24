"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"
import { fetchJson, HttpError } from "@/lib/fetch-json"

interface CartItem {
  id: string
  product_id: string
  quantity: number
  color: string | null
  size: string | null
  created_at: string
  updated_at: string
  selected?: boolean
  products: {
    id: string
    name: string
    price: number
    description: string
    image_url: string
    category: string
    in_stock: boolean
    images?: string[]
  }
}

interface CartData {
  totalItems: number
  totalPrice: number
  items: CartItem[]
}

type CartResponseItem = {
  quantity?: number
  selected?: boolean
  products?: {
    price?: number
  }
} & Record<string, unknown>

interface CartActionResult {
  success: boolean
  cart?: CartData
  addedItemId?: string
  error?: string
}

export interface AddToCartItem {
  product_id: string
  quantity: number
  color?: string
  size?: string
}

export function useCart() {
  const { user, getToken } = useAuth()
  const router = useRouter()

  const getAuthRedirectUrl = useCallback(() => {
    const currentPath =
      typeof window !== "undefined"
        ? `${window.location.pathname}${window.location.search}`
        : "/"
    return `/auth?view=login&redirectTo=${encodeURIComponent(currentPath)}`
  }, [])

  const normalizeCartResponse = useCallback(
    (data: Partial<CartData & { items: CartResponseItem[] }>): CartData => {
      const items = (data?.items || []).map((item) => ({
        ...item,
        selected: typeof item.selected === "boolean" ? item.selected : true,
      }))

      let totalItems = data?.totalItems ?? 0
      let totalPrice = data?.totalPrice ?? 0

      if (!data?.totalItems || !data?.totalPrice) {
        totalItems = items.reduce((sum, item) => sum + (item.quantity || 0), 0)
        totalPrice = items.reduce((sum, item) => {
          const price = item.products?.price || 0
          return sum + price * (item.quantity || 0)
        }, 0)
      }

      return {
        totalItems,
        totalPrice,
        items,
      }
    },
    [],
  )

  const {
    data: cartData,
    isLoading: loading,
    error: swrError,
    mutate,
  } = useSWR<CartData>(
    user ? ["cart", user.id] : null,
    async () => {
      const token = await getToken()
      if (!token) {
        return { totalItems: 0, totalPrice: 0, items: [] }
      }

      try {
        const data = await fetchJson<Partial<CartData & { items: CartResponseItem[] }>>("/api/cart", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeoutMs: 12000,
          retries: 1,
        })
        return normalizeCartResponse(data)
      } catch (err) {
        if (err instanceof HttpError && err.status === 401) {
          router.push(getAuthRedirectUrl())
          return { totalItems: 0, totalPrice: 0, items: [] }
        }
        throw err
      }
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 15000,
    },
  )

  const error =
    swrError instanceof Error ? swrError.message : swrError ? String(swrError) : null

  const addToCart = useCallback(
    async (item: AddToCartItem): Promise<CartActionResult> => {
      if (!user) {
        toast({
          title: "请先登录",
          description: "需要登录后才能使用购物车功能",
          variant: "destructive",
        })
        router.push(getAuthRedirectUrl())
        return { success: false, error: "未登录" }
      }

      try {
        const token = await getToken()
        if (!token) {
          throw new Error("未能获取登录凭证，请重新登录")
        }

        const response = await fetch("/api/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(item),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "添加到购物车失败")
        }

        const data = await response.json()
        const normalized = normalizeCartResponse(data)
        await mutate(normalized, { revalidate: false })

        const successToast = toast({
          title: "成功",
          description: "商品已加入购物车",
          duration: 1000,
        })

        setTimeout(() => {
          successToast.dismiss()
        }, 1000)

        return {
          success: true,
          cart: normalized,
          addedItemId: data?.lastAddedItemId,
        }
      } catch (err) {
        console.error("添加到购物车错误:", err)
        toast({
          title: "添加失败",
          description: err instanceof Error ? err.message : "添加到购物车失败",
          variant: "destructive",
        })
        return {
          success: false,
          error: err instanceof Error ? err.message : "添加到购物车失败",
        }
      }
    },
    [user, router, getToken, normalizeCartResponse, getAuthRedirectUrl, mutate],
  )

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      if (!user) return false

      try {
        const token = await getToken()
        if (!token) throw new Error("未登录")

        const response = await fetch("/api/cart", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id: itemId, quantity }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "更新商品数量失败")
        }

        const data = await response.json()
        const normalized = normalizeCartResponse(data)
        await mutate(normalized, { revalidate: false })
        return true
      } catch (err) {
        console.error("更新商品数量错误:", err)
        toast({
          title: "更新失败",
          description: err instanceof Error ? err.message : "更新商品数量失败",
          variant: "destructive",
        })
        return false
      }
    },
    [user, getToken, normalizeCartResponse, mutate],
  )

  const removeFromCart = useCallback(
    async (itemId: string) => {
      if (!user) return false

      try {
        const token = await getToken()
        if (!token) throw new Error("未登录")

        const response = await fetch("/api/cart", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id: itemId }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "删除商品失败")
        }

        const data = await response.json()
        const normalized = normalizeCartResponse(data)
        await mutate(normalized, { revalidate: false })

        toast({
          title: "已删除",
          description: "商品已从购物车中移除",
        })

        return true
      } catch (err) {
        console.error("删除商品错误:", err)
        toast({
          title: "删除失败",
          description: err instanceof Error ? err.message : "删除商品失败",
          variant: "destructive",
        })
        return false
      }
    },
    [user, getToken, normalizeCartResponse, mutate],
  )

  const toggleSelection = useCallback(
    (itemId: string, selected: boolean) => {
      mutate(
        (prev) => {
          if (!prev) return prev

          const updatedItems = prev.items.map((item) =>
            item.id === itemId ? { ...item, selected } : item,
          )

          return {
            ...prev,
            items: updatedItems,
          }
        },
        { revalidate: false },
      )
    },
    [mutate],
  )

  const toggleSelectAll = useCallback(
    (selected: boolean) => {
      mutate(
        (prev) => {
          if (!prev) return prev

          return {
            ...prev,
            items: prev.items.map((item) => ({ ...item, selected })),
          }
        },
        { revalidate: false },
      )
    },
    [mutate],
  )

  const selectExclusiveCartItems = useCallback(
    (itemIds: string[]) => {
      mutate(
        (prev) => {
          if (!prev) return prev
          const idSet = new Set(itemIds)

          return {
            ...prev,
            items: prev.items.map((item) => ({
              ...item,
              selected: idSet.size === 0 ? false : idSet.has(item.id),
            })),
          }
        },
        { revalidate: false },
      )
    },
    [mutate],
  )

  const getSelectedItems = useCallback(() => {
    if (!cartData) return []
    return cartData.items.filter((item) => item.selected !== false)
  }, [cartData])

  const getTotalPrice = useCallback(() => {
    if (!cartData) return 0
    return cartData.items
      .filter((item) => item.selected !== false)
      .reduce((sum, item) => sum + (item.products?.price || 0) * item.quantity, 0)
  }, [cartData])

  const getTotalSavings = useCallback(() => {
    if (!cartData) return 0
    return cartData.items
      .filter((item) => item.selected !== false)
      .reduce((sum) => sum, 0)
  }, [cartData])

  return {
    cartData,
    loading,
    error,
    addToCart,
    updateQuantity,
    removeFromCart,
    toggleSelection,
    toggleSelectAll,
    selectExclusiveCartItems,
    getSelectedItems,
    getTotalPrice,
    getTotalSavings,
    refetch: () => mutate(),
  }
}
