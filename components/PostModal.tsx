import { Post } from "@app/modules/index/type.ts";
import HeaderPost from "./HeaderPost.tsx";
import { XIcon } from "./icons/x.tsx";
import { useEffect } from "preact/hooks";

export function PostModal({
  selectedPost,
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
    <div
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-2 flex-shrink-0">
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
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-500 p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
