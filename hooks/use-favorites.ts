"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

interface Product {
  id: string
  name: string
  price: number
  images: string[]  // API返回的是images数组，而不是单个image_url
  category: string
}

interface FavoriteItem {
  id: string
  product_id: string
  created_at: string
  products: Product  // API返回的是products字段
}

interface FavoritesData {
  total: number
  list: FavoriteItem[]
}

interface UseFavoritesReturn {
  favorites: FavoriteItem[]
  favoriteProducts: Product[]  // 添加favoriteProducts属性以兼容收藏页面
  loading: boolean
  error: string | null
  addToFavorites: (productId: string) => Promise<boolean>
  removeFromFavorites: (productId: string) => Promise<boolean>
  isFavorite: (productId: string) => boolean
  refreshFavorites: () => Promise<void>
  fetchFavorites: () => Promise<void>  // 添加fetchFavorites方法以供收藏页面调用
}

export function useFavorites(): UseFavoritesReturn {
  const { user } = useAuth()
  const { toast } = useToast()
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 检查用户是否登录
  const isLoggedIn = !!user

  // 获取收藏列表
  const fetchFavorites = useCallback(async () => {
    if (!isLoggedIn) {
      setFavorites([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/user/favorites', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '获取收藏列表失败')
      }

      // 处理新的API响应格式
      if (data.favorites) {
        setFavorites(data.favorites)
      } else {
        // 兼容旧格式
        setFavorites(data)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取收藏列表失败'
      setError(errorMessage)
      console.error('获取收藏列表错误:', err)
    } finally {
      setLoading(false)
    }
  }, [isLoggedIn])

  // 添加到收藏
  const addToFavorites = useCallback(async (productId: string): Promise<boolean> => {
    if (!isLoggedIn) {
      toast({
        title: "请先登录",
        description: "登录后可以收藏喜欢的商品",
        variant: "destructive",
      })
      return false
    }

    try {
      const response = await fetch('/api/user/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.error?.includes('已在收藏夹中')) {
          toast({
            title: "已在收藏夹中",
            description: "这个商品已经在您的收藏夹里了",
            variant: "default",
          })
        } else {
          toast({
            title: "添加失败",
            description: data.error || "添加到收藏夹失败",
            variant: "destructive",
          })
        }
        return false
      }

      // API返回格式: { favorite: data }
      toast({
        title: "收藏成功",
        description: "商品已添加到收藏夹",
        variant: "default",
      })
      // 使用API返回的数据更新本地状态
      if (data.favorite) {
        setFavorites(prev => [...prev, data.favorite])
      }
      
      // 如果API返回了statsUpdateRequired标记，触发统计数据更新事件
      if (data.statsUpdateRequired) {
        window.dispatchEvent(new CustomEvent('statsUpdateRequired'))
      }
      
      return true
    } catch (err) {
      console.error('添加到收藏错误:', err)
      toast({
        title: "添加失败",
        description: "添加到收藏夹时出现错误",
        variant: "destructive",
      })
      return false
    }
  }, [isLoggedIn, toast])

  // 从收藏中移除
  const removeFromFavorites = useCallback(async (productId: string): Promise<boolean> => {
    if (!isLoggedIn) {
      return false
    }

    try {
      const response = await fetch('/api/user/favorites', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "移除失败",
          description: data.error || "从收藏夹移除失败",
          variant: "destructive",
        })
        return false
      }

      // API返回格式: { success: true }
      toast({
        title: "已移除",
        description: "商品已从收藏夹移除",
        variant: "default",
      })
      // 使用本地状态更新，避免额外的API请求
      setFavorites(prev => prev.filter(fav => fav.product_id !== productId))
      
      // 如果API返回了statsUpdateRequired标记，触发统计数据更新事件
      if (data.statsUpdateRequired) {
        window.dispatchEvent(new CustomEvent('statsUpdateRequired'))
      }
      
      return true
    } catch (err) {
      console.error('从收藏移除错误:', err)
      toast({
        title: "移除失败",
        description: "从收藏夹移除时出现错误",
        variant: "destructive",
      })
      return false
    }
  }, [isLoggedIn, toast])

  // 检查是否已收藏
  const isFavorite = useCallback((productId: string): boolean => {
    return favorites.some(favorite => favorite.product_id === productId)
  }, [favorites])

  // 刷新收藏列表
  const refreshFavorites = useCallback(async () => {
    await fetchFavorites()
  }, [fetchFavorites])

  // 初始加载
  useEffect(() => {
    let isMounted = true
    
    const fetchData = async () => {
      if (!isMounted) return
      await fetchFavorites()
    }
    
    fetchData()
    
    return () => {
      isMounted = false
    }
  }, [fetchFavorites])

  // 从favorites中提取products信息，转换为favoriteProducts
  const favoriteProducts = favorites.map(fav => {
    // 确保products数据存在，如果不存在则使用默认值
    const product = fav.products || {
      id: fav.product_id,
      name: '未知商品',
      price: 0,
      images: [],
      category: 'unknown',
      description: '',
      in_stock: true
    };
    
    return {
      id: product.id,
      name: product.name,
      price: product.price,
      images: product.images,
      category: product.category,
      image_url: product.images?.[0] || '/placeholder.svg',
      description: product.description || '',
      in_stock: product.in_stock !== undefined ? product.in_stock : true,
      created_at: fav.created_at,
      updated_at: fav.created_at,
    };
  });

  return {
    favorites,
    favoriteProducts,
    loading,
    error,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    refreshFavorites,
    fetchFavorites,
  }
}