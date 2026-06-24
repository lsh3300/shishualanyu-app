'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from "@/components/ui/skeleton"
import { LazyOnIntersection } from "@/components/ui/lazy-load"

export const LazyProductInteractionSection = LazyOnIntersection(
  () => import('./product-interaction-section').then(mod => ({ default: mod.ProductInteractionSection })),
  () => <ProductInteractionSectionSkeleton />,
  {
    rootMargin: "320px",
    threshold: 0.01,
  }
)

const DynamicCraftsmanStory = dynamic(
  () => import("@/components/ui/craftsman-story").then(mod => ({ default: mod.CraftsmanStory })),
  {
    loading: () => <CraftStorySkeleton />,
    ssr: false,
  }
)

export const LazyCraftsmanStory = DynamicCraftsmanStory

function CraftStorySkeleton() {
  return (
    <div className="rounded-[24px] border border-border/60 bg-card p-5">
      <div className="flex items-start gap-4">
        <Skeleton className="mt-1 h-6 w-6 rounded-full" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  )
}

function ProductInteractionSectionSkeleton() {
  return (
    <section className="rounded-[28px] border border-border/60 bg-card px-5 py-5 shadow-[0_16px_36px_rgba(15,23,42,0.05)]">
      <div className="mb-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-2 h-6 w-32" />
      </div>
      <Skeleton className="mb-5 h-16 w-full rounded-2xl" />
      <Skeleton className="mb-5 h-px w-full" />
      <div className="space-y-4">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    </section>
  )
}
