"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface CartItem {
  id: string
  quantity: number
  color: string | null
  size: string | null
  created_at: string
  updated_at: string
  products: {
    id: string
    name: string
    price: number
    description: string
    image_url: string
    category: string
    in_stock: boolean
  }
}

interface CartData {
  totalItems: number
  totalPrice: number
  items: CartItem[]
}

export interface AddToCartItem {
  product_id: string
  quantity: number
  color?: string
  size?: string
}

export function useCart() {
  const [cartData, setCartData] = useState<CartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const router = useRouter()

  // 获取购物车数据
  const fetchCart = useCallback(async () => {
    if (!user) {
      setCartData({ totalItems: 0, totalPrice: 0, items: [] })
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/cart')
      
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
        // API现在直接返回购物车数据，包含items、totalItems和totalPrice
        setCartData(data)
      }
    } catch (err) {
      console.error('获取购物车数据错误:', err)
      setError(err instanceof Error ? err.message : '获取购物车数据失败')
      toast({
        title: "错误",
        description: err instanceof Error ? err.message : '获取购物车数据失败',
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [user, router])

  // 添加商品到购物车
  const addToCart = useCallback(async (item: AddToCartItem) => {
    if (!user) {
      toast({
        title: "请先登录",
        description: "需要登录才能使用购物车功能",
        variant: "destructive",
      })
      router.push('/auth')
      return false
    }

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '添加到购物车失败')
      }

      const data = await response.json()
      
      // 更新本地购物车数据
        setCartData(data)

      toast({
        title: "成功",
        description: "商品已添加到购物车",
      })
      
      return true
    } catch (err) {
      console.error('添加到购物车错误:', err)
      toast({
        title: "添加失败",
        description: err instanceof Error ? err.message : '添加到购物车失败',
        variant: "destructive",
      })
      return false
    }
  }, [user, router])

  // 更新商品数量
  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (!user) return false

    try {
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: itemId, quantity }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '更新商品数量失败')
      }

      // 使用API返回的数据更新本地状态
      const data = await response.json()
      // API现在直接返回购物车数据，包含items、totalItems和totalPrice
      setCartData(data)
      
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
  }, [user])

  // 删除商品
  const removeFromCart = useCallback(async (itemId: string) => {
    if (!user) return false

    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: itemId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '删除商品失败')
      }

      // 使用API返回的数据更新本地状态
      const data = await response.json()
      // API现在直接返回购物车数据，包含items、totalItems和totalPrice
      setCartData(data)

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
  }, [user])

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

  // 计算选中商品的价格
  const getSelectedItems = useCallback(() => {
    if (!cartData) return []
    return cartData.items.filter(item => item.selected)
  }, [cartData])

  const getTotalPrice = useCallback(() => {
    if (!cartData) return 0
    return cartData.items
      .filter(item => item.selected)
      .reduce((sum, item) => sum + item.products.price * item.quantity, 0)
  }, [cartData])

  const getTotalSavings = useCallback(() => {
    if (!cartData) return 0
    return cartData.items
      .filter(item => item.selected)
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
    getSelectedItems,
    getTotalPrice,
    getTotalSavings,
    refetch: fetchCart
  }
}