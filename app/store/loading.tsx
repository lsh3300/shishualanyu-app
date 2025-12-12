import { ProductsGridSkeleton } from "@/components/ui/home-skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header placeholder */}
      <div className="sticky top-0 z-50 bg-background py-3 border-b border-border/30">
        <div className="max-w-7xl px-4 mx-auto">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-muted animate-pulse" />
            <div className="flex-1 max-w-xl mx-auto h-10 bg-muted rounded-lg animate-pulse" />
          </div>
        </div>
      </div>

      {/* Page title skeleton */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse mb-2" />
        <div className="h-4 w-64 bg-muted rounded animate-pulse" />
      </div>

      {/* Category tabs skeleton */}
      <div className="max-w-7xl mx-auto px-4 mb-6">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 w-24 bg-muted rounded-full animate-pulse" />
          ))}
        </div>
      </div>

      {/* Products grid skeleton */}
      <div className="max-w-7xl mx-auto px-4">
        <ProductsGridSkeleton count={12} />
      </div>
    </div>
  )
}
