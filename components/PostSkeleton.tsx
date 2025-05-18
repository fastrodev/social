import { memo } from "preact/compat";

interface Props {
  isDark: boolean;
}

export const PostSkeleton = memo(function PostSkeleton({ isDark }: Props) {
  const bgColor = isDark ? "bg-gray-700" : "bg-gray-200";

  return (
    <div
      className={`flex flex-col rounded-lg px-4 py-3 border ${
        isDark
          ? "bg-gray-800/90 border-purple-500/20"
          : "bg-white/95 border-purple-400/20"
      }`}
    >
      {/* Header skeleton - matches PostHeader.tsx */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full animate-pulse ${bgColor}`} />
          <div className="ml-3">
            <div className={`${bgColor} h-4 w-24 rounded animate-pulse mb-2`} />
            <div className={`${bgColor} h-3 w-32 rounded animate-pulse`} />
          </div>
        </div>
        <div className={`${bgColor} h-8 w-8 rounded-full animate-pulse`} />
      </div>

      {/* Content skeleton - matches PostContent.tsx */}
      <div className="w-full mb-4">
        <div
          className={`${bgColor} w-full h-36 sm:h-48 md:h-60 rounded-md animate-pulse`}
        />
        <div className="bg-black/60 backdrop-blur-sm px-4 py-3 rounded-b-lg">
          {/* Tags skeleton */}
          <div className="flex gap-1 mb-2">
            {[1, 2].map((_, i) => (
              <div
                key={i}
                className={`${bgColor} h-5 w-16 rounded-full animate-pulse`}
              />
            ))}
          </div>
          {/* Title skeleton */}
          <div className="space-y-2">
            <div className={`${bgColor} h-5 w-full rounded animate-pulse`} />
            <div className={`${bgColor} h-5 w-3/4 rounded animate-pulse`} />
          </div>
        </div>
      </div>

      {/* Footer skeleton - matches PostFooter.tsx */}
      <div className="flex items-center justify-between mt-2">
        <div
          className={`flex flex-col items-center ${bgColor} h-12 w-20 rounded animate-pulse`}
        />
        <div
          className={`flex flex-col items-center ${bgColor} h-12 w-20 rounded animate-pulse`}
        />
        <div
          className={`flex flex-col items-center ${bgColor} h-12 w-20 rounded animate-pulse`}
        />
      </div>
    </div>
  );
});
