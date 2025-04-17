import { useEffect, useState } from "preact/hooks";
import Header from "./header.tsx";
import { JSX } from "preact/jsx-runtime";
import { PageProps } from "fastro/mod.ts";
import { VDotsIcon } from "@app/components/icons/vdots.tsx";
import { HexaIcon } from "@app/components/icons/hexa.tsx";
import { CommentIcon } from "@app/components/icons/comment.tsx";
import { ViewIcon } from "@app/components/icons/view.tsx";
import { marked } from "marked";

interface Post {
  id: string;
  content: string;
  timestamp: string;
  author: string;
  views?: number;
  avatar?: string;
  isMarkdown?: boolean;
  image?: string; // Add image URL field
}

interface Comment {
  id: string;
  content: string;
  postId: string;
  timestamp: string;
  author: string;
  avatar: string;
}

export default function Post({ data }: PageProps<{
  title: string;
  description: string;
  baseUrl: string;
  isLogin: boolean;
  avatar_url: string;
  html_url: string;
  author: string;
  post: Post;
}>) {
  const [isDark, setIsDark] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [_isSubmitting, setIsSubmitting] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Fetch comments on page load
  useEffect(() => {
    fetchComments();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdownId(null);
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // Fetch comments for this post
  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/comments/${data.post.id}`);
      if (response.ok) {
        const commentsData = await response.json();
        setComments(commentsData);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle theme
  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  // Toggle dropdown menu
  const toggleDropdown = (e: MouseEvent, commentId: string) => {
    e.stopPropagation(); // Prevent triggering the document click handler
    setOpenDropdownId(openDropdownId === commentId ? null : commentId);
  };

  // Handle comment deletion
  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
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

  // Handle comment submission
  const handleCommentSubmit = async (
    e: JSX.TargetedEvent<HTMLFormElement, Event>,
  ) => {
    e.preventDefault();
    if (!commentText.trim() || !data.isLogin) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: commentText,
          postId: data.post.id,
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

  // Simplified text change handler
  const handleTextChange = (
    e: JSX.TargetedEvent<HTMLTextAreaElement, Event>,
  ) => {
    setCommentText(e.currentTarget.value);
  };

  const renderMarkdown = (content: string) => {
    try {
      const html = marked.parse(content, {
        // Avoid deprecated options
      });

      return { __html: typeof html === "string" ? html : String(html) };
    } catch (e) {
      console.error("Markdown parsing error:", e);
      return { __html: content };
    }
  };

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
  };

  const { post } = data;

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

  return (
    <div className="relative min-h-screen">
      {/* Background Layer - simplified for mobile */}
      <div className="fixed inset-0 z-0">
        {/* Solid Background */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: themeStyles.background }}
        />

        {/* Hexagonal Grid Background - Applied to entire page */}
        <div
          className={`fixed inset-0 z-0 ${
            isDark ? "opacity-20" : "opacity-10"
          }`}
        >
          <HexaIcon />
        </div>
      </div>

      {/* Content Layer */}
      <div className="relative z-10 min-h-screen">
        {/* Theme toggle button */}
        <button
          type="button"
          onClick={toggleTheme}
          className={`fixed bottom-4 right-4 p-3 rounded-full transition-colors 
            shadow-lg hover:scale-110 transform duration-200 z-50
            ${
            isDark ? "bg-gray-800 text-gray-200" : "bg-gray-200 text-gray-800"
          }`}
          aria-label="Toggle theme"
        >
          {isDark ? "☀️" : "🌙"}
        </button>

        <div className="max-w-xl mx-auto">
          <Header
            isLogin={data.isLogin}
            avatar_url={data.avatar_url}
            html_url={data.html_url}
            isDark={isDark}
          />

          <main className="max-w-2xl mx-auto px-4">
            {/* Post Detail Card */}
            <div
              className={`${themeStyles.cardBg} rounded-lg ${themeStyles.cardGlow} p-6 border ${themeStyles.cardBorder} backdrop-blur-lg mb-4 relative`}
            >
              {/* Post author info and options */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                    <img
                      src={post.avatar}
                      alt={post.author}
                      className="w-full h-full rounded-full"
                    />
                  </div>
                  <div className="ml-4">
                    <p
                      className={`font-medium text-base sm:text-lg ${themeStyles.text}`}
                    >
                      {post.author}
                    </p>
                    <p className="text-gray-500 text-xs sm:text-sm">
                      {formatDate(post.timestamp)}
                    </p>
                  </div>
                </div>
                {/* Three dots menu */}
                <button
                  type="button"
                  className={`p-1 rounded-full hover:bg-gray-700/30 ${themeStyles.text} ml-4`} // Added ml-4 for spacing
                  aria-label="Post options"
                >
                  <VDotsIcon />
                </button>
              </div>

              {/* Post Image (if available) */}
              {post.image && (
                <div className="my-4">
                  <img
                    src={post.image}
                    alt="Post image"
                    className="w-full rounded-lg object-cover"
                  />
                </div>
              )}

              <div className="markdown-content prose prose-sm dark:prose-invert max-w-none">
                <div
                  className={`${themeStyles.text} text-base sm:text-lg whitespace-pre-wrap leading-relaxed mb-0`}
                  dangerouslySetInnerHTML={renderMarkdown(post.content)}
                />
              </div>

              {/* Stats section with top and bottom borders */}
              <div
                className={`flex items-center justify-between py-3 space-x-4 border-t border-b ${
                  isDark ? "border-gray-700/50" : "border-gray-200/70"
                } mb-4`}
              >
                <div
                  className={`flex items-center gap-x-1 ${themeStyles.footer} text-xs`}
                >
                  <span className="flex items-center">
                    <CommentIcon />
                    {comments.length}{" "}
                    {comments.length === 1 ? "comment" : "comments"}
                  </span>
                </div>
                <div
                  className={`flex items-center gap-x-1 ${themeStyles.footer} text-xs`}
                >
                  <span className="flex items-center">
                    <ViewIcon />
                    {post.views || 0} views
                  </span>
                </div>
              </div>

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
                                      onClick={(e) =>
                                        toggleDropdown(e, comment.id)}
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
                          className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg border ${themeStyles.input} resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
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
                      className={`text-center py-4 ${themeStyles.text} opacity-70 text-sm mt-6 pt-6 border-t`} // Added mt-6, pt-6 and border-t
                      style={{
                        borderColor: isDark
                          ? "rgba(255,255,255,0.1)"
                          : "rgba(0,0,0,0.1)",
                      }}
                    >
                      Please <a href="/" className={themeStyles.link}>login</a>
                      {" "}
                      to comment.
                    </div>
                  )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
