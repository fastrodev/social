// deno-lint-ignore-file
import { Comment, Post } from "@app/modules/index/type.ts";
import { CommentIcon } from "@app/components/icons/comment.tsx";
import { ViewIcon } from "@app/components/icons/view.tsx";
import { VDotsIcon } from "@app/components/icons/vdots.tsx";
import { ShareIcon } from "@app/components/icons/share.tsx";
import { useState } from "preact/hooks";

import { renderMarkdownWithHashtags as renderMarkdown } from "../utils/markdown.ts";

interface Props {
  post: Post;
  comments: Comment[];
  data: {
    isLogin: boolean;
    author: string;
  };
  isDark: boolean;
  isMobile: boolean;
  onCommentAdded?: () => void; // Add this line
  isLoading?: boolean;
}

export function PostDetail(
  { post, comments, data, isDark, isMobile, isLoading }: Props,
) {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [newComment, setNewComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSharePost = async () => {
    const postUrl = `https://social.fastro.dev/post/${post.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title || "Check out this post",
          url: postUrl,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(postUrl)
        .then(() => {
          alert("Link copied to clipboard!");
        })
        .catch((err) => {
          console.error("Failed to copy link:", err);
        });
    }
  };

  return (
    <main className="max-w-2xl mx-auto relative flex flex-col gap-y-3 sm:gap-y-6">
      <div
        className={`bg-gray-800/90 rounded-lg shadow-[0_0_35px_rgba(147,51,234,0.3)] px-4 py-3 border border-gray-700 backdrop-blur-lg mb-0 sm:mb-4 relative`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="mt-1 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
              <img
                src={post.avatar}
                alt={post.author}
                className="w-full h-full rounded-full"
              />
            </div>
            <div className="ml-4">
              <p className="font-medium text-sm text-gray-100">{post.author}</p>
              <p className="text-gray-500 text-xs">
                {new Date(post.timestamp).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="relative">
            <button
              type="button"
              className="p-1 rounded-full hover:bg-gray-700/30 text-gray-100 ml-4"
              aria-label="Post options"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
            >
              <VDotsIcon />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-1 w-36 rounded-md shadow-lg bg-gray-800 border border-gray-700 z-20">
                <button
                  onClick={handleSharePost}
                  className="flex items-center w-full gap-x-2 px-4 py-2 text-sm text-gray-200 hover:bg-gray-700/30"
                >
                  <ShareIcon />
                  <span>Share post</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Image */}
        {post.image && (
          <div className="-mx-4 mb-4">
            <img
              src={post.image}
              alt="Post image"
              className="w-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div
            className="flex flex-wrap gap-2 mb-3 text-xs font-normal py-2 rounded"
            style={{ lineHeight: "1.6" }}
          >
            {post.tags.map((tag) => (
              <a
                key={tag}
                href={`/tag/${tag}`}
                className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-purple-800/40 text-purple-200"
                style={{ fontWeight: "400" }}
              >
                #{tag}
              </a>
            ))}
          </div>
        )}

        {/* Content */}
        {
          /* <div className="markdown-body prose prose-sm dark:prose-invert max-w-none text-gray-100">
          <p>{post.content}</p>
        </div> */
        }

        <div
          className={`markdown-body prose prose-sm dark:prose-invert max-w-none text-gray-100`}
          dangerouslySetInnerHTML={renderMarkdown(post.content)}
        />

        {/* Stats */}
        <div className="flex items-center justify-between -mx-6 px-6 py-3 space-x-4 border-t border-b border-gray-700/50 mb-4">
          <div className="flex items-center gap-x-1 text-gray-400 text-xs">
            <span className="flex items-center">
              <CommentIcon />
              {comments.length} comments
            </span>
          </div>
          <div className="flex items-center gap-x-1 text-gray-400 text-xs">
            <span className="flex items-center gap-x-2">
              <ViewIcon />
              {post.views || 0} views
            </span>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-2 sm:mt-4 pt-0">
          {/* Comment List */}
          <div className="space-y-4 mb-6">
            {comments.length === 0 && (
              <div className="text-center py-4 text-gray-100 opacity-70 text-sm">
                No comments yet. Be the first to comment!
              </div>
            )}
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="p-4 rounded-lg border border-gray-700 bg-gray-800/90"
              >
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <img
                      src={comment.avatar}
                      alt={comment.author}
                      className="w-full h-full rounded-full"
                    />
                  </div>
                  <div className="ml-2">
                    <p className="font-medium text-gray-100">
                      {comment.author}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {new Date(comment.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="text-gray-100 whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            ))}
          </div>

          {/* Login to Comment */}
          {!data.isLogin && (
            <div
              className="text-center py-4 text-gray-100 opacity-70 text-sm -mx-6 mt-6 pt-6 px-6 border-t"
              style={{ borderColor: "rgba(255,255,255,0.1)" }}
            >
              Please{" "}
              <a href="/" className="text-purple-400 hover:text-purple-300">
                login
              </a>{" "}
              to comment.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
