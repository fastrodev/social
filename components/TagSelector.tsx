import { useState } from "preact/hooks";

type TagSelectorProps = {
  isDark: boolean;
  onSelectTag: (tag: string) => void;
};

export function TagSelector({ isDark, onSelectTag }: TagSelectorProps) {
  const [selectedTag, setSelectedTag] = useState("All");

  const handleTagSelect = (tag: string) => {
    setSelectedTag(tag);
    onSelectTag(tag);
  };

  return (
    <div className="lg:w-64 flex flex-col gap-y-4">
      <div className="sticky top-6 hidden sm:hidden lg:block">
        <div className="w-full p-3 bg-gray-800/90 rounded-lg shadow-lg 
          border border-purple-500/20 backdrop-blur-sm
          transition-all duration-300 relative
          hover:shadow-purple-500/10 hover:border-purple-500/30 hover:shadow-2xl
          before:absolute before:inset-0 before:rounded-lg before:-z-10
          overflow-hidden">
          <div className="overflow-x-auto scrollbar-hide -mx-3 px-3">
            <div className="flex lg:flex-col gap-2 min-w-max lg:min-w-0">
              <h2 className="text-lg font-semibold text-purple-300 mb-2 px-1">
                Craft, Share, Earn: Unlock Profits with Sponsored Content
              </h2>
              <p className="text-sm text-gray-300 mb-3 px-1">
                Create content, spread value, earn points, and unlock profit
                sharing when your content lands a sponsor.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky top-6">
        <div className="w-full p-3 bg-gray-800/90 rounded-lg shadow-lg 
          border border-purple-500/20 backdrop-blur-sm
          transition-all duration-300 relative
          hover:shadow-purple-500/10 hover:border-purple-500/30 hover:shadow-2xl
          before:absolute before:inset-0 before:rounded-lg before:-z-10
          overflow-hidden">
          <div className="overflow-x-auto scrollbar-hide -mx-3 px-3">
            <div className="flex lg:flex-col gap-2 min-w-max lg:min-w-0">
              {[
                "All",
                "Advertising",
                "Business",
                "Course",
                "Deck",
                "Question",
                "Referral",
                "Review",
                "Tutorial",
              ].map((
                tag,
              ) => (
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
