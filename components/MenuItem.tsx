import { JSX } from "preact/jsx-runtime";
import { ArrowRightIcon } from "./icons/arrow.tsx";

type MenuItemProps = {
  icon: JSX.Element;
  label: string;
  href?: string;
  disabled?: boolean;
  onClick?: () => void;
};

export default function MenuItem({
  icon,
  label,
  href,
  disabled = false,
  onClick,
}: MenuItemProps) {
  const content = (
    <>
      <div class="flex justify-start gap-x-3 items-center">
        {icon}
        <span>{label}</span>
      </div>
      <ArrowRightIcon />
    </>
  );

  const commonClasses =
    "flex justify-between gap-x-3 px-5 py-3 items-center text-sm";
  const disabledClasses = "text-gray-500 cursor-not-allowed";
  const enabledClasses = "hover:bg-gray-700/30 transition-colors duration-200";

  if (disabled) {
    return (
      <div class={`${commonClasses} ${disabledClasses}`}>
        {content}
      </div>
    );
  }

  return href
    ? (
      <a
        href={href}
        class={`${commonClasses} ${enabledClasses}`}
        onClick={onClick}
      >
        {content}
      </a>
    )
    : (
      <button
        type="button"
        class={`${commonClasses} ${enabledClasses}`}
        onClick={onClick}
      >
        {content}
      </button>
    );
}
