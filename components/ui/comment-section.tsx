"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Loader2, MessageSquare, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { CommentForm } from "@/components/ui/comment-form"
import { CommentItem } from "@/components/ui/comment-item"
import { useComments } from "@/hooks/use-comments"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type ItemType = "product" | "course" | "article"
type SortType = "latest" | "oldest" | "popular"

interface CommentSectionProps {
  itemType: ItemType
  itemId: string
  title?: string
  className?: string
  showComposer?: boolean
  variant?: "default" | "plain"
}

export function CommentSection({
  itemType,
  itemId,
  title = "评论",
  className,
  showComposer = true,
  variant = "default",
}: CommentSectionProps) {
  const [sortBy, setSortBy] = useState<SortType>("latest")
  const isPlain = variant === "plain"

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

  const likedCommentIdSet = new Set(likedCommentIds)

  const handleSortChange = (value: string) => {
    setSortBy(value as SortType)
    setSort(value as SortType)
  }

  const handleSubmitComment = async (content: string) => {
    await addComment(content)
  }

  const handleReplyComment = async (content: string, parentId: string) => {
    await addComment(content, parentId)
  }

  return (
    <section
      className={cn(
        isPlain
          ? "border-t border-[#e7edf3] bg-white pt-5 sm:pt-6"
          : "overflow-hidden rounded-[22px] border border-white/42 bg-[linear-gradient(180deg,rgba(252,254,255,0.82)_0%,rgba(244,249,255,0.9)_100%)] p-5 shadow-[0_16px_34px_rgba(42,76,117,0.08)] backdrop-blur-[12px] sm:p-6",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center text-[#496b92]",
              isPlain
                ? "rounded-full bg-[#f5f8fb]"
                : "rounded-[16px] bg-[linear-gradient(180deg,rgba(255,255,255,0.68)_0%,rgba(233,242,250,0.86)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
            )}
          >
            <MessageSquare className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="text-[18px] font-semibold leading-none text-[#1d3f67]">{title}</h3>
            <p className="mt-1.5 text-[13px] text-[#8194a9]">
              {totalCount > 0 ? `共 ${totalCount} 条评论` : "暂时还没有评论"}
            </p>
          </div>
        </div>

        {totalCount > 0 ? (
          <Tabs value={sortBy} onValueChange={handleSortChange}>
            <TabsList
              className={cn(
                "h-10 p-1",
                isPlain
                  ? "rounded-full border border-[#e3ebf3] bg-[#f7fafd]"
                  : "rounded-full border border-white/44 bg-white/42 shadow-[0_8px_20px_rgba(42,76,117,0.06)]"
              )}
            >
              <TabsTrigger value="latest" className="rounded-full px-4 text-[13px]">
                最新
              </TabsTrigger>
              <TabsTrigger value="popular" className="rounded-full px-4 text-[13px]">
                热门
              </TabsTrigger>
            </TabsList>
          </Tabs>
        ) : null}
      </div>

      {showComposer ? (
        <div className="mt-5 rounded-[20px] border border-[#dbe7f2] bg-[linear-gradient(180deg,rgba(255,255,255,0.9)_0%,rgba(248,251,255,0.95)_100%)] p-4 shadow-[0_12px_28px_rgba(42,76,117,0.06)] sm:p-5">
          <CommentForm onSubmit={handleSubmitComment} placeholder="发表你的评论，分享你的想法..." isLoading={isLoading} />
        </div>
      ) : null}

      <div className="mt-6 space-y-4">
        {isLoading && comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-[#8396aa]">
            <Loader2 className="mb-3 h-8 w-8 animate-spin" />
            <p className="text-sm">正在加载评论...</p>
          </div>
        ) : comments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "px-6 py-14 text-center",
              isPlain
                ? "rounded-[14px] border border-dashed border-[#d9e5f0] bg-[#fafcff]"
                : "rounded-[22px] border border-dashed border-[#d9e5f0] bg-white/56"
            )}
          >
            <div
              className={cn(
                "mx-auto flex h-24 w-24 items-center justify-center rounded-full text-[#8ca2b8]",
                isPlain
                  ? "bg-[#f1f6fb]"
                  : "bg-[linear-gradient(180deg,rgba(235,243,250,0.88)_0%,rgba(247,251,255,0.98)_100%)]"
              )}
            >
              <MessageSquare className="h-11 w-11" />
            </div>
            <h4 className="mt-6 text-[24px] font-semibold text-[#29496e]">暂无评论</h4>
            <p className="mx-auto mt-3 max-w-[18rem] text-[15px] leading-8 text-[#8297ac]">
              先在底部输入框说点什么，留下第一条评论。
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                likedCommentIdSet={likedCommentIdSet}
                onLike={toggleCommentLike}
                onReply={handleReplyComment}
                onEdit={updateComment}
                onDelete={deleteComment}
                isLoading={isLoading}
              />
            ))}
          </AnimatePresence>
        )}

        {hasMore ? (
          <div className="flex justify-center pt-3">
            <Button
              variant="outline"
              onClick={loadMore}
              disabled={isLoading}
              className="h-11 rounded-full border-[#d5e2ee] bg-white px-5 text-[#557392] hover:bg-[#f9fbfd]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  加载中...
                </>
              ) : (
                <>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  加载更多评论
                </>
              )}
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  )
}
