export function PostDetailSkeleton() {
  return (
    <main className="max-w-2xl mx-auto relative flex flex-col gap-y-3 sm:gap-y-6">
      <div className="bg-gray-800/90 rounded-lg shadow-[0_0_35px_rgba(147,51,234,0.3)] px-4 py-3 border border-gray-700 backdrop-blur-lg mb-0 sm:mb-4">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse">
            </div>
            <div className="ml-4">
              <div className="h-4 w-24 bg-gray-700 rounded animate-pulse"></div>
              <div className="h-3 w-32 bg-gray-700 rounded animate-pulse mt-2">
              </div>
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="space-y-3 mb-4">
          <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-700 rounded animate-pulse w-3/4"></div>
          <div className="h-4 bg-gray-700 rounded animate-pulse w-1/2"></div>
        </div>

        {/* Stats Skeleton */}
        <div className="flex items-center justify-between -mx-6 px-6 py-3 space-x-4 border-t border-b border-gray-700/50 mb-4">
          <div className="h-4 w-24 bg-gray-700 rounded animate-pulse"></div>
          <div className="h-4 w-24 bg-gray-700 rounded animate-pulse"></div>
        </div>

        {/* Comments Skeleton */}
        <div className="mt-2 sm:mt-4 pt-0 space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="p-4 rounded-lg border border-gray-700 bg-gray-800/90"
            >
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse">
                </div>
                <div className="ml-2">
                  <div className="h-4 w-24 bg-gray-700 rounded animate-pulse">
                  </div>
                  <div className="h-3 w-32 bg-gray-700 rounded animate-pulse mt-2">
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-700 rounded animate-pulse w-3/4">
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
