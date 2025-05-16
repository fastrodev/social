import BoltSvg from "@app/components/icons/bolt.tsx";
import { useEffect, useState } from "preact/hooks";

export default function Welcome() {
  const [loadingText, setLoadingText] = useState("Getting Ready");

  useEffect(() => {
    const checkLoadingCookie = () => {
      const hasLoaded = document.cookie.includes("has_loaded=true");

      if (!hasLoaded) {
        setLoadingText(
          "Create content, spread value, earn points, and unlock profit sharing when your content lands a sponsor.",
        );

        const date = new Date();
        date.setTime(date.getTime() + (15 * 60 * 1000)); // 15 minutes
        document.cookie =
          `has_loaded=true; expires=${date.toUTCString()}; path=/`;
      }
    };

    checkLoadingCookie();
  }, []);

  return (
    <div className={`m-3 text-center space-y-3 `}>
      <div className="flex justify-center">
        <div className="text-white-400 border border-gray-600/50 bg-gray-900 rounded-full p-2 sm:p-3 animate-spin hover:animate-pulse transition-all duration-[5000ms]">
          <BoltSvg width="24" height="24" className="sm:h-8 sm:w-8" />
        </div>
      </div>
      <p className="text-base mx-auto sm:text-xl opacity-80 max-w-xs sm:max-w-[400px]">
        {loadingText}
      </p>
    </div>
  );
}
