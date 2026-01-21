export default function Loading() {
  return (
    <div className="h-screen flex flex-col bg-parchment">
      {/* Header skeleton */}
      <header className="flex-shrink-0 border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
          <div className="h-8 w-48 bg-border rounded animate-pulse" />
          <div className="h-4 w-20 bg-border rounded animate-pulse" />
        </div>
      </header>

      {/* Main content skeleton */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar skeleton */}
        <aside className="w-48 flex-shrink-0 border-r border-border bg-card p-4 hidden lg:block">
          <div className="h-4 w-20 bg-border rounded animate-pulse mb-4" />
          <div className="space-y-2">
            <div className="h-8 bg-border rounded animate-pulse" />
            <div className="h-8 bg-border rounded animate-pulse" />
            <div className="h-8 bg-border rounded animate-pulse" />
          </div>
        </aside>

        {/* Center content skeleton */}
        <main className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto px-6 py-8 lg:px-12">
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="h-4 bg-border rounded animate-pulse w-3/4" />
              <div className="h-4 bg-border rounded animate-pulse w-full" />
              <div className="h-4 bg-border rounded animate-pulse w-5/6" />
              <div className="h-4 bg-border rounded animate-pulse w-2/3" />
            </div>
          </div>
        </main>

        {/* Right sidebar skeleton */}
        <aside className="w-80 flex-shrink-0 border-l border-border bg-card hidden md:block">
          <div className="p-4 border-b border-border">
            <div className="h-4 w-24 bg-border rounded animate-pulse" />
          </div>
          <div className="p-4 space-y-3">
            <div className="h-24 bg-border rounded animate-pulse" />
            <div className="h-24 bg-border rounded animate-pulse" />
          </div>
        </aside>
      </div>
    </div>
  );
}
