import { Post } from "@app/modules/index/type.ts";
import HeaderPost from "./HeaderPost.tsx";
import { XIcon } from "./icons/x.tsx";
import { useEffect } from "preact/hooks";

export function PostModal({
  selectedPost,
  isDark,
  onClose,
  children,
}: {
  selectedPost: Post;
  isDark: boolean;
  onClose: () => void;
  children?: preact.ComponentChildren;
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        className={`relative w-full h-full max-w-2xl mx-auto ${
          isDark
            ? "bg-gray-800 border border-gray-700"
            : "bg-white border border-gray-200"
        } shadow-xl rounded-lg flex flex-col`}
      >
        <div className="flex justify-between items-center px-2">
          <HeaderPost
            message={`${selectedPost.title} by ${selectedPost.author}`}
          >
          </HeaderPost>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-700/30"
            aria-label="Close"
          >
            <XIcon />
          </button>
        </div>
        <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 h-full">
          {children}
        </div>
      </div>
    </div>
  );
}
