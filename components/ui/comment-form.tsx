"use client"

import { useState } from "react"
import { Loader2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>
  placeholder?: string
  isLoading?: boolean
  maxLength?: number
  buttonText?: string
  autoFocus?: boolean
  className?: string
}

export function CommentForm({
  onSubmit,
  placeholder = "发表你的评论，分享你的想法...",
  isLoading = false,
  maxLength = 2000,
  buttonText = "发布评论",
  autoFocus = false,
  className,
}: CommentFormProps) {
  const [content, setContent] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedContent = content.trim()
    if (!trimmedContent) return

    await onSubmit(trimmedContent)
    setContent("")
  }

  const currentLength = content.length
  const isOverLimit = currentLength > maxLength
  const canSubmit = content.trim().length > 0 && !isOverLimit && !isLoading

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4", className)}>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        disabled={isLoading}
        maxLength={maxLength + 100}
        className={cn(
          "min-h-[112px] resize-none rounded-[18px] border border-[#d9e6f1] bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(247,251,255,0.96)_100%)] px-4 py-3 text-[15px] leading-7 text-[#35506f] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] outline-none transition-colors placeholder:text-[#9aadc0] focus:border-[#b8cce0] focus:bg-white"
        )}
      />

      <div className="flex items-center justify-between gap-4">
        <div className={cn("text-[13px] text-[#8da1b4]", isOverLimit && "text-red-500")}>
          {currentLength} / {maxLength}
        </div>

        <Button
          type="submit"
          disabled={!canSubmit}
          className="h-12 rounded-full border border-white/42 bg-[linear-gradient(180deg,rgba(132,160,191,0.95)_0%,rgba(101,132,166,0.98)_100%)] px-5 text-[15px] font-medium text-white shadow-[0_10px_24px_rgba(62,96,136,0.18)] hover:brightness-105 disabled:opacity-60"
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          {buttonText}
        </Button>
      </div>
    </form>
  )
}
