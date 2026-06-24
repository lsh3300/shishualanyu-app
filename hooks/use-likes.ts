'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { toast } from '@/hooks/use-toast'

// 类型定义
type ItemType = 'product' | 'course' | 'article'

interface Like {
  id: string
  user_id: string
  created_at: string
  profiles?: {
    username: string
    full_name: string
    avatar_url: string
  }
}

interface UseLikesReturn {
  // 状态
  likes: Like[]
  likesCount: number
  isLiked: boolean
  isLoading: boolean
  
  // 方法
  toggleLike: () => Promise<void>
  fetchLikes: () => Promise<void>
  checkIsLiked: () => Promise<boolean>
}

/**
 * 点赞功能 Hook
 * @param itemType 内容类型: product, course, article
 * @param itemId 内容ID (UUID)
 */
export function useLikes(itemType: ItemType, itemId: string): UseLikesReturn {
  const { user, getToken } = useAuth()
  const [likes, setLikes] = useState<Like[]>([])
  const [likesCount, setLikesCount] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // 获取点赞列表
  const fetchLikes = useCallback(async () => {
    if (!itemType || !itemId) return

    try {
      setIsLoading(true)
      const response = await fetch(
        `/api/likes?item_type=${itemType}&item_id=${itemId}`
      )

      if (!response.ok) {
        throw new Error('获取点赞数据失败')
      }

      const data = await response.json()
      setLikes(data.likes || [])
      setLikesCount(data.total || 0)
      setIsLiked(data.isLiked || false)
    } catch (error) {
      console.error('获取点赞数据错误:', error)
    } finally {
      setIsLoading(false)
    }
  }, [itemType, itemId])

  // 检查是否已点赞
  const checkIsLiked = useCallback(async (): Promise<boolean> => {
    if (!user) return false

    try {
      const response = await fetch(
        `/api/likes?item_type=${itemType}&item_id=${itemId}`
      )
      if (response.ok) {
        const data = await response.json()
        return data.isLiked || false
      }
    } catch (error) {
      console.error('检查点赞状态错误:', error)
    }
    return false
  }, [user, itemType, itemId])

  // 切换点赞状态
  const toggleLike = useCallback(async () => {
    // 未登录提示
    if (!user) {
      toast({
        title: '请先登录',
        description: '登录后可以点赞',
        variant: 'default',
      })
      return
    }

    try {
      setIsLoading(true)

      // 获取访问令牌
      const token = await getToken()
      if (!token) {
        toast({
          title: '点赞失败',
          description: '无法获取访问令牌',
          variant: 'destructive',
        })
        return
      }

      if (isLiked) {
        // 取消点赞
        const response = await fetch(
          `/api/likes?item_type=${itemType}&item_id=${itemId}`,
          {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          }
        )

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || '取消点赞失败')
        }

        const data = await response.json()
        
        // 乐观更新
        setIsLiked(false)
        setLikesCount(data.total || likesCount - 1)
        
        toast({
          title: '已取消点赞',
          variant: 'default',
        })
      } else {
        // 添加点赞
        const response = await fetch('/api/likes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            item_type: itemType,
            item_id: itemId,
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || '点赞失败')
        }

        const data = await response.json()
        
        // 乐观更新
        setIsLiked(true)
        setLikesCount(data.total || likesCount + 1)
        
        toast({
          title: '点赞成功',
          variant: 'default',
        })
      }

      // 重新获取完整数据
      await fetchLikes()
    } catch (error) {
      console.error('点赞操作错误:', error)
      toast({
        title: '操作失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      })
      
      // 失败时回滚状态
      await fetchLikes()
    } finally {
      setIsLoading(false)
    }
  }, [user, isLiked, itemType, itemId, likesCount, fetchLikes])

  // 初始加载
  useEffect(() => {
    fetchLikes()
  }, [fetchLikes])

  return {
    likes,
    likesCount,
    isLiked,
    isLoading,
    toggleLike,
    fetchLikes,
    checkIsLiked,
  }
}
