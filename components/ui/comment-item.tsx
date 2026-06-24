"use client"

import { useState } from "react"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import { Edit, Heart, MessageCircle, MoreVertical, Trash2 } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { CommentForm } from "@/components/ui/comment-form"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Comment } from "@/hooks/use-comments"

interface CommentItemProps {
  comment: Comment
  isLiked?: boolean
  likedCommentIdSet?: Set<string>
  onLike?: (commentId: string) => void
  onReply?: (content: string, parentId: string) => Promise<void>
  onEdit?: (commentId: string, content: string) => Promise<void | boolean>
  onDelete?: (commentId: string) => Promise<void | boolean>
  isLoading?: boolean
  depth?: number
  maxDepth?: number
}

export function CommentItem({
  comment,
  isLiked = false,
  likedCommentIdSet,
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
  const resolvedIsLiked = likedCommentIdSet?.has(comment.id) ?? isLiked
  const isAuthor = user?.id === comment.user_id
  const canReply = depth < maxDepth && onReply

  const timeAgo = formatDistanceToNow(new Date(comment.created_at), {
    addSuffix: true,
    locale: zhCN,
  })

  const handleReply = async (content: string) => {
    if (!onReply) return
    await onReply(content, comment.id)
    setShowReplyForm(false)
  }

  const handleEdit = async () => {
    if (!onEdit || !editContent.trim()) return
    await onEdit(comment.id, editContent)
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (!onDelete) return
    if (confirm("确定要删除这条评论吗？")) {
      await onDelete(comment.id)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className={cn(depth > 0 && "ml-6 border-l border-[#e4edf5] pl-4")}
    >
      <div className="rounded-[16px] border border-[#e3ebf3] bg-white p-4 shadow-[0_6px_18px_rgba(50,84,122,0.04)]">
        <div className="flex items-start gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-full ring-1 ring-[#dce7f1]">
            {comment.profiles?.avatar_url ? (
              <Image
                src={comment.profiles.avatar_url}
                alt={comment.profiles.username || "用户"}
                fill
                sizes="40px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#ebf3fa,#f9fbfe)] text-sm font-semibold text-[#456a92]">
                {(comment.profiles?.username || "用户")[0].toUpperCase()}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-[14px] font-semibold text-[#314d71]">
                    {comment.profiles?.full_name || comment.profiles?.username || "匿名用户"}
                  </span>
                  {isAuthor ? (
                    <span className="rounded-full bg-[#eaf2fa] px-2 py-0.5 text-[11px] font-medium text-[#5a7ea7]">
                      作者
                    </span>
                  ) : null}
                </div>
                <time className="mt-1 block text-[12px] text-[#93a5b8]">{timeAgo}</time>
              </div>

              {isAuthor ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-[#8da0b3] hover:bg-[#f3f8fc]">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Edit className="mr-2 h-3.5 w-3.5" />
                      编辑
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                      <Trash2 className="mr-2 h-3.5 w-3.5" />
                      删除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
            </div>

            {isEditing ? (
              <div className="mt-3 space-y-3">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[96px] w-full resize-none rounded-[16px] border border-[#d9e6f1] bg-white px-4 py-3 text-[14px] leading-7 text-[#42586f] outline-none focus:border-[#bfd0e0]"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleEdit} disabled={isLoading} className="rounded-full px-4">
                    保存
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false)
                      setEditContent(comment.content)
                    }}
                    className="rounded-full px-4"
                  >
                    取消
                  </Button>
                </div>
              </div>
            ) : (
              <p className="mt-3 whitespace-pre-wrap break-words text-[14px] leading-7 text-[#4d5662]">
                {comment.content}
              </p>
            )}

            {!isEditing ? (
              <div className="mt-3 flex items-center gap-3 text-[13px]">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onLike?.(comment.id)}
                  disabled={isLoading}
                  className={cn(
                    "h-8 rounded-full px-3 text-[#7b8fa4] hover:bg-[#eef5fb]",
                    resolvedIsLiked && "text-red-500"
                  )}
                >
                  <Heart className={cn("mr-1.5 h-3.5 w-3.5", resolvedIsLiked && "fill-red-500")} />
                  {comment.likes_count > 0 ? comment.likes_count : "点赞"}
                </Button>

                {canReply ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReplyForm(!showReplyForm)}
                    className="h-8 rounded-full px-3 text-[#7b8fa4] hover:bg-[#eef5fb]"
                  >
                    <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
                    回复
                  </Button>
                ) : null}
              </div>
            ) : null}

            <AnimatePresence>
              {showReplyForm ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4"
                >
                  <CommentForm
                    onSubmit={handleReply}
                    placeholder={`回复 @${comment.profiles?.username || "用户"}...`}
                    buttonText="发布回复"
                    isLoading={isLoading}
                    maxLength={1000}
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>

            {comment.replies && comment.replies.length > 0 ? (
              <div className="mt-4 space-y-3">
                {comment.replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    likedCommentIdSet={likedCommentIdSet}
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
            ) : null}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
