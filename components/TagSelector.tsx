// deno-lint-ignore-file
import { useEffect, useState } from "preact/hooks";
import { AnimatedText } from "./AnimatedText.tsx";
import { TransitionTitle } from "./TransitionTitle.tsx";

type TagSelectorProps = {
  isDark: boolean;
  onSelectTag: (tag: string) => void;
};

export function TagSelector({ isDark, onSelectTag }: TagSelectorProps) {
  const [selectedTag, setSelectedTag] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [titleIndex, setTitleIndex] = useState(0);

  const titles = [
    {
      title: "Craft, Share, Earn: Unlock Profits with Sponsored Content",
      description:
        "Create content, spread value, earn points, and unlock profit sharing when your content lands a sponsor.",
    },
    {
      title: "Create & Monetize: Turn Your Content into Revenue",
      description:
        "Share your expertise, build your audience, and earn rewards through our sponsorship opportunities.",
    },
    {
      title: "Share Knowledge, Reap Rewards: Join Our Creator Network",
      description:
        "Connect with sponsors, deliver valuable content, and earn from your creative contributions.",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTitleIndex((current) => (current + 1) % titles.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

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
    <div className="lg:w-64 flex flex-col gap-y-4">
      {/* // Make this CTA Container have static height */}
      <div className="sticky top-6 hidden sm:hidden lg:block">
        <div className="w-full p-3 bg-gray-800/90 rounded-lg shadow-lg 
          border border-purple-500/20 backdrop-blur-sm
          transition-all duration-300 relative
          hover:shadow-purple-500/10 hover:border-purple-500/30 hover:shadow-2xl
          before:absolute before:inset-0 before:rounded-lg before:-z-10
          overflow-hidden h-auto">
          <div className="overflow-x-auto scrollbar-hide -mx-3 px-3 h-full">
            <div className="flex lg:flex-col gap-2 min-w-max lg:min-w-0 h-full">
              <div className="flex flex-col flex-1 min-h-[165px]">
                <h2 className="text-lg font-semibold text-purple-300 mb-2 px-1">
                  <TransitionTitle
                    text={titles[titleIndex].title}
                    className="transition-all duration-300"
                  />
                </h2>
                <p className="text-sm text-gray-300 mb-3 px-1">
                  <AnimatedText
                    text={titles[titleIndex].description}
                    className="transition-all duration-300"
                  />
                </p>
              </div>
              <button
                type="button"
                className="px-4 py-2 rounded-lg text-sm font-medium w-full mt-auto
                  bg-gradient-to-r from-purple-600 to-pink-600
                  text-white shadow-lg
                  border border-purple-500/20
                  transition-all duration-300
                  hover:from-purple-500 hover:to-pink-500
                  hover:shadow-purple-500/20 hover:scale-[1.02]
                  active:scale-[0.98] active:opacity-90"
                onClick={() =>
                  window.location.href =
                    "https://web.fastro.dev/auth/github/signin"}
              >
                Start Creating
              </button>
            </div>
          </div>
        </div>
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
