'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { toast } from '@/hooks/use-toast'

// 类型定义
type ItemType = 'product' | 'course' | 'article'
type SortType = 'latest' | 'oldest' | 'popular'

interface UserProfile {
  id: string
  username: string
  full_name: string
  avatar_url: string
}

export interface Comment {
  id: string
  user_id: string
  item_type: ItemType
  item_id: string
  content: string
  parent_id: string | null
  status: string
  likes_count: number
  created_at: string
  updated_at: string
  profiles?: UserProfile
  replies: Comment[]
}

interface UseCommentsOptions {
  sort?: SortType
  limit?: number
  autoLoad?: boolean
}

interface UseCommentsReturn {
  // 状态
  comments: Comment[]
  totalCount: number
  isLoading: boolean
  hasMore: boolean
  currentPage: number
  likedCommentIds: string[]
  
  // 方法
  loadComments: (page?: number) => Promise<void>
  loadMore: () => Promise<void>
  addComment: (content: string, parentId?: string | null) => Promise<Comment | null>
  updateComment: (commentId: string, content: string) => Promise<boolean>
  deleteComment: (commentId: string) => Promise<boolean>
  toggleCommentLike: (commentId: string) => Promise<void>
  setSort: (sort: SortType) => void
}

/**
 * 评论功能 Hook
 * @param itemType 内容类型: product, course, article
 * @param itemId 内容ID (UUID)
 * @param options 配置选项
 */
export function useComments(
  itemType: ItemType,
  itemId: string,
  options: UseCommentsOptions = {}
): UseCommentsReturn {
  const {
    sort: initialSort = 'latest',
    limit = 20,
    autoLoad = true,
  } = options

  const { user, getToken } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [sort, setSort] = useState<SortType>(initialSort)
  const [likedCommentIds, setLikedCommentIds] = useState<string[]>([])

  // 加载评论列表
  const loadComments = useCallback(async (page = 1) => {
    if (!itemType || !itemId) return

    try {
      setIsLoading(true)
      const response = await fetch(
        `/api/comments?item_type=${itemType}&item_id=${itemId}&sort=${sort}&page=${page}&limit=${limit}`
      )

      if (!response.ok) {
        throw new Error('获取评论失败')
      }

      const data = await response.json()
      
      if (page === 1) {
        setComments(data.comments || [])
      } else {
        setComments(prev => [...prev, ...(data.comments || [])])
      }
      
      setTotalCount(data.total || 0)
      setHasMore(data.hasMore || false)
      setCurrentPage(page)
      setLikedCommentIds(data.likedCommentIds || [])
    } catch (error) {
      console.error('获取评论错误:', error)
      toast({
        title: '获取评论失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [itemType, itemId, sort, limit])

  // 加载更多评论
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return
    await loadComments(currentPage + 1)
  }, [hasMore, isLoading, currentPage, loadComments])

  // 发布评论
  const addComment = useCallback(async (
    content: string,
    parentId: string | null = null
  ): Promise<Comment | null> => {
    // 未登录提示
    if (!user) {
      toast({
        title: '请先登录',
        description: '登录后可以发表评论',
        variant: 'default',
      })
      return null
    }

    // 内容验证
    const trimmedContent = content.trim()
    if (!trimmedContent) {
      toast({
        title: '评论内容不能为空',
        variant: 'destructive',
      })
      return null
    }

    if (trimmedContent.length > 2000) {
      toast({
        title: '评论内容过长',
        description: '评论内容不能超过2000字',
        variant: 'destructive',
      })
      return null
    }

    try {
      setIsLoading(true)

      // 获取访问令牌
      const token = await getToken()
      if (!token) {
        toast({
          title: '发布失败',
          description: '无法获取访问令牌',
          variant: 'destructive',
        })
        return null
      }

      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          item_type: itemType,
          item_id: itemId,
          content: trimmedContent,
          parent_id: parentId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '发布评论失败')
      }

      const data = await response.json()
      
      toast({
        title: '评论发布成功',
        variant: 'default',
      })

      // 重新加载评论列表
      await loadComments(1)
      
      return data.comment
    } catch (error) {
      console.error('发布评论错误:', error)
      toast({
        title: '发布失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }, [user, itemType, itemId, loadComments])

  // 编辑评论
  const updateComment = useCallback(async (
    commentId: string,
    content: string
  ): Promise<boolean> => {
    // 内容验证
    const trimmedContent = content.trim()
    if (!trimmedContent) {
      toast({
        title: '评论内容不能为空',
        variant: 'destructive',
      })
      return false
    }

    if (trimmedContent.length > 2000) {
      toast({
        title: '评论内容过长',
        description: '评论内容不能超过2000字',
        variant: 'destructive',
      })
      return false
    }

    try {
      setIsLoading(true)

      // 获取访问令牌
      const token = await getToken()
      if (!token) {
        toast({
          title: '编辑失败',
          description: '无法获取访问令牌',
          variant: 'destructive',
        })
        return false
      }

      const response = await fetch('/api/comments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          comment_id: commentId,
          content: trimmedContent,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '编辑评论失败')
      }

      toast({
        title: '评论已更新',
        variant: 'default',
      })

      // 重新加载评论列表
      await loadComments(1)
      
      return true
    } catch (error) {
      console.error('编辑评论错误:', error)
      toast({
        title: '编辑失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }, [loadComments])

  // 删除评论
  const deleteComment = useCallback(async (commentId: string): Promise<boolean> => {
    try {
      setIsLoading(true)

      // 获取访问令牌
      const token = await getToken()
      if (!token) {
        toast({
          title: '删除失败',
          description: '无法获取访问令牌',
          variant: 'destructive',
        })
        return false
      }

      const response = await fetch(
        `/api/comments?comment_id=${commentId}`,
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
        throw new Error(error.error || '删除评论失败')
      }

      toast({
        title: '评论已删除',
        variant: 'default',
      })

      // 重新加载评论列表
      await loadComments(1)
      
      return true
    } catch (error) {
      console.error('删除评论错误:', error)
      toast({
        title: '删除失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }, [loadComments])

  // 切换评论点赞
  const toggleCommentLike = useCallback(async (commentId: string) => {
    // 未登录提示
    if (!user) {
      toast({
        title: '请先登录',
        description: '登录后可以点赞评论',
        variant: 'default',
      })
      return
    }

    const isLiked = likedCommentIds.includes(commentId)

    try {
      // 获取访问令牌
      const token = await getToken()
      if (!token) {
        toast({
          title: '操作失败',
          description: '无法获取访问令牌',
          variant: 'destructive',
        })
        return
      }

      if (isLiked) {
        // 取消点赞
        const response = await fetch(
          `/api/comment-likes?comment_id=${commentId}`,
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

        // 乐观更新
        setLikedCommentIds(prev => prev.filter(id => id !== commentId))
        setComments(prev => updateCommentLikesCount(prev, commentId, -1))
        
      } else {
        // 添加点赞
        const response = await fetch('/api/comment-likes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            comment_id: commentId,
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || '点赞失败')
        }

        // 乐观更新
        setLikedCommentIds(prev => [...prev, commentId])
        setComments(prev => updateCommentLikesCount(prev, commentId, 1))
      }
    } catch (error) {
      console.error('评论点赞错误:', error)
      toast({
        title: '操作失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      })
      
      // 失败时重新加载
      await loadComments(currentPage)
    }
  }, [user, likedCommentIds, loadComments, currentPage])

  // 更新评论点赞数（辅助函数）
  const updateCommentLikesCount = (
    comments: Comment[],
    commentId: string,
    delta: number
  ): Comment[] => {
    return comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          likes_count: Math.max(0, comment.likes_count + delta),
        }
      }
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: updateCommentLikesCount(comment.replies, commentId, delta),
        }
      }
      return comment
    })
  }

  // 排序改变时重新加载
  useEffect(() => {
    if (autoLoad) {
      loadComments(1)
    }
  }, [sort, autoLoad, loadComments])

  // 初始加载
  useEffect(() => {
    if (autoLoad && itemType && itemId) {
      loadComments(1)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    comments,
    totalCount,
    isLoading,
    hasMore,
    currentPage,
    likedCommentIds,
    loadComments,
    loadMore,
    addComment,
    updateComment,
    deleteComment,
    toggleCommentLike,
    setSort,
  }
}
