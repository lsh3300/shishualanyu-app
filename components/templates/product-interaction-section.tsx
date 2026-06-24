'use client'

import { LikeButton } from "@/components/ui/like-button"
import { CommentSection } from "@/components/ui/comment-section"
import { Separator } from "@/components/ui/separator"

interface ProductInteractionSectionProps {
  productId: string
}

export function ProductInteractionSection({ productId }: ProductInteractionSectionProps) {
  return (
    <section className="rounded-[28px] border border-border/60 bg-card px-5 py-5 shadow-[0_16px_36px_rgba(15,23,42,0.05)]">
      <div className="mb-4">
        <p className="text-[11px] uppercase tracking-[0.26em] text-muted-foreground">Interaction</p>
        <h2 className="mt-1 text-lg font-semibold text-foreground">喜欢与评价</h2>
      </div>

      <div className="mb-5 flex items-center justify-center rounded-2xl bg-muted/45 py-4">
        <LikeButton itemType="product" itemId={productId} size="lg" showCount={true} />
      </div>

      <Separator className="mb-5" />
      <CommentSection itemType="product" itemId={productId} title="用户评价" />
    </section>
  )
}
