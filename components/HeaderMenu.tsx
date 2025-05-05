// deno-lint-ignore-file
import { AccountIcon } from "./icons/account.tsx";
import { AnalyticsIcon } from "./icons/analytics.tsx";
import { DollarIcon } from "./icons/dollar.tsx";
import { PrefenceIcon } from "./icons/preference.tsx";
import { SettingIcon } from "./icons/setting.tsx";
import { SignOutIcon } from "./icons/signout.tsx";
import MenuItem from "./MenuItem.tsx";
import { useRef } from "preact/hooks";

interface HeaderMenuProps {
  isDark?: boolean;
  onClose?: () => void;
  onClick?: (e: MouseEvent) => void;
}

export function HeaderMenu(
  { isDark = true, onClose, onClick }: HeaderMenuProps,
) {
  const menuRef = useRef<HTMLDivElement>(null);
  const bgClass = isDark ? "bg-gray-800/95" : "bg-white/95";
  const borderClass = isDark ? "border-gray-700/50" : "border-gray-200/50";
  const glowClass = isDark
    ? "shadow-[0_8px_32px_rgba(0,0,0,0.55)] backdrop-blur-lg ring-1 ring-gray-700/30"
    : "shadow-[0_8px_32px_rgba(229,231,235,0.65)] backdrop-blur-lg ring-1 ring-gray-200/30";

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    onClick?.(e);
  };

  return (
    <div
      ref={menuRef}
      class={`
        absolute right-0 mt-3 w-64 
        rounded-lg py-2 
        ${bgClass} 
        border ${borderClass}
        ${glowClass}
        transition-all duration-200 ease-in-out
        z-50
      `}
      onClick={handleClick}
    >
      <div class="space-y-0.5">
        <MenuItem
          icon={<AnalyticsIcon />}
          label="Analytics"
          disabled={true}
        />
        <MenuItem
          icon={<DollarIcon />}
          label="Billing"
          disabled={true}
        />
        <MenuItem
          icon={<PrefenceIcon />}
          label="Preferences"
          disabled={true}
        />
        <MenuItem
          icon={<SettingIcon />}
          label="Settings"
          disabled={true}
        />
        <MenuItem
          icon={<AccountIcon />}
          label="Account"
          disabled={true}
        />
        <MenuItem
          icon={<SignOutIcon />}
          label="Sign out"
          href="/auth/signout"
          onClick={onClose}
        />
      </div>
    </div>
  );
}
