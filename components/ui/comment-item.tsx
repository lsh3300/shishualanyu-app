'use client'

import { useState } from 'react'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { CommentForm } from '@/components/ui/comment-form'
import { Heart, MessageCircle, Edit, Trash2, MoreVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Comment } from '@/hooks/use-comments'

interface CommentItemProps {
  comment: Comment
  isLiked?: boolean
  onLike?: (commentId: string) => void
  onReply?: (content: string, parentId: string) => Promise<void>
  onEdit?: (commentId: string, content: string) => Promise<void | boolean>
  onDelete?: (commentId: string) => Promise<void | boolean>
  isLoading?: boolean
  depth?: number
  maxDepth?: number
}

/**
 * 评论项组件 - 蓝染风格
 * 支持点赞、回复、编辑、删除
 */
export function CommentItem({
  comment,
  isLiked = false,
  onLike,
  onReply,
  onEdit,
  onDelete,
  isLoading = false,
  depth = 0,
  maxDepth = 3,
}: CommentItemProps) {
  const { user } = useAuth()
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)

  const isAuthor = user?.id === comment.user_id
  const canReply = depth < maxDepth && onReply

  // 格式化时间
  const timeAgo = formatDistanceToNow(new Date(comment.created_at), {
    addSuffix: true,
    locale: zhCN,
  })

  // 处理回复
  const handleReply = async (content: string) => {
    if (!onReply) return
    await onReply(content, comment.id)
    setShowReplyForm(false)
  }

  // 处理编辑
  const handleEdit = async () => {
    if (!onEdit || !editContent.trim()) return
    await onEdit(comment.id, editContent)
    setIsEditing(false)
  }

  // 处理删除
  const handleDelete = async () => {
    if (!onDelete) return
    if (confirm('确定要删除这条评论吗？')) {
      await onDelete(comment.id)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'group relative',
        depth > 0 && 'ml-8 mt-3'
      )}
    >
      {/* 回复缩进线 */}
      {depth > 0 && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/30 to-transparent" />
      )}

      <div className="flex gap-3">
        {/* 头像 */}
        <div className="flex-shrink-0">
          <div className="relative h-10 w-10 rounded-full overflow-hidden ring-2 ring-border">
            {comment.profiles?.avatar_url ? (
              <Image
                src={comment.profiles.avatar_url}
                alt={comment.profiles.username || '用户'}
                fill
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">
                  {(comment.profiles?.username || '用户')[0].toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 评论内容 */}
        <div className="flex-1 min-w-0">
          <div className="bg-card border rounded-lg p-3 shadow-sm group-hover:shadow-md transition-shadow duration-200">
            {/* 评论头部 */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">
                    {comment.profiles?.full_name || comment.profiles?.username || '匿名用户'}
                  </span>
                  {isAuthor && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      作者
                    </span>
                  )}
                </div>
                <time className="text-xs text-muted-foreground">{timeAgo}</time>
              </div>

              {/* 操作菜单 */}
              {isAuthor && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Edit className="h-3.5 w-3.5 mr-2" />
                      编辑
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleDelete}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-2" />
                      删除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* 评论正文 */}
            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full min-h-[80px] p-2 text-sm border rounded-md resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleEdit} disabled={isLoading}>
                    保存
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false)
                      setEditContent(comment.content)
                    }}
                  >
                    取消
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                {comment.content}
              </p>
            )}
          </div>

          {/* 操作按钮 */}
          {!isEditing && (
            <div className="flex items-center gap-4 mt-2 text-sm">
              {/* 点赞按钮 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onLike?.(comment.id)}
                disabled={isLoading}
                className={cn(
                  'h-7 gap-1.5 px-2 hover:bg-primary/5 transition-all duration-200',
                  isLiked && 'text-red-500'
                )}
              >
                <motion.div
                  whileTap={{ scale: 1.2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Heart
                    className={cn(
                      'h-3.5 w-3.5 transition-colors',
                      isLiked && 'fill-red-500'
                    )}
                  />
                </motion.div>
                {comment.likes_count > 0 && (
                  <span className={cn(isLiked && 'font-medium')}>
                    {comment.likes_count}
                  </span>
                )}
              </Button>

              {/* 回复按钮 */}
              {canReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="h-7 gap-1.5 px-2 hover:bg-primary/5"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  回复
                </Button>
              )}
            </div>
          )}

          {/* 回复表单 */}
          <AnimatePresence>
            {showReplyForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3"
              >
                <CommentForm
                  onSubmit={handleReply}
                  placeholder={`回复 @${comment.profiles?.username || '用户'}...`}
                  buttonText="发布回复"
                  isLoading={isLoading}
                  maxLength={1000}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* 子评论 */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-3">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  isLiked={false} // 需要从父组件传递
                  onLike={onLike}
                  onReply={onReply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  isLoading={isLoading}
                  depth={depth + 1}
                  maxDepth={maxDepth}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
