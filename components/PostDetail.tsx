// deno-lint-ignore-file
import { Comment, Post } from "@app/modules/index/type.ts";
import { CommentIcon } from "@app/components/icons/comment.tsx";
import { ViewIcon } from "@app/components/icons/view.tsx";
import { VDotsIcon } from "@app/components/icons/vdots.tsx";
import { ShareIcon } from "@app/components/icons/share.tsx";
import { useEffect, useRef, useState } from "preact/hooks";
import { renderMarkdownWithHashtags as renderMarkdown } from "../utils/markdown.ts";
import { JSX } from "preact/jsx-runtime";

interface Props {
  base_url: string;
  post: Post;
  comments: Comment[];
  data: {
    isLogin: boolean;
    author: string;
    avatar_url: string;
  };
  isDark: boolean;
  isMobile: boolean;
  isLoading?: boolean;
}

export function PostDetail(
  {
    post,
    data,
    isDark,
    isMobile,
    isLoading,
    comments: initialComments,
    base_url,
  }: Props,
) {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [newComment, setNewComment] = useState<string>("");
  const [comments, setComments] = useState<Comment[]>(initialComments); // Initialize with prop
  const [_isSubmitting, setIsSubmitting] = useState(false);
  const [postData, setPostData] = useState<Post>(post);
  const imageRef = useRef<HTMLImageElement>(null);

  // Add effect to update comments when prop changes
  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  // Theme styles
  const themeStyles = {
    background: isDark ? "#0f172a" : "#f8fafc",
    cardBg: isDark ? "bg-gray-800/90" : "bg-white/90",
    text: isDark ? "text-gray-100" : "text-gray-800",
    input: isDark
      ? "bg-gray-700/30 border-gray-600 text-white placeholder-gray-400"
      : "bg-gray-100/70 border-gray-300 text-gray-900 placeholder-gray-500",
    button: isDark
      ? "bg-purple-600 hover:bg-purple-700"
      : "bg-purple-500 hover:bg-purple-600",
    footer: isDark ? "text-gray-400" : "text-gray-600",
    link: isDark
      ? "text-purple-400 hover:text-purple-300"
      : "text-purple-600 hover:text-purple-500",
    cardBorder: isDark ? "border-gray-700" : "border-gray-200",
    cardGlow: isDark
      ? "shadow-[0_0_35px_rgba(147,51,234,0.3)]"
      : "shadow-[0_0_20px_rgba(147,51,234,0.15)]",
    hashtag: isDark
      ? "text-blue-400 hover:text-blue-300 font-medium"
      : "text-blue-600 hover:text-blue-500 font-medium",
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

  // Handle comment submission
  const handleCommentSubmit = async (
    e: JSX.TargetedEvent<HTMLFormElement, Event>,
  ) => {
    e.preventDefault();
    if (!commentText.trim() || !data.isLogin) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`${base_url}/api/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: commentText,
          postId: post.id,
        }),
      });

      if (response.ok) {
        const newComment = await response.json();
        setComments([...comments, newComment]);
        setCommentText("");
      } else {
        console.error("Failed to submit comment");
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTextChange = (
    e: JSX.TargetedEvent<HTMLTextAreaElement, Event>,
  ) => {
    setCommentText(e.currentTarget.value);
  };

  // Revised keyboard handling approach
  const handleKeyDown = (
    e: JSX.TargetedEvent<HTMLTextAreaElement, KeyboardEvent>,
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      if (commentText.trim() && data.isLogin) {
        handleCommentSubmit({
          preventDefault: () => {},
        } as unknown as JSX.TargetedEvent<HTMLFormElement, Event>);
      }
    }
  };

  // Handle comment deletion
  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await fetch(`${base_url}/api/comments/${commentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setComments(comments.filter((comment) => comment.id !== commentId));
      } else {
        console.error("Failed to delete comment");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  // Format the date for display
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Toggle dropdown menu
  const toggleDropdown = (e: MouseEvent, commentId: string) => {
    e.stopPropagation(); // Prevent triggering the document click handler
    setOpenDropdownId(openDropdownId === commentId ? null : commentId);
  };

  const fadeInClass = "transition-opacity duration-300 ease-in-out";

  return (
    <main className="max-w-2xl mx-auto relative flex flex-col gap-y-3 sm:gap-y-6">
      {/* Card container */}
      <div
        className={`${fadeInClass} bg-gray-800/90 rounded-lg shadow-[0_0_35px_rgba(147,51,234,0.3)] px-4 py-3 border border-gray-700 backdrop-blur-lg relative`}
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

        {/* Image Container */}
        {post.image && (
          <div className="relative">
            <img
              ref={imageRef}
              src={post.image}
              alt={post.title}
              className="w-full h-auto opacity-0 transition-opacity duration-300"
              onLoad={(e) => {
                const img = e.currentTarget;
                img.classList.remove("opacity-0");
                img.classList.add("opacity-100");
              }}
              style={{
                contain: "paint",
                willChange: "transform",
              }}
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

        <div
          className={`markdown-body prose prose-sm dark:prose-invert max-w-none text-gray-100`}
          dangerouslySetInnerHTML={renderMarkdown(post.content)}
        />

        {/* Stats */}
        <div className="flex items-center justify-between -mx-4 px-4 py-3 space-x-4 border-t border-b border-gray-700/50 mb-4">
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
        {/* Comments section */}
        <div className={`mt-2 sm:mt-4 pt-0`}>
          {/* Display comments */}
          <div className="space-y-4 mb-6">
            {/* Added mb-6 for spacing before input */}
            {isLoading
              ? (
                // Skeleton loaders with fixed alignment
                Array(1).fill(0).map((_, index) => (
                  <div
                    key={`skeleton-${index}`}
                    className={`flex space-x-4 sm:space-x-6 ${themeStyles.text} items-start mb-4 animate-pulse`}
                  >
                    <div className="w-6 h-6 mt-[6px] sm:w-8 sm:h-8 bg-gray-600/30 rounded-full flex-shrink-0">
                    </div>
                    <div className={`flex-grow`}>
                      <div className="flex justify-between items-start mb-2 relative">
                        <div className="flex flex-col">
                          <div className="h-4 w-24 bg-gray-600/30 rounded">
                          </div>
                          <div className="h-3 w-16 bg-gray-600/20 rounded mt-1">
                          </div>
                        </div>
                        <div className="h-6 w-6 bg-gray-600/20 rounded-full">
                        </div>
                      </div>
                      <div className="h-4 w-full bg-gray-600/30 rounded mb-1">
                      </div>
                      <div className="h-4 w-3/4 bg-gray-600/30 rounded">
                      </div>
                    </div>
                  </div>
                ))
              )
              : comments.length > 0
              ? (
                <div className="transition-opacity duration-300 ease-in-out">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className={`flex space-x-4 sm:space-x-6 ${themeStyles.text} items-start mb-4`}
                    >
                      {/* Comment avatar */}
                      <div className="w-6 h-6 mt-[6px] sm:w-8 sm:h-8 bg-blue-500 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                        <img
                          src={comment.avatar}
                          alt={comment.author}
                          className="w-full h-full rounded-full"
                        />
                      </div>
                      <div className={`flex-grow`}>
                        <div className="flex justify-between items-start mb-2 relative">
                          {/* User info */}
                          <div className="flex flex-col">
                            <span className="font-medium text-sm sm:text-base">
                              {comment.author}
                            </span>
                            <span
                              className={`text-xs ${themeStyles.footer}`}
                            >
                              {formatDate(comment.timestamp)}
                            </span>
                          </div>
                          {/* Dots menu with dropdown */}
                          <div className="relative">
                            {/* Only show the menu button if the user is the author of the comment */}
                            {comment.author === data.author && (
                              <button
                                type="button"
                                className={`p-1 rounded-full hover:bg-gray-700/30 ${themeStyles.text}`}
                                aria-label="Comment options"
                                onClick={(e) => toggleDropdown(e, comment.id)}
                              >
                                <VDotsIcon />
                              </button>
                            )}
                            {openDropdownId === comment.id && (
                              <div
                                className={`absolute right-0 mt-1 w-36 rounded-md shadow-lg ${themeStyles.cardBg} ${themeStyles.cardBorder} z-20`}
                              >
                                <div className="py-1">
                                  <button
                                    type="button"
                                    className={`block w-full text-left px-4 py-2 text-sm ${themeStyles.text} hover:bg-red-500/10 hover:text-red-500 transition-colors`}
                                    onClick={() =>
                                      handleDeleteComment(comment.id)}
                                  >
                                    Delete comment
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="whitespace-pre-wrap text-xs sm:text-sm">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )
              : (
                <div
                  className={`text-center py-4 ${themeStyles.text} opacity-70 text-sm`}
                >
                  No comments yet. Be the first to comment!
                </div>
              )}
          </div>

          {/* Comment Input Form */}
          {data.isLogin
            ? (
              <form
                onSubmit={handleCommentSubmit}
                className="flex items-start space-x-4 sm:space-x-6 mt-6 pt-6 border-t" // Added mt-6, pt-6 and border-t
                style={{
                  borderColor: isDark
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.1)",
                }} // Subtle border color
              >
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                  <img
                    src={data.avatar_url}
                    alt="Your avatar"
                    className="w-full h-full rounded-full"
                  />
                </div>
                <div className="flex-grow min-w-0">
                  <textarea
                    placeholder="Add a comment..."
                    value={commentText}
                    onInput={handleTextChange}
                    onKeyDown={handleKeyDown}
                    rows={2}
                    className={`w-full px-4 py-2 rounded-lg border ${themeStyles.input} 
                          resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          scrollbar-thin scrollbar-track-transparent
                          ${
                      isDark
                        ? "scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-500"
                        : "scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400"
                    }`}
                  />
                  {/* Submit Button (Optional but recommended) */}
                  <div className="flex justify-end mt-2">
                    <button
                      type="submit"
                      disabled={!commentText.trim() || _isSubmitting}
                      className={`px-4 py-1.5 rounded-lg text-white text-sm font-medium transition-colors ${themeStyles.button} ${
                        (!commentText.trim() || _isSubmitting)
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      Comment
                    </button>
                  </div>
                </div>
              </form>
            )
            : (
              <div
                className={`text-center py-4 ${themeStyles.text} opacity-70 text-sm -mx-4 mt-6 pt-6 px-6 border-t`} // Added mt-6, pt-6 and border-t
                style={{
                  borderColor: isDark
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.1)",
                }}
              >
                Please <a href="/" className={themeStyles.link}>login</a>{" "}
                to comment.
              </div>
            )}
        </div>
      </div>
    </main>
  );
}
