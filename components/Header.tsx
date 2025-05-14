import { useEffect, useRef, useState } from "preact/hooks";
import BoltSvg from "@app/components/icons/bolt.tsx";
import GithubSvg from "@app/components/icons/github-svg.tsx";
// import { VDotsIcon } from "@app/components/icons/vdots.tsx";
import { HeaderMenu } from "./HeaderMenu.tsx";
import { PrismIcon } from "./icons/prism.tsx";
import { CakeIcon } from "./icons/cake.tsx";
import { TalentIcon } from "./icons/talent.tsx";
import { JobIcon } from "./icons/job.tsx";
import { BulbIcon } from "./icons/bulb.tsx";

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
  // const defaultTitle = "Fastro Social";
  // const headerTitle = props.isLogin ? props.message : defaultTitle;

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
      class={`container flex justify-between items-center max-w-6xl mx-auto text-center text-xs px-4 py-3 gap-x-3 ${textColorClass}`}
    >
      <a href="/" class={`text-gray-100`}>
        <div class={`flex flex-col items-center`}>
          <div
            class={`border-[2px] border-gray-100 bg-gray-900 rounded-full p-[1px]`}
          >
            <BoltSvg height="18" width="18" />
          </div>

          <span class={`${textColorClass} text-center`}>
            Unstable
          </span>
        </div>
      </a>
      <div class={`flex items-center gap-x-6 text-xs`}>
        <a
          href="#"
          class={`${linkTextColorClass} flex flex-col items-center rounded-full `}
        >
          <JobIcon />
          <span>Jobs</span>
        </a>
        <a
          href="#"
          class={`${linkTextColorClass} flex flex-col items-center rounded-full `}
        >
          <TalentIcon />
          <span>Talents</span>
        </a>
        <a
          href="#"
          class={`${linkTextColorClass} flex flex-col items-center rounded-full `}
        >
          <PrismIcon />
          <span>Projects</span>
        </a>
        <a
          href="#"
          class={`${linkTextColorClass} flex flex-col items-center rounded-full `}
        >
          <BulbIcon />
          <span>Ideas</span>
        </a>
        <a
          href="#"
          class={`${linkTextColorClass} flex flex-col items-center rounded-full`}
        >
          <CakeIcon />
          <span>Stories</span>
        </a>

        {!props.isLogin && (
          <a
            class={`${linkTextColorClass} flex flex-col items-center rounded-full`}
            href={props.base_url
              ? props.base_url + "/auth/github/signin"
              : `/auth/github/signin`}
          >
            {!props.avatar_url ? <GithubSvg /> : (
              <img
                loading="lazy"
                src={props.avatar_url}
                width={18}
                class={`rounded-full text-center`}
              />
            )}
            <span>Login</span>
          </a>
        )}

        {props.isLogin && (
          <div class="relative">
            <button
              ref={buttonRef}
              type="button"
              onClick={toggleMenu}
              class={`${linkTextColorClass} p-1 rounded-full hover:bg-gray-700/30`}
              aria-label="More options"
            >
              <img
                loading="lazy"
                src={props.avatar_url}
                width={36}
                class={`rounded-full`}
              />
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
