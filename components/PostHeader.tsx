import { VDotsIcon } from "@app/components/icons/vdots.tsx";
import { PostMenuButton } from "./PostMenuButton.tsx";
import { ShareIcon } from "@app/components/icons/share.tsx";
import { EditIcon } from "@app/components/icons/edit.tsx";
import { DeleteIcon } from "@app/components/icons/delete.tsx";
import { Post } from "@app/modules/index/type.ts";
import { HeartIcon } from "./icons/heart.tsx";

interface PostHeaderProps {
  post: Post & {
    formattedDate: string;
    isAuthor: boolean;
    isAdmin: boolean;
  };
  isDark: boolean;
  menuOpenForPost: string | null;
  onMenuToggle: (postId: string) => void;
  onShare: (postId: string) => void;
  onEdit: (postId: string) => void;
  onDelete: (postId: string) => void;
}

export function PostHeader({
  post,
  isDark,
  menuOpenForPost,
  onMenuToggle,
  onShare,
  onEdit,
  onDelete,
}: PostHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-3">
      {/* Left side: Avatar and Author */}
      <div className="flex items-center">
        <div className="mt-1 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
          <img
            src={post.avatar}
            alt={post.author}
            className="w-full h-full rounded-full"
          />
        </div>
        <div className="ml-3">
          <p
            className={`font-medium ${
              isDark ? "text-gray-50" : "text-gray-900"
            }`}
          >
            {post.author}
          </p>
          <p
            className={`text-xs ${isDark ? "text-gray-200" : "text-gray-700"}`}
          >
            {post.formattedDate}
          </p>
        </div>
      </div>

      {/* Right side: Icon Button */}
      <div className="relative">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onMenuToggle(post.id);
          }}
          className={`p-1.5 rounded-full hover:bg-gray-700/40 transition-colors ${
            isDark
              ? "text-gray-200 hover:text-gray-50"
              : "text-gray-700 hover:text-gray-900"
          }`}
          aria-label="Post options"
        >
          <VDotsIcon />
        </button>

        {menuOpenForPost === post.id && (
          <div
            className={`absolute right-0 top-[120%] w-48 rounded-xl shadow-lg py-2 z-50 ${
              isDark
                ? "bg-gray-800/95 border border-purple-500/20 backdrop-blur-sm transition-all duration-300 hover:shadow-purple-500/10 hover:border-purple-500/30"
                : "bg-white/95 border border-purple-400/20 backdrop-blur-sm transition-all duration-300 hover:shadow-purple-400/10 hover:border-purple-400/30"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-1">
              <PostMenuButton
                icon={<ShareIcon />}
                label="Share post"
                onClick={() => onShare(post.id)}
                isDark={isDark}
              />

              <PostMenuButton
                icon={<HeartIcon />}
                label="Sponsor post"
                onClick={() => void 0}
                isDark={isDark}
              />

              {post.isAuthor && (
                <PostMenuButton
                  icon={<EditIcon />}
                  label="Edit post"
                  onClick={() => onEdit(post.id)}
                  isDark={isDark}
                />
              )}

              {(post.isAdmin || post.isAuthor) && (
                <PostMenuButton
                  icon={<DeleteIcon />}
                  label="Delete post"
                  onClick={() => onDelete(post.id)}
                  isDark={isDark}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
