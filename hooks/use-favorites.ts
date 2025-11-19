"use client"

import { useState, useEffect, useCallback, createContext, useContext, ReactNode, createElement } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { getCourseById, getProductById } from "@/data/models"
import { normalizeCourseId, denormalizeCourseId } from "@/lib/course-id"

interface Product {
  id: string
  name: string
  price: number
  images?: string[]
  image_url?: string | null
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

interface Course {
  id: string
  title: string
  description: string | null
  instructor: string
  duration: number
  price: number
  image_url: string | null
  category: string
  backendId?: string
}

interface FavoriteCourseItem {
  id: string
  course_id: string
  created_at: string
  courses: Course
  item_type: 'course'
}

interface UseFavoritesReturn {
  favorites: FavoriteItem[]
  favoriteProducts: Product[]  // 添加favoriteProducts属性以兼容收藏页面
  favoriteCourses: Course[]  // 添加favoriteCourses属性
  loading: boolean
  error: string | null
  addToFavorites: (productId: string) => Promise<boolean>
  removeFromFavorites: (productId: string) => Promise<boolean>
  addCourseToFavorites: (courseId: string) => Promise<boolean>
  removeCourseFromFavorites: (courseId: string) => Promise<boolean>
  isFavorite: (productId: string) => boolean
  isCourseFavorite: (courseId: string) => boolean
  refreshFavorites: () => Promise<void>
  fetchFavorites: () => Promise<void>  // 添加fetchFavorites方法以供收藏页面调用
}

function useFavoritesData(): UseFavoritesReturn {
  const { user, getToken } = useAuth()
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

      // 获取访问令牌
      const token = await getToken()
      if (!token) {
        throw new Error('无法获取访问令牌')
      }

      const response = await fetch('/api/user/favorites', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '获取收藏列表失败')
      }

      // 处理新的API响应格式
      const favoritesPayload = Array.isArray(data.favorites)
        ? data.favorites
        : Array.isArray(data.list)
          ? data.list
          : []

      console.log('收到收藏数据:', favoritesPayload.length, '项')
      console.log('收藏数据详情:', JSON.stringify(favoritesPayload.slice(0, 2), null, 2))
      setFavorites(favoritesPayload)

      if (Array.isArray(data.invalidFavorites) && data.invalidFavorites.length) {
        toast({
          title: "检测到失效收藏",
          description: "部分商品已下架，已标记为失效，请手动移除。",
        })
      }
      
      if (data.statsUpdateRequired) {
        window.dispatchEvent(new CustomEvent('statsUpdateRequired'))
      }
      
      console.log('收藏列表已更新:', favoritesPayload.length || 0, '项')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取收藏列表失败'
      setError(errorMessage)
      console.error('获取收藏列表错误:', err)
    } finally {
      setLoading(false)
    }
  }, [isLoggedIn, getToken])

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
      // 获取访问令牌
      const token = await getToken()
      if (!token) {
        toast({
          title: "添加失败",
          description: "无法获取访问令牌",
          variant: "destructive",
        })
        return false
      }

      const response = await fetch('/api/user/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
      
      // 刷新收藏列表以确保数据同步
      await fetchFavorites()
      
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
  }, [isLoggedIn, toast, getToken])

  // 从收藏中移除
  const removeFromFavorites = useCallback(async (productId: string): Promise<boolean> => {
    if (!isLoggedIn) {
      return false
    }

    try {
      // 获取访问令牌
      const token = await getToken()
      if (!token) {
        toast({
          title: "移除失败",
          description: "无法获取访问令牌",
          variant: "destructive",
        })
        return false
      }

      const response = await fetch('/api/user/favorites', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
      
      // 刷新收藏列表以确保数据同步
      await fetchFavorites()
      
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
  }, [isLoggedIn, toast, getToken])

  // 添加课程到收藏
  const addCourseToFavorites = useCallback(async (courseId: string): Promise<boolean> => {
    if (!isLoggedIn) {
      toast({
        title: "请先登录",
        description: "登录后可以收藏喜欢的课程",
        variant: "destructive",
      })
      return false
    }

    try {
      // 获取访问令牌
      const token = await getToken()
      if (!token) {
        toast({
          title: "添加失败",
          description: "无法获取访问令牌",
          variant: "destructive",
        })
        return false
      }

      const normalizedCourseId = normalizeCourseId(courseId)

      if (!normalizedCourseId) {
        toast({
          title: "添加失败",
          description: "课程ID无效",
          variant: "destructive",
        })
        return false
      }

      const response = await fetch('/api/user/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ courseId: normalizedCourseId, itemType: 'course' }),
      })

      let data;
      try {
        data = await response.json()
      } catch (e) {
        console.error('解析响应失败:', e);
        toast({
          title: "添加失败",
          description: "服务器响应格式错误",
          variant: "destructive",
        })
        return false
      }

      if (!response.ok) {
        console.error('API返回错误:', { status: response.status, data });
        if (data.message === '已在收藏夹中' || data.error?.includes('已在收藏夹中')) {
          toast({
            title: "已在收藏夹中",
            description: "这个课程已经在您的收藏夹里了",
            variant: "default",
          })
          // 即使已收藏，也返回true，因为这是正常状态
          return true
        } else if (data.errorType === 'foreign_key_constraint' || data.error?.includes('数据库支持')) {
          // 数据库结构不支持课程收藏
          toast({
            title: "功能暂不可用",
            description: data.error || "课程收藏功能需要数据库支持，请联系管理员",
            variant: "destructive",
          })
          console.error('数据库结构不支持课程收藏:', data.hint);
          return false
        } else {
          toast({
            title: "添加失败",
            description: data.error || data.message || `添加到收藏夹失败 (${response.status})`,
            variant: "destructive",
          })
        }
        return false
      }

      toast({
        title: "收藏成功",
        description: "课程已添加到收藏夹",
        variant: "default",
      })
      
      // 刷新收藏列表以确保数据同步
      await fetchFavorites()
      
      if (data.statsUpdateRequired) {
        window.dispatchEvent(new CustomEvent('statsUpdateRequired'))
      }
      
      return true
    } catch (err) {
      console.error('添加课程到收藏错误:', err)
      toast({
        title: "添加失败",
        description: "添加到收藏夹时出现错误",
        variant: "destructive",
      })
      return false
    }
  }, [isLoggedIn, toast, getToken])

  // 从收藏中移除课程
  const removeCourseFromFavorites = useCallback(async (courseId: string): Promise<boolean> => {
    if (!isLoggedIn) {
      return false
    }

    try {
      // 获取访问令牌
      const token = await getToken()
      if (!token) {
        toast({
          title: "移除失败",
          description: "无法获取访问令牌",
          variant: "destructive",
        })
        return false
      }

      const normalizedCourseId = normalizeCourseId(courseId)

      if (!normalizedCourseId) {
        toast({
          title: "移除失败",
          description: "课程ID无效",
          variant: "destructive",
        })
        return false
      }

      const response = await fetch('/api/user/favorites', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ courseId: normalizedCourseId, itemType: 'course' }),
      })

      let data;
      try {
        data = await response.json()
      } catch (e) {
        console.error('解析响应失败:', e);
        toast({
          title: "移除失败",
          description: "服务器响应格式错误",
          variant: "destructive",
        })
        return false
      }

      if (!response.ok) {
        console.error('API返回错误:', { status: response.status, data });
        toast({
          title: "移除失败",
          description: data.error || data.message || `从收藏夹移除失败 (${response.status})`,
          variant: "destructive",
        })
        return false
      }

      toast({
        title: "已移除",
        description: "课程已从收藏夹移除",
        variant: "default",
      })
      
      // 刷新收藏列表以确保数据同步
      await fetchFavorites()
      
      if (data.statsUpdateRequired) {
        window.dispatchEvent(new CustomEvent('statsUpdateRequired'))
      }
      
      return true
    } catch (err) {
      console.error('从收藏移除课程错误:', err)
      toast({
        title: "移除失败",
        description: "从收藏夹移除时出现错误",
        variant: "destructive",
      })
      return false
    }
  }, [isLoggedIn, toast, getToken])

  // 检查是否已收藏
  const isFavorite = useCallback((productId: string): boolean => {
    return favorites.some(favorite => favorite.product_id === productId && (!(favorite as any).item_type || (favorite as any).item_type === 'product'))
  }, [favorites])

  // 检查课程是否已收藏
  const isCourseFavorite = useCallback((courseId: string): boolean => {
    const normalizedCourseId = normalizeCourseId(courseId)

    if (!normalizedCourseId) {
      return false
    }

    return favorites.some(favorite => {
      const fav = favorite as any
      if (fav.course_id === normalizedCourseId) {
        return true
      }
      if (fav.item_type === 'course' && fav.product_id === normalizedCourseId) {
        return true
      }
      return false
    })
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
  const favoriteProducts = favorites
    .filter(fav => {
      const favAny = fav as any
      const isProduct = !favAny.item_type || favAny.item_type === 'product'
      const hasProductId = favAny.product_id
      return isProduct && hasProductId
    })
    .map(fav => {
      const favAny = fav as any
      const product = favAny.products || null

      if (!product || !product.id) {
        console.warn('收藏商品已下架，需用户手动清理:', fav)
        return null
      }

      return {
        id: product.id,
        name: product.name,
        price: product.price,
        images: product.images || [],
        category: product.category,
        image_url: (product.images && product.images[0]) || product.image_url || product.coverImage || '/placeholder.svg',
        coverImage: product.coverImage || (product.images && product.images[0]) || product.image_url || '/placeholder.svg',
        description: product.description || '',
        created_at: fav.created_at,
        updated_at: fav.created_at,
      };
    })
    .filter((product): product is NonNullable<typeof product> => product !== null);

  // 从favorites中提取courses信息，转换为favoriteCourses
  const favoriteCourses = favorites
    .filter(fav => {
      const favAny = fav as any
      const isCourse = favAny.item_type === 'course'
      const hasCourseId = favAny.course_id || favAny.product_id
      return isCourse && hasCourseId
    })
    .map(fav => {
      const favAny = fav as any
      const rawCourseId: string | undefined = favAny.course_id || favAny.product_id
      const normalizedCourseId = rawCourseId ? normalizeCourseId(rawCourseId) : null
      const denormalizedCourseId = rawCourseId ? denormalizeCourseId(rawCourseId) : ""
      let course = favAny.courses || null

      if (!course && denormalizedCourseId) {
        course = getCourseById(denormalizedCourseId)
      }

      if (!course && normalizedCourseId) {
        course = getCourseById(normalizedCourseId)
      }

      if (!course && rawCourseId) {
        course = getCourseById(rawCourseId)
      }
      
      if (!course || !course.id) {
        console.warn('课程数据无效:', fav)
        return null
      }
      
      const displayId = denormalizeCourseId(course.id || denormalizedCourseId || rawCourseId || "")

      return {
        id: displayId,
        backendId: course.id || normalizedCourseId || rawCourseId,
        title: course.title,
        description: course.description,
        instructor: course.instructor?.name || course.instructor || '未知讲师',
        duration: course.duration || course.lessons || 0,
        price: course.price || 0,
        image_url: course.image_url || course.thumbnail || '/placeholder.svg',
        category: course.category || 'unknown',
      };
    })
    .filter((course): course is NonNullable<typeof course> => course !== null);

  return {
    favorites,
    favoriteProducts,
    favoriteCourses,
    loading,
    error,
    addToFavorites,
    removeFromFavorites,
    addCourseToFavorites,
    removeCourseFromFavorites,
    isFavorite,
    isCourseFavorite,
    refreshFavorites,
    fetchFavorites,
  }
}

const FavoritesContext = createContext<UseFavoritesReturn | null>(null)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const favoritesValue = useFavoritesData()
  return createElement(FavoritesContext.Provider, { value: favoritesValue }, children)
}

export function useFavorites(): UseFavoritesReturn {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error("useFavorites必须在FavoritesProvider中使用")
  }
  return context
}