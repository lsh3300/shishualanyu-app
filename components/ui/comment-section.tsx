'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CommentForm } from '@/components/ui/comment-form'
import { CommentItem } from '@/components/ui/comment-item'
import { useComments } from '@/hooks/use-comments'
import { MessageSquare, TrendingUp, Clock, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'

type ItemType = 'product' | 'course' | 'article'
type SortType = 'latest' | 'oldest' | 'popular'

interface CommentSectionProps {
  itemType: ItemType
  itemId: string
  title?: string
  className?: string
}

/**
 * 评论区组件 - 蓝染风格
 * 完整的评论功能，包括发布、回复、编辑、删除、点赞
 */
export function CommentSection({
  itemType,
  itemId,
  title = '评论',
  className,
}: CommentSectionProps) {
  const [sortBy, setSortBy] = useState<SortType>('latest')

  const {
    comments,
    totalCount,
    isLoading,
    hasMore,
    likedCommentIds,
    loadMore,
    addComment,
    updateComment,
    deleteComment,
    toggleCommentLike,
    setSort,
  } = useComments(itemType, itemId, {
    sort: sortBy,
    limit: 20,
    autoLoad: true,
  })

  // 排序改变处理
  const handleSortChange = (value: string) => {
    setSortBy(value as SortType)
    setSort(value as SortType)
  }

  // 发布评论
  const handleSubmitComment = async (content: string) => {
    await addComment(content)
  }

  // 回复评论
  const handleReplyComment = async (content: string, parentId: string) => {
    await addComment(content, parentId)
  }

  return (
    <div className={cn('w-full space-y-6', className)}>
      {/* 评论区标题和统计 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">
              {totalCount > 0 ? `共 ${totalCount} 条评论` : '暂无评论'}
            </p>
          </div>
        </div>

        {/* 排序选项 */}
        {totalCount > 0 && (
          <Tabs value={sortBy} onValueChange={handleSortChange}>
            <TabsList className="bg-muted/50">
              <TabsTrigger value="latest" className="gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                最新
              </TabsTrigger>
              <TabsTrigger value="popular" className="gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" />
                最热
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </div>

      {/* 发布评论表单 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-card border rounded-lg p-4 shadow-sm"
      >
        <CommentForm
          onSubmit={handleSubmitComment}
          placeholder="发表你的评论，分享你的想法..."
          isLoading={isLoading}
        />
      </motion.div>

      {/* 评论列表 */}
      <div className="space-y-4">
        {isLoading && comments.length === 0 ? (
          // 加载状态
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mb-3" />
            <p className="text-sm">加载评论中...</p>
          </div>
        ) : comments.length === 0 ? (
          // 空状态
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-4">
              <MessageSquare className="h-10 w-10 text-primary/40" />
            </div>
            <h4 className="text-base font-medium text-foreground mb-2">
              暂无评论
            </h4>
            <p className="text-sm text-muted-foreground max-w-sm">
              成为第一个发表评论的人，分享你的想法和见解
            </p>
          </motion.div>
        ) : (
          // 评论列表
          <AnimatePresence mode="popLayout">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                isLiked={likedCommentIds.includes(comment.id)}
                onLike={toggleCommentLike}
                onReply={handleReplyComment}
                onEdit={updateComment}
                onDelete={deleteComment}
                isLoading={isLoading}
              />
            ))}
          </AnimatePresence>
        )}

        {/* 加载更多按钮 */}
        {hasMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center pt-4"
          >
            <Button
              variant="outline"
              onClick={loadMore}
              disabled={isLoading}
              className={cn(
                'gap-2 transition-all duration-300',
                'hover:scale-105 active:scale-95',
                'border-primary/30 hover:border-primary',
                'hover:bg-primary/5'
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>加载中...</span>
                </>
              ) : (
                <span>加载更多评论</span>
              )}
            </Button>
          </motion.div>
        )}
      </div>

      {/* 蓝染风格装饰元素 */}
      <div className="absolute -z-10 top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -z-10 bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-secondary/5 to-transparent rounded-full blur-3xl pointer-events-none" />
    </div>
  )
}
