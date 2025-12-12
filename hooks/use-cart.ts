"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

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

// 请求去重：防止多个组件同时调用
let pendingRequest: Promise<any> | null = null
let lastFetchTime = 0
let cachedCartData: any = null
const FETCH_COOLDOWN = 5000 // 5秒冷却时间（增加以减少请求）
const CACHE_DURATION = 30000 // 30秒缓存有效期

export function useCart() {
  const [cartData, setCartData] = useState<CartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, getToken } = useAuth()
  const router = useRouter()

  const normalizeCartResponse = useCallback((data: Partial<CartData & { items: any[] }>): CartData => {
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
  }, [])

  // 获取购物车数据 - 优化：添加去重、冷却和缓存
  const fetchCart = useCallback(async (forceRefresh = false) => {
    if (!user) {
      setCartData({ totalItems: 0, totalPrice: 0, items: [] })
      setLoading(false)
      return
    }

    const now = Date.now()
    
    // 优化：如果有缓存且未过期，直接使用缓存
    if (!forceRefresh && cachedCartData && now - lastFetchTime < CACHE_DURATION) {
      setCartData(cachedCartData)
      setLoading(false)
      return
    }

    // 防抖：如果距离上次请求不到冷却时间，直接返回
    if (!forceRefresh && now - lastFetchTime < FETCH_COOLDOWN) {
      return
    }

    // 如果有正在进行的请求，等待它完成
    if (pendingRequest) {
      try {
        await pendingRequest
      } catch (error) {
        // 忽略错误，因为错误已经在原始请求中处理
      }
      return
    }

    try {
      const token = await getToken()
      if (!token) {
        setCartData({ totalItems: 0, totalPrice: 0, items: [] })
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)
      lastFetchTime = now
      
      // 创建请求promise
      pendingRequest = fetch('/api/cart', {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        next: { revalidate: 30 }, // 30秒缓存
      })
      
      const response = await pendingRequest
      
      if (!response.ok) {
        if (response.status === 401) {
          // 用户未登录，重定向到登录页
          router.push('/auth')
          return
        }
        const errorData = await response.json()
        throw new Error(errorData.error || '获取购物车数据失败')
      }
      
      const data = await response.json()
      if (data) {
        const normalized = normalizeCartResponse(data)
        setCartData(normalized)
        cachedCartData = normalized // 更新缓存
      }
    } catch (err) {
      console.error('获取购物车数据错误:', err)
      setError(err instanceof Error ? err.message : '获取购物车数据失败')
      // 优化：减少错误提示的频率，避免打扰用户
    } finally {
      setLoading(false)
      pendingRequest = null
    }
  }, [user, router, getToken, normalizeCartResponse])

  // 添加商品到购物车
  const addToCart = useCallback(async (item: AddToCartItem): Promise<CartActionResult> => {
    if (!user) {
      toast({
        title: "请先登录",
        description: "需要登录才能使用购物车功能",
        variant: "destructive",
      })
      router.push('/auth')
      return { success: false, error: '未登录' }
    }

    try {
      const token = await getToken()
      if (!token) {
        throw new Error('未能获取登录凭证，请重新登录')
      }

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(item),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '添加到购物车失败')
      }

      const data = await response.json()
      const normalized = normalizeCartResponse(data)
      
      // 更新本地购物车数据
      setCartData(normalized)

      toast({
        title: "成功",
        description: "商品已添加到购物车",
      })
      
      return {
        success: true,
        cart: normalized,
        addedItemId: data?.lastAddedItemId,
      }
    } catch (err) {
      console.error('添加到购物车错误:', err)
      toast({
        title: "添加失败",
        description: err instanceof Error ? err.message : '添加到购物车失败',
        variant: "destructive",
      })
      return { success: false, error: err instanceof Error ? err.message : '添加购物车失败' }
    }
  }, [user, router, getToken, normalizeCartResponse])

  // 更新商品数量
  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (!user) return false

    try {
      const token = await getToken()
      if (!token) throw new Error('未登录')

      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: itemId, quantity }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '更新商品数量失败')
      }

      // 使用API返回的数据更新本地状态
      const data = await response.json()
      const normalized = normalizeCartResponse(data)
      setCartData(normalized)
      
      return true
    } catch (err) {
      console.error('更新商品数量错误:', err)
      toast({
        title: "更新失败",
        description: err instanceof Error ? err.message : '更新商品数量失败',
        variant: "destructive",
      })
      return false
    }
  }, [user, getToken, normalizeCartResponse])

  // 删除商品
  const removeFromCart = useCallback(async (itemId: string) => {
    if (!user) return false

    try {
      const token = await getToken()
      if (!token) throw new Error('未登录')

      const response = await fetch('/api/cart', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: itemId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '删除商品失败')
      }

      // 使用API返回的数据更新本地状态
      const data = await response.json()
      const normalized = normalizeCartResponse(data)
      setCartData(normalized)

      toast({
        title: "已删除",
        description: "商品已从购物车中移除",
      })
      
      return true
    } catch (err) {
      console.error('删除商品错误:', err)
      toast({
        title: "删除失败",
        description: err instanceof Error ? err.message : '删除商品失败',
        variant: "destructive",
      })
      return false
    }
  }, [user, getToken, normalizeCartResponse])

  // 切换商品选择状态（用于结算）
  const toggleSelection = useCallback((itemId: string, selected: boolean) => {
    setCartData(prev => {
      if (!prev) return null
      
      const updatedItems = prev.items.map(item => 
        item.id === itemId ? { ...item, selected } : item
      )
      
      return {
        ...prev,
        items: updatedItems
      }
    })
  }, [])

  // 全选/取消全选
  const toggleSelectAll = useCallback((selected: boolean) => {
    setCartData(prev => {
      if (!prev) return null
      
      return {
        ...prev,
        items: prev.items.map(item => ({ ...item, selected }))
      }
    })
  }, [])

  const selectExclusiveCartItems = useCallback((itemIds: string[]) => {
    setCartData(prev => {
      if (!prev) return prev
      const idSet = new Set(itemIds)
      return {
        ...prev,
        items: prev.items.map(item => ({
          ...item,
          selected: idSet.size === 0 ? false : idSet.has(item.id),
        })),
      }
    })
  }, [])

  // 计算选中商品的价格
  const getSelectedItems = useCallback(() => {
    if (!cartData) return []
    return cartData.items.filter(item => item.selected !== false)
  }, [cartData])

  const getTotalPrice = useCallback(() => {
    if (!cartData) return 0
    return cartData.items
      .filter(item => item.selected !== false)
      .reduce((sum, item) => sum + (item.products?.price || 0) * item.quantity, 0)
  }, [cartData])

  const getTotalSavings = useCallback(() => {
    if (!cartData) return 0
    return cartData.items
      .filter(item => item.selected !== false)
      .reduce((sum, item) => {
        // 这里可以根据需要计算节省金额，例如与原价比较
        return sum
      }, 0)
  }, [cartData])

  // 初始化和依赖变化时获取购物车数据
  useEffect(() => {
    let isMounted = true
    
    const fetchData = async () => {
      if (!isMounted) return
      await fetchCart()
    }
    
    fetchData()
    
    return () => {
      isMounted = false
    }
  }, [fetchCart])

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
    refetch: fetchCart
  }
}