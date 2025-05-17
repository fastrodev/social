// deno-lint-ignore-file
import { useState } from "preact/hooks";
import { CtaCard } from "./CtaCard.tsx";
import { UserCard } from "./UserCard.tsx";

export type User = {
  id: string;
  name: string;
  avatar: string;
};

type TagSelectorProps = {
  isDark: boolean;
  onSelectTag: (tag: string) => void;
  user?: User; // Make user optional
};

export function TagSelector({ isDark, onSelectTag, user }: TagSelectorProps) {
  const [selectedTag, setSelectedTag] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const handleTagSelect = (tag: string) => {
    setSelectedTag(tag);
    onSelectTag(tag);
  };

  const allTags = [
    "All",
    "Advertising",
    "Business",
    "Course",
    "Deck",
    "Question",
    "Referral",
    "Review",
    "Tutorial",
  ];

  const filteredTags = allTags.filter((tag) =>
    tag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    // hide this div on mobile
    <div className="hidden lg:flex lg:w-64 flex-col gap-y-4">
      <div className="sticky top-6">
        {user ? <UserCard user={user} /> : <CtaCard />}
      </div>

      <div className="sticky top-6">
        <div className="w-full p-3 bg-gray-800/90 rounded-lg shadow-lg 
          border border-purple-500/20 backdrop-blur-sm
          transition-all duration-300 relative
          hover:shadow-purple-500/10 hover:border-purple-500/30 hover:shadow-2xl
          before:absolute before:inset-0 before:rounded-lg before:-z-10">
          <div className="overflow-x-auto scrollbar-hide -mx-3 px-3 py-1">
            <div className="flex lg:flex-col gap-2 min-w-max lg:min-w-0">
              <input
                type="text"
                placeholder="Search tags..."
                className={`px-4 py-2 md:px-3 md:py-1 rounded-full text-sm
                  transition-all duration-200 w-full lg:w-full
                  border-[1px] shadow-sm relative
                  ${
                  isDark
                    ? "bg-gray-950/50 text-gray-300 border-purple-500/10 placeholder-gray-500"
                    : "bg-gray-700/90 text-gray-200 border-purple-400/10 placeholder-gray-400"
                }
                  focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/20`}
                value={searchTerm}
                onInput={(e) =>
                  setSearchTerm((e.target as HTMLInputElement).value)}
              />
              {filteredTags.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  className={`px-4 py-2 md:px-3 md:py-1 rounded-full text-sm transition-all duration-200 
                    whitespace-nowrap flex-shrink-0 lg:w-full text-left
                    border-[1px] border-purple-500/10 shadow-sm relative overflow-hidden
                    touch-manipulation select-none
                    active:scale-95 active:opacity-80
                    ${
                    selectedTag === tag
                      ? isDark
                        ? "bg-purple-600/90 text-white border-purple-500/20"
                        : "bg-purple-500/90 text-white border-purple-400/20"
                      : isDark
                      ? "bg-gray-950/50 text-gray-300 hover:bg-purple-600/90"
                      : "bg-gray-700/90 text-gray-200 hover:bg-purple-500/90"
                  }
                    before:absolute before:inset-0 before:rounded-full before:-z-10
                    before:bg-gradient-to-r before:from-purple-500/5 before:via-pink-500/5 before:to-purple-500/5
                    hover:before:from-purple-500/10 hover:before:via-pink-500/10 hover:before:to-purple-500/10
                    hover:border-purple-500/20 hover:shadow-purple-500/5
                    transition-all duration-300`}
                  onClick={() => handleTagSelect(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
