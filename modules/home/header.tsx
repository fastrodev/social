import { useEffect, useState } from "preact/hooks";
import BoltSvg from "@app/components/icons/bolt.tsx";
import GithubSvg from "@app/components/icons/github-svg.tsx";
import { VDotsIcon } from "@app/components/icons/vdots.tsx";

export default function Header(
  props: {
    isLogin: boolean;
    avatar_url: string;
    html_url: string;
    base_url?: string;
    title?: string;
    previous_url?: string;
    isDark?: boolean;
    message?: string;
  },
) {
  const [menuOpen, setMenuOpen] = useState(false);
  // Use the isDark prop with a fallback to true if not specified
  const [isDark, setIsDark] = useState(
    props.isDark !== undefined ? props.isDark : true,
  );

  // Check session storage for theme on component mount
  useEffect(() => {
    const savedTheme = sessionStorage.getItem("theme");
    if (savedTheme) {
      setIsDark(savedTheme === "dark");
    }
  }, []);

  // Update local state when props change
  useEffect(() => {
    if (props.isDark !== undefined) {
      setIsDark(props.isDark);
    }
  }, [props.isDark]);

  const textColorClass = isDark ? "text-gray-100" : "text-gray-700";
  const linkTextColorClass = isDark ? "text-gray-100" : "text-gray-700";
  const bgClass = isDark ? "bg-gray-800" : "bg-white";
  const borderClass = isDark ? "border-gray-700" : "border-gray-200";

  const defaultTitle = "Fastro Social";
  const headerTitle = props.isLogin ? props.message : defaultTitle;

  // Close dropdown when clicking outside
  const handleClickOutside = () => {
    if (menuOpen) {
      setMenuOpen(false);
      document.removeEventListener("click", handleClickOutside);
    }
  };

  // Toggle dropdown and add/remove event listener
  const toggleMenu = (e: MouseEvent) => {
    e.stopPropagation();
    if (!menuOpen) {
      setMenuOpen(true);
      // Add click outside listener with a delay to prevent immediate closing
      setTimeout(() => {
        document.addEventListener("click", handleClickOutside);
      }, 0);
    } else {
      setMenuOpen(false);
      document.removeEventListener("click", handleClickOutside);
    }
  };

  return (
    <div
      class={`container flex justify-between max-w-6xl mx-auto text-center text-sm py-2 px-2 ${textColorClass}`}
    >
      <div class={`flex space-x-2 items-center`}>
        <a href="/" class={`text-gray-100`}>
          <div
            class={`border-[1px] border-gray-600 bg-gray-900 rounded-full p-[1px]`}
          >
            <BoltSvg />
          </div>
        </a>
        <span class={`${textColorClass}`}>
          {headerTitle}
        </span>
      </div>
      <div class={`flex items-center space-x-3`}>
        {!props.isLogin && (
          <a
            class={`${linkTextColorClass}`}
            href={props.base_url
              ? props.base_url + "/auth/github/signin"
              : `/auth/github/signin`}
          >
            Sign in
          </a>
        )}

        <a
          aria-label="user profile"
          class={`${linkTextColorClass}`}
          href={props.isLogin
            ? props.html_url
            : "https://github.com/fastrodev/social"}
        >
          {!props.avatar_url ? <GithubSvg /> : (
            <img
              loading="lazy"
              src={props.avatar_url}
              width={24}
              class={`rounded-full`}
            />
          )}
        </a>

        {props.isLogin && (
          <div class="relative">
            <button
              type="button"
              onClick={toggleMenu}
              class={`${linkTextColorClass} p-1 rounded-full hover:bg-gray-700/30`}
              aria-label="More options"
            >
              <VDotsIcon />
            </button>

            {menuOpen && (
              <div
                class={`absolute right-0 mt-2 w-36 rounded-md shadow-lg py-1 ${bgClass} border ${borderClass} z-50`}
              >
                <a
                  href="/auth/signout"
                  class={`block px-4 py-2 text-sm ${linkTextColorClass} hover:bg-gray-700/30`}
                >
                  Sign out
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
