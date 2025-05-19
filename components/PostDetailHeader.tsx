import BoltSvg from "@app/components/icons/bolt.tsx";
import { SearchIcon } from "./icons/search.tsx";

interface PostDetailHeaderProps {
  isDark?: boolean;
}

export default function PostDetailHeader(
  { isDark = true }: PostDetailHeaderProps,
) {
  const textColorClass = isDark ? "text-gray-100" : "text-gray-700";

  return (
    <div
      class={`container flex justify-between items-center max-w-xl mx-auto text-center text-xs px-4 py-4 gap-x-8 ${textColorClass}`}
    >
      <div
        class={`text-gray-100 flex grow items-center space-x-3`}
      >
        <a href="/" class={`flex flex-col items-center`}>
          <div
            class={`border-[2px] border-gray-100 bg-gray-900 rounded-full p-[1px]`}
          >
            <BoltSvg height="18" width="18" />
          </div>
          <span class={`${textColorClass} text-center mt-1`}>
            Unstable
          </span>
        </a>
        <div class="relative w-full">
          <input
            type="text"
            placeholder="Search..."
            class={`pl-10 pr-4 py-3 rounded-full text-sm w-full focus:outline-none focus:ring-2 focus:ring-gray-400 ${
              isDark ? "bg-gray-800 text-gray-100" : "bg-gray-100 text-gray-800"
            }`}
          />
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon isDark={isDark} />
          </div>
        </div>
      </div>
    </div>
  );
}
