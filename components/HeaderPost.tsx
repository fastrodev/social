import { useEffect, useState } from "preact/hooks";
import BoltSvg from "@app/components/icons/bolt.tsx";
import { VDotsIcon } from "@app/components/icons/vdots.tsx";

export default function HeaderPost(
  props: {
    // isLogin: boolean;
    // avatar_url: string;
    html_url?: string;
    base_url?: string;
    title?: string;
    previous_url?: string;
    isDark?: boolean;
    message?: string;
    showOptions?: boolean;
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

  const headerTitle = props.message;

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
      class={`container flex justify-between max-w-6xl mx-auto text-center text-sm py-4 px-2 ${textColorClass}`}
    >
      <div class={`flex space-x-2 items-center`}>
        <div
          class={`text-gray-100 border-[1px] border-gray-600 bg-gray-900 rounded-full p-[1px]`}
        >
          <BoltSvg />
        </div>
        <span
          class={`${textColorClass} truncate max-w-[200px] sm:max-w-[300px]`}
          title={headerTitle}
        >
          {headerTitle}
        </span>
      </div>
      <div class={`flex items-center space-x-3`}>
        <div class="relative">
          {props.showOptions && (
            <button
              type="button"
              onClick={toggleMenu}
              class={`${linkTextColorClass} p-1 rounded-full hover:bg-gray-700/30`}
              aria-label="More options"
            >
              <VDotsIcon />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
