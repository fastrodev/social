import { useEffect, useRef, useState } from "preact/hooks";
import BoltSvg from "@app/components/icons/bolt.tsx";
import GithubSvg from "@app/components/icons/github-svg.tsx";
import { VDotsIcon } from "@app/components/icons/vdots.tsx";
import { HeaderMenu } from "./HeaderMenu.tsx";

export default function Header(
  props: {
    isLogin: boolean;
    avatar_url: string;
    html_url?: string;
    base_url?: string;
    title?: string;
    previous_url?: string;
    isDark?: boolean;
    message?: string;
  },
) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(
    props.isDark !== undefined ? props.isDark : true,
  );

  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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
  const defaultTitle = "Fastro Social";
  const headerTitle = props.isLogin ? props.message : defaultTitle;

  const toggleMenu = (e: MouseEvent) => {
    e.stopPropagation();
    setMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        menuOpen &&
        !buttonRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <div
      class={`container flex justify-between max-w-6xl mx-auto text-center text-sm p-3 ${textColorClass}`}
    >
      <a href="/" class={`text-gray-100`}>
        <div class={`flex space-x-2 items-center`}>
          <div
            class={`border-[1px] border-gray-600 bg-gray-900 rounded-full p-[1px]`}
          >
            <BoltSvg />
          </div>

          <span class={`${textColorClass}`}>
            {headerTitle} {`${props.isLogin ? "" : "(Unstable)"} `}
          </span>
        </div>
      </a>
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
              width={18}
              class={`rounded-full`}
            />
          )}
        </a>

        {props.isLogin && (
          <div class="relative">
            <button
              ref={buttonRef}
              type="button"
              onClick={toggleMenu}
              class={`${linkTextColorClass} p-1 rounded-full hover:bg-gray-700/30`}
              aria-label="More options"
            >
              <VDotsIcon />
            </button>

            {menuOpen && (
              <div ref={menuRef}>
                <HeaderMenu
                  isDark={isDark}
                  onClose={() => setMenuOpen(false)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
