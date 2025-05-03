// deno-lint-ignore-file
import type { Post } from "@app/modules/index/type.ts";
import { useState } from "preact/hooks";
import Header from "@app/components/Header.tsx";
import { PageProps } from "fastro/mod.ts";
import { HexaIcon } from "@app/components/icons/hexa.tsx";
import { PostDetail } from "@app/components/PostDetail.tsx";

export default function Post({ data }: PageProps<{
  title: string;
  description: string;
  baseUrl: string;
  apiBaseUrl: string;
  isLogin: boolean;
  avatar_url: string;
  html_url: string;
  author: string;
  post: Post;
}>) {
  const [isDark, setIsDark] = useState(true);

  // Toggle theme and save preference to session storage
  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    // Save theme preference to session storage
    sessionStorage.setItem("theme", newTheme ? "dark" : "light");
  };

  // Theme styles
  const themeStyles = {
    background: isDark ? "#0f172a" : "#f8fafc",
    cardBg: isDark ? "bg-gray-800/90" : "bg-white/90",
    text: isDark ? "text-gray-100" : "text-gray-800",
    input: isDark
      ? "bg-gray-700/30 border-gray-600 text-white placeholder-gray-400"
      : "bg-gray-100/70 border-gray-300 text-gray-900 placeholder-gray-500",
    button: isDark
      ? "bg-purple-600 hover:bg-purple-700"
      : "bg-purple-500 hover:bg-purple-600",
    footer: isDark ? "text-gray-400" : "text-gray-600",
    link: isDark
      ? "text-purple-400 hover:text-purple-300"
      : "text-purple-600 hover:text-purple-500",
    cardBorder: isDark ? "border-gray-700" : "border-gray-200",
    cardGlow: isDark
      ? "shadow-[0_0_35px_rgba(147,51,234,0.3)]"
      : "shadow-[0_0_20px_rgba(147,51,234,0.15)]",
    hashtag: isDark
      ? "text-blue-400 hover:text-blue-300 font-medium"
      : "text-blue-600 hover:text-blue-500 font-medium",
  };

  return (
    <div className="relative min-h-screen">
      {/* Background Layer - simplified for mobile */}
      <div className="fixed inset-0 z-0">
        {/* Solid Background */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: themeStyles.background }}
        />

        {/* Hexagonal Grid Background - Applied to entire page */}
        <div
          className={`fixed inset-0 z-0 ${
            isDark ? "opacity-20" : "opacity-10"
          }`}
        >
          <HexaIcon />
        </div>
      </div>

      {/* Content Layer */}
      <div className="relative z-10 min-h-screen">
        {/* Theme toggle button */}
        <button
          type="button"
          onClick={toggleTheme}
          className={`fixed bottom-4 right-4 p-3 rounded-full transition-colors
            shadow-lg hover:scale-110 transform duration-200 z-50
            ${
            isDark ? "bg-gray-800 text-gray-200" : "bg-gray-200 text-gray-800"
          }`}
          aria-label="Toggle theme"
        >
          {isDark ? "☀️" : "🌙"}
        </button>

        <Header
          isLogin={data.isLogin}
          avatar_url={data.avatar_url}
          html_url={data.html_url}
          isDark={isDark}
        />

        <div className="max-w-xl mx-auto">
          <main className="max-w-2xl mx-auto relative flex flex-col gap-y-3 sm:gap-y-6">
            <PostDetail
              apiBaseUrl={data.apiBaseUrl}
              base_url={data.baseUrl}
              post={data.post}
              comments={[]}
              data={{
                author: data.author,
                isLogin: data.isLogin,
                avatar_url: data.avatar_url,
              }}
              isDark={true}
              isMobile={false}
            >
            </PostDetail>
          </main>
        </div>
      </div>
    </div>
  );
}
