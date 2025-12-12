export default function Loading() {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header placeholder */}
      <div className="sticky top-0 z-50 bg-background py-3 border-b border-border/30">
        <div className="max-w-7xl px-4 mx-auto">
          <div className="flex items-center gap-4">
            <div className="h-6 w-6 bg-muted rounded animate-pulse" />
            <div className="h-6 w-24 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Cart items skeleton */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 p-4 bg-card rounded-lg border">
              <div className="h-5 w-5 bg-muted rounded animate-pulse" />
              <div className="h-24 w-24 bg-muted rounded-lg animate-pulse" />
              <div className="flex-1">
                <div className="h-5 w-48 bg-muted rounded animate-pulse mb-2" />
                <div className="h-4 w-32 bg-muted rounded animate-pulse mb-4" />
                <div className="flex justify-between items-center">
                  <div className="h-6 w-20 bg-muted rounded animate-pulse" />
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                    <div className="h-8 w-12 bg-muted rounded animate-pulse" />
                    <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar skeleton */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 bg-muted rounded animate-pulse" />
            <div className="h-5 w-16 bg-muted rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-4">
            <div className="h-6 w-24 bg-muted rounded animate-pulse" />
            <div className="h-10 w-28 bg-muted rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
