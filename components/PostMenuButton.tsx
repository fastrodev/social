import { JSX } from "preact";

interface PostMenuButtonProps {
  icon: JSX.Element;
  label: string;
  onClick?: () => void;
  isDark?: boolean;
  disabled?: boolean;
}

export function PostMenuButton({
  icon,
  label,
  onClick,
  isDark = true,
  disabled = false,
}: PostMenuButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center w-full gap-x-3 px-3 py-2.5 text-sm
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${
        isDark
          ? "text-gray-200 hover:bg-gray-700/70"
          : "text-gray-700 hover:bg-gray-100/70"
      }
        rounded-lg transition-colors duration-200
      `}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}
