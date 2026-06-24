"use client"

import { useState } from "react"
import { createPortal } from "react-dom"
import { MessageCircleMore, Send } from "lucide-react"
import { LikeButton } from "@/components/ui/like-button"
import { useComments } from "@/hooks/use-comments"

interface ArticleReadingToolbarProps {
  articleId: string
}

export function ArticleReadingToolbar({ articleId }: ArticleReadingToolbarProps) {
  const [draft, setDraft] = useState("")
  const { addComment, isLoading } = useComments("article", articleId, {
    autoLoad: false,
  })

  const portalEl =
    typeof document === "undefined" ? null : document.getElementById("mobile-fixed-actions-root")
  const inMobileFrame = Boolean(portalEl)

  const jumpToComments = () => {
    const target = document.getElementById("comments")
    target?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const handleSubmit = async () => {
    const content = draft.trim()
    if (!content) {
      jumpToComments()
      return
    }

    const created = await addComment(content)
    if (created) {
      setDraft("")
      jumpToComments()
    }
  }

  const shellClassName = inMobileFrame
    ? "flex items-center gap-2 border-t border-white/38 bg-[linear-gradient(180deg,rgba(252,254,255,0.84)_0%,rgba(244,249,255,0.9)_100%)] px-3 py-2.5 shadow-[0_-10px_24px_rgba(42,76,117,0.08)] backdrop-blur-[14px]"
    : "mx-3 mb-[max(0.5rem,env(safe-area-inset-bottom))] flex items-center gap-2 rounded-[24px] border border-white/42 bg-[linear-gradient(180deg,rgba(252,254,255,0.82)_0%,rgba(244,249,255,0.88)_100%)] px-3 py-2.5 shadow-[0_18px_38px_rgba(42,76,117,0.12)] backdrop-blur-[14px] sm:mx-5"

  const toolbar = (
    <div
      className={
        inMobileFrame
          ? "pointer-events-auto absolute inset-x-0 bottom-0 z-40"
          : "pointer-events-auto fixed bottom-0 left-1/2 z-40 w-full max-w-[760px] -translate-x-1/2"
      }
    >
      <div className={shellClassName}>
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onFocus={jumpToComments}
          placeholder="说点什么..."
          className="h-11 min-w-0 flex-1 rounded-full border border-white/50 bg-white/42 px-4 text-sm text-[#3d5a79] outline-none transition-colors placeholder:text-[#87a0b8] focus:border-white/70 focus:bg-white/62"
          maxLength={2000}
        />

        <button
          type="button"
          onClick={jumpToComments}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/46 bg-white/32 text-[#688098] shadow-[0_8px_18px_rgba(42,76,117,0.08)] transition-colors hover:bg-white/52"
          aria-label="查看评论"
        >
          <MessageCircleMore className="h-5 w-5" />
        </button>

        <LikeButton
          itemType="article"
          itemId={articleId}
          variant="icon-only"
          size="md"
          className="h-11 w-11 shrink-0 rounded-full border border-white/46 bg-white/32 text-[#688098] shadow-[0_8px_18px_rgba(42,76,117,0.08)]"
        />

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/46 bg-[linear-gradient(180deg,rgba(117,148,184,0.9)_0%,rgba(92,126,163,0.96)_100%)] text-white shadow-[0_8px_18px_rgba(58,92,132,0.18)] transition-colors hover:brightness-105 disabled:opacity-60"
          aria-label="发布评论"
        >
          <Send className="h-4.5 w-4.5" />
        </button>
      </div>
    </div>
  )

  if (portalEl) {
    return createPortal(toolbar, portalEl)
  }

  return toolbar
}
