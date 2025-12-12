import { BannerSkeleton, CoursesGridSkeleton, ProductsGridSkeleton } from "@/components/ui/home-skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header placeholder */}
      <div className="sticky top-0 z-50 bg-background py-3 border-b border-border/30">
        <div className="max-w-7xl px-4 mx-auto">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-muted animate-pulse" />
            <div className="flex-1 max-w-xl mx-auto h-10 bg-muted rounded-lg animate-pulse" />
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Banner skeleton */}
      <div className="max-w-7xl mx-auto px-4 mb-6 mt-4">
        <BannerSkeleton />
      </div>

      {/* Quick access skeleton */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>

      {/* Courses skeleton */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <div className="h-6 w-24 bg-muted rounded animate-pulse mb-4" />
        <CoursesGridSkeleton count={6} />
      </div>

      {/* Products skeleton */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <div className="h-6 w-24 bg-muted rounded animate-pulse mb-4" />
        <ProductsGridSkeleton count={8} />
      </div>
    </div>
  )
}
