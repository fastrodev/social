// deno-lint-ignore-file
import { Comment, Post } from "@app/modules/index/type.ts";
import { CommentIcon } from "@app/components/icons/comment.tsx";
import { ViewIcon } from "@app/components/icons/view.tsx";
import { VDotsIcon } from "@app/components/icons/vdots.tsx";
import { ShareIcon } from "@app/components/icons/share.tsx";
import { EditIcon } from "@app/components/icons/edit.tsx";
import { DeleteIcon } from "@app/components/icons/delete.tsx";
import { useEffect, useState } from "preact/hooks";

interface Props {
  post: Post;
  comments: Comment[];
  data: {
    isLogin: boolean;
    author: string;
  };
  isDark: boolean;
  isMobile: boolean;
  onCommentAdded?: () => void;
}

export function PostDetail(
  { post, comments, data, isDark, isMobile, onCommentAdded }: Props,
) {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [newComment, setNewComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setMenuOpen(false);
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleDeletePost = async () => {
    if (!confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      const response = await fetch(`/api/post/${post.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Redirect to home page after successful deletion
        window.location.href = "/";
      } else {
        console.error("Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

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

  const handleEditPost = () => {
    window.location.href = `/post/${post.id}?edit=true`;
  };

  const handleSubmitComment = async (e: Event) => {
    e.preventDefault();
    if (!newComment.trim() || !data.isLogin) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/post/${post.id}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newComment,
        }),
      });

      if (response.ok) {
        setNewComment("");
        if (onCommentAdded) {
          onCommentAdded();
        }
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const themeStyles = {
    cardBg: isDark ? "bg-gray-800/90" : "bg-white/90",
    text: isDark ? "text-gray-100" : "text-gray-800",
    footer: isDark ? "text-gray-400" : "text-gray-600",
    link: isDark
      ? "text-purple-400 hover:text-purple-300"
      : "text-purple-600 hover:text-purple-500",
    cardBorder: isDark ? "border-gray-700" : "border-gray-200",
    cardGlow: isMobile
      ? "" // No shadow on mobile
      : isDark
      ? "shadow-[0_0_12px_3px_rgba(168,85,247,0.45)]" // Purple glow for dark mode
      : "shadow-[0_0_10px_2px_rgba(156,163,175,0.45)]", // Gray glow for light mode
    inputBg: isDark ? "bg-gray-700" : "bg-gray-100",
    buttonBg: isDark
      ? "bg-purple-600 hover:bg-purple-700"
      : "bg-purple-500 hover:bg-purple-600",
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Post Card */}
      <div
        className={`${themeStyles.cardBg} flex flex-col rounded-lg px-4 py-3 border ${themeStyles.cardBorder} ${themeStyles.cardGlow} relative mb-6`}
      >
        {/* Post Header */}
        <div className="flex items-center justify-between mb-3">
          {/* Left side: Avatar and Author */}
          <div className="flex items-center">
            <div className="mt-1 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
              <img
                src={post.avatar}
                alt={post.author}
                className="w-full h-full rounded-full"
              />
            </div>
            <div className="ml-3">
              <p className={`font-medium ${themeStyles.text}`}>
                {post.author}
              </p>
              <p className="text-gray-500 text-xs">
                {new Date(post.timestamp).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Right side: Options Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setMenuOpen(!menuOpen);
              }}
              className={`p-1.5 rounded-full hover:bg-gray-700/30 transition-colors ${
                isDark
                  ? "text-gray-400 hover:text-gray-200"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              aria-label="Post options"
            >
              <VDotsIcon />
            </button>

            {menuOpen && (
              <div
                className={`absolute right-0 top-full mt-1 w-36 rounded-md shadow-lg z-50 ${
                  isDark
                    ? "bg-gray-800 border border-gray-700"
                    : "bg-white border border-gray-200"
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Share option for all users */}
                <button
                  onClick={handleSharePost}
                  className={`flex items-center w-full gap-x-2 px-4 py-2 text-sm ${
                    isDark
                      ? "text-gray-200 hover:bg-gray-700"
                      : "text-gray-700 hover:bg-gray-100"
                  } rounded-md`}
                >
                  <ShareIcon />
                  <span className="font-medium">
                    Share post
                  </span>
                </button>

                {/* Edit option only for post author */}
                {data.author === post.author && (
                  <button
                    onClick={handleEditPost}
                    className={`flex items-center w-full gap-x-2 px-4 py-2 text-sm ${
                      isDark
                        ? "text-gray-200 hover:bg-gray-700"
                        : "text-gray-700 hover:bg-gray-100"
                    } rounded-md`}
                  >
                    <EditIcon />
                    <span className="font-medium">
                      Edit post
                    </span>
                  </button>
                )}

                {/* Delete option only for post author or admin */}
                {(data.author === post.author) ||
                  (data.author === "ynwd") && (
                      <button
                        onClick={handleDeletePost}
                        className={`flex items-center w-full gap-x-2 px-4 py-2 text-sm ${
                          isDark
                            ? "text-gray-200 hover:bg-gray-700"
                            : "text-gray-700 hover:bg-gray-100"
                        } rounded-md`}
                      >
                        <DeleteIcon />
                        <span className="font-medium">
                          Delete post
                        </span>
                      </button>
                    )}
              </div>
            )}
          </div>
        </div>

        {/* Post Image */}
        <div className="-mx-4 mb-5 relative">
          <div className="w-full max-h-[600px]">
            <img
              src={post.image || post.defaultImage}
              alt="Post attachment"
              className="w-full max-h-[600px] object-cover"
            />
          </div>

          {/* Tags overlay */}
          {post.tags && post.tags.length > 0 && (
            <div className="absolute top-2 right-2 flex flex-wrap gap-1 justify-end max-w-[70%]">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    isDark
                      ? "bg-purple-800/80 text-purple-200 backdrop-blur-sm"
                      : "bg-purple-100/90 text-purple-700 backdrop-blur-sm"
                  }`}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Post Title */}
        {post.title && (
          <h1 className={`text-2xl font-bold ${themeStyles.text} mb-3`}>
            {post.title}
          </h1>
        )}

        {/* Post Content */}
        <div className={`${themeStyles.text} mb-6 whitespace-pre-wrap`}>
          {post.content}
        </div>

        {/* Post Footer Stats */}
        <div className="flex items-center justify-between border-t border-b py-3 mb-6 mt-auto">
          <div className={`flex items-center gap-x-1 ${themeStyles.footer}`}>
            <CommentIcon />
            <span>
              {comments.length} {comments.length === 1 ? "comment" : "comments"}
            </span>
          </div>

          <div className={`flex items-center gap-x-2 ${themeStyles.footer}`}>
            <span className="flex items-center gap-x-2">
              <ViewIcon />
              {post.views || post.viewCount || 0}{" "}
              {(post.views || post.viewCount || 0) === 1 ? "view" : "views"}
            </span>
          </div>
        </div>

        {/* Comments Section */}
        <div>
          <h2 className={`text-xl font-bold ${themeStyles.text} mb-4`}>
            Comments
          </h2>

          {/* Add Comment Form */}
          {data.isLogin
            ? (
              <form onSubmit={handleSubmitComment} className="mb-6">
                <textarea
                  value={newComment}
                  onChange={(e) =>
                    setNewComment((e.target as HTMLTextAreaElement).value)}
                  className={`w-full px-4 py-2 rounded-lg ${themeStyles.inputBg} ${themeStyles.text} border ${themeStyles.cardBorder} mb-2`}
                  placeholder="Add a comment..."
                  rows={3}
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-4 py-2 rounded-md text-white font-medium ${themeStyles.buttonBg} transition-colors ${
                    isSubmitting ? "opacity-70" : ""
                  }`}
                >
                  {isSubmitting ? "Posting..." : "Post Comment"}
                </button>
              </form>
            )
            : (
              <p className={`${themeStyles.footer} mb-6`}>
                <a href="/login" className={themeStyles.link}>Sign in</a>{" "}
                to leave a comment
              </p>
            )}

          {/* Comment List */}
          {comments.length > 0
            ? (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`p-4 rounded-lg border ${themeStyles.cardBorder} ${themeStyles.cardBg}`}
                  >
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        <img
                          src={comment.avatar}
                          alt={comment.author}
                          className="w-full h-full rounded-full"
                        />
                      </div>
                      <div className="ml-2">
                        <p className={`font-medium ${themeStyles.text}`}>
                          {comment.author}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {new Date(comment.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <p className={`${themeStyles.text} whitespace-pre-wrap`}>
                      {comment.content}
                    </p>
                  </div>
                ))}
              </div>
            )
            : (
              <p className={themeStyles.footer}>
                No comments yet. Be the first to comment!
              </p>
            )}
        </div>
      </div>
    </div>
  );
}

export function DetailSkeleton({ isDark }: { isDark: boolean }) {
  const themeStyles = {
    cardBg: isDark ? "bg-gray-800/90" : "bg-white/90",
    cardBorder: isDark ? "border-gray-700" : "border-gray-200",
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div
        className={`${themeStyles.cardBg} flex flex-col rounded-lg px-4 py-3 border ${themeStyles.cardBorder} relative mb-6`}
      >
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="mt-1 w-10 h-10 bg-gray-700/50 rounded-full animate-pulse flex-shrink-0" />
            <div className="ml-3">
              <div className="h-5 bg-gray-700/50 rounded w-28 animate-pulse" />
              <div className="h-3 bg-gray-700/50 rounded w-24 animate-pulse mt-1.5" />
            </div>
          </div>
        </div>

        {/* Image Skeleton */}
        <div className="-mx-4 mb-5">
          <div className="w-full h-[400px] bg-gray-700/50 animate-pulse" />
        </div>

        {/* Title Skeleton */}
        <div className="h-7 bg-gray-700/50 rounded w-3/4 animate-pulse mb-3" />

        {/* Content Skeleton */}
        <div className="space-y-2 mb-6">
          <div className="h-4 bg-gray-700/50 rounded w-full animate-pulse" />
          <div className="h-4 bg-gray-700/50 rounded w-11/12 animate-pulse" />
          <div className="h-4 bg-gray-700/50 rounded w-4/5 animate-pulse" />
          <div className="h-4 bg-gray-700/50 rounded w-full animate-pulse" />
          <div className="h-4 bg-gray-700/50 rounded w-3/4 animate-pulse" />
        </div>

        {/* Footer Skeleton */}
        <div className="flex items-center justify-between border-t border-b py-3 mb-6">
          <div className="flex items-center gap-x-1">
            <div className="w-5 h-5 bg-gray-700/50 rounded animate-pulse" />
            <div className="h-4 bg-gray-700/50 rounded w-24 animate-pulse ml-2" />
          </div>
          <div className="flex items-center gap-x-2">
            <div className="w-5 h-5 bg-gray-700/50 rounded animate-pulse" />
            <div className="h-4 bg-gray-700/50 rounded w-16 animate-pulse" />
          </div>
        </div>

        {/* Comments Section Skeleton */}
        <div className="h-6 bg-gray-700/50 rounded w-32 animate-pulse mb-4" />
        <div className="h-24 bg-gray-700/50 rounded w-full animate-pulse mb-6" />
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className={`p-4 rounded-lg border ${themeStyles.cardBorder} ${themeStyles.cardBg}`}
            >
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-gray-700/50 rounded-full animate-pulse" />
                <div className="ml-2">
                  <div className="h-4 bg-gray-700/50 rounded w-24 animate-pulse" />
                  <div className="h-3 bg-gray-700/50 rounded w-20 animate-pulse mt-1" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-700/50 rounded w-full animate-pulse" />
                <div className="h-3 bg-gray-700/50 rounded w-5/6 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
