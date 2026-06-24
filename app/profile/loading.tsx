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

      {/* Profile header skeleton */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-20 w-20 rounded-full bg-muted animate-pulse" />
          <div className="flex-1">
            <div className="h-6 w-32 bg-muted rounded animate-pulse mb-2" />
            <div className="h-4 w-48 bg-muted rounded animate-pulse" />
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="h-6 w-12 bg-muted rounded animate-pulse mx-auto mb-2" />
              <div className="h-4 w-16 bg-muted rounded animate-pulse mx-auto" />
            </div>
          ))}
        </div>

        {/* Menu items skeleton */}
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 bg-muted/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
