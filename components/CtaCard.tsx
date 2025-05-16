// deno-lint-ignore-file
import { useEffect, useState } from "preact/hooks";
import { AnimatedText } from "./AnimatedText.tsx";
import { TransitionTitle } from "./TransitionTitle.tsx";

interface Title {
  title: string;
  description: string;
}

export function CtaCard() {
  const [titleIndex, setTitleIndex] = useState(0);

  const titles: Title[] = [
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

  return (
    <div className="w-full p-3 bg-gray-800/90 rounded-lg shadow-lg 
      border border-purple-500/20 backdrop-blur-sm
      transition-all duration-300 relative
      hover:shadow-purple-500/10 hover:border-purple-500/30 hover:shadow-2xl
      before:absolute before:inset-0 before:rounded-lg before:-z-10
      overflow-hidden min-h-[230px] h-full flex flex-col">
      <div className="overflow-x-auto scrollbar-hide -mx-3 px-3 flex-1 flex flex-col">
        <div className="flex flex-col flex-1">
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
          <div className="mt-auto">
            <button
              type="button"
              className="px-4 py-2 rounded-lg text-sm font-medium w-full
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
  );
}
