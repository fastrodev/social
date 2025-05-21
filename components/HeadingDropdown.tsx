import { JSX } from "preact/jsx-runtime";
import { useEffect, useRef, useState } from "preact/hooks";

interface HeadingDropdownProps {
  isDark: boolean;
  showPreviewMode: boolean;
  handleHeadingFormatting: (level: "h1" | "h2" | "h3" | "normal") => void;
}

export function HeadingDropdown({
  isDark,
  showPreviewMode,
  handleHeadingFormatting,
}: HeadingDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const handleSelect = (
    e: JSX.TargetedEvent<HTMLButtonElement, MouseEvent>,
    level: "h1" | "h2" | "h3" | "normal",
  ) => {
    e.preventDefault();
    handleHeadingFormatting(level);
    setOpen(false);
  };

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prevOpen) => !prevOpen)}
        className={`p-1.5 sm:px-1 rounded text-sm ${
          isDark
            ? "text-gray-300 hover:bg-gray-700/50 hover:text-purple-400"
            : "text-gray-600 hover:bg-gray-200 hover:text-purple-600"
        } transition-colors disabled:opacity-50 flex items-center justify-center min-w-[28px]`}
        disabled={showPreviewMode}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Toggle Heading Dropdown"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="icon icon-tabler icons-tabler-outline icon-tabler-heading"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M7 12h10" />
          <path d="M7 4v16" />
          <path d="M17 4v16" />
        </svg>
      </button>
      {open && (
        <div
          ref={dropdownRef}
          className={`absolute left-0 mt-1 w-40 rounded-md shadow-lg ${
            isDark
              ? "bg-gray-800 border border-gray-700"
              : "bg-white border border-gray-200"
          } ring-1 ring-black ring-opacity-5`}
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="options-menu"
          style={{ position: "fixed", top: "auto", left: "auto" }}
        >
          {[
            { label: "Heading 1", value: "h1" },
            { label: "Heading 2", value: "h2" },
            { label: "Heading 3", value: "h3" },
            { label: "Normal text", value: "normal" },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={(e) =>
                handleSelect(e, item.value as "h1" | "h2" | "h3" | "normal")}
              className={`block w-full text-left px-4 py-2 text-sm ${
                isDark
                  ? "text-gray-300 hover:bg-gray-700 hover:text-purple-400"
                  : "text-gray-700 hover:bg-gray-100 hover:text-purple-600"
              }`}
              role="menuitem"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
