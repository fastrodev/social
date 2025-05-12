type TagSelectorProps = {
  isDark: boolean;
  onSelectTag: (tag: string) => void;
};

export function TagSelector({ isDark, onSelectTag }: TagSelectorProps) {
  return (
    <div className="lg:w-64 flex-shrink-0">
      <div className="sticky top-6">
        <div className="w-full p-3 bg-gray-800/90 rounded-lg shadow-lg 
          border border-purple-500/20 backdrop-blur-sm
          transition-all duration-300 relative
          hover:shadow-purple-500/10 hover:border-purple-500/30 hover:shadow-2xl
          before:absolute before:inset-0 before:rounded-lg before:-z-10
          overflow-hidden">
          {/* Added wrapper div for horizontal scroll on mobile */}
          <div className="overflow-x-auto scrollbar-hide -mx-3 px-3">
            <div className="flex lg:flex-col gap-2 min-w-max lg:min-w-0">
              {["All", "Discussion", "Question", "Show", "Job"].map((tag) => (
                <button
                  type="button"
                  key={tag}
                  className={`px-3 py-1 rounded-full text-sm transition-all duration-200 
                    whitespace-nowrap flex-shrink-0 lg:w-full text-left
                    border border-purple-500/10 shadow-sm
                    hover:shadow-purple-500/20 hover:border-purple-500/20
                    ${
                    isDark
                      ? "bg-gray-900/50 text-gray-300 hover:bg-purple-600/90"
                      : "bg-gray-700/90 text-gray-200 hover:bg-purple-500/90"
                  }`}
                  onClick={() => onSelectTag(tag)}
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
