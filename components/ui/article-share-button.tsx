"use client"

import { Button } from "@/components/ui/button"
import { Share2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface ArticleShareButtonProps {
  title: string
  className?: string
}

export function ArticleShareButton({ title, className }: ArticleShareButtonProps) {
  const handleShare = async () => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : ""

    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text: `分享文章：${title}`,
          url: shareUrl,
        })
        return
      }

      await navigator.clipboard.writeText(shareUrl)
      toast({
        title: "链接已复制",
        description: "可以把这篇文章分享给朋友了",
      })
    } catch (error) {
      console.error("分享失败:", error)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleShare}
      className={cn(
        "h-10 w-10 rounded-full border border-[#d7d0c6] bg-white/86 text-[#6f6a62] hover:bg-white hover:text-[#355b87]",
        className,
      )}
      aria-label="分享文章"
    >
      <Share2 className="h-4.5 w-4.5" />
    </Button>
  )
}
