// deno-lint-ignore-file
import { useEffect, useState } from "preact/hooks";
import Header from "./header.tsx";
import { JSX } from "preact/jsx-runtime";
import { PageProps } from "fastro/mod.ts";
import { VDotsIcon } from "@app/components/icons/vdots.tsx";
import { HexaIcon } from "@app/components/icons/hexa.tsx";
import { CommentIcon } from "@app/components/icons/comment.tsx";
import { ViewIcon } from "@app/components/icons/view.tsx";
import { ShareIcon } from "@app/components/icons/share.tsx";
import { DeleteIcon } from "@app/components/icons/delete.tsx";
import { EditIcon } from "@app/components/icons/edit.tsx"; // Add EditIcon import
import { marked } from "marked";
import { XIcon } from "@app/components/icons/x.tsx";

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
  const [showPostMenu, setShowPostMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editPostContent, setEditPostContent] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Initialize edit content with post content when editing starts
  useEffect(() => {
    if (isEditing) {
      setEditPostContent(data.post.content);
    }
  }, [isEditing, data.post.content]);

  // Fetch comments on page load and check for theme in session storage
  useEffect(() => {
    fetchComments();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdownId(null);
      setShowPostMenu(false); // Close post menu when clicking outside
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

  // Toggle theme and save preference to session storage
  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    // Save theme preference to session storage
    sessionStorage.setItem("theme", newTheme ? "dark" : "light");
  };

  // Toggle dropdown menu
  const toggleDropdown = (e: MouseEvent, commentId: string) => {
    e.stopPropagation(); // Prevent triggering the document click handler
    setOpenDropdownId(openDropdownId === commentId ? null : commentId);
  };

  // Toggle post menu
  const togglePostMenu = (e: MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the document click handler
    setShowPostMenu(!showPostMenu);
  };

  // Handle post deletion
  const handleDeletePost = async () => {
    if (!confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      const response = await fetch(`/api/post/${data.post.id}`, {
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

  // Handle post sharing
  const handleSharePost = async () => {
    const postUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out this post",
          url: postUrl,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(postUrl).then(() => {
        alert("Link copied to clipboard!");
      }).catch((err) => {
        console.error("Failed to copy link:", err);
      });
    }
  };

  // Handle post editing
  const handleEditPost = () => {
    setIsEditing(true);
    setShowPostMenu(false); // Close the menu
  };

  // Update the handleSaveEdit function to preserve the image state
  const handleSaveEdit = async () => {
    if (!editPostContent.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/post/${data.post.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: editPostContent,
          // Preserve existing values
          author: data.post.author,
          avatar: data.post.avatar,
          image: post.image, // Pass the current image state (may be null if removed)
        }),
      });

      if (response.ok) {
        const updatedPost = await response.json();
        // Update the post properly in the UI by updating the data object
        data.post = {
          ...data.post,
          content: updatedPost.content || editPostContent,
          image: updatedPost.image, // Make sure to update the image property
        };
        setIsEditing(false);
      } else {
        console.error("Failed to update post");
        alert("Failed to update post. Please try again.");
      }
    } catch (error) {
      console.error("Error updating post:", error);
      alert("An error occurred while updating the post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle canceling edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditPostContent("");
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

  const handleRemoveImage = async () => {
    if (!post.image) return;

    try {
      // Extract filename from the public URL
      const urlParts = post.image.split("/");
      const filename = urlParts.slice(4).join("/");

      if (!filename) {
        console.error("Could not extract filename from URL:", post.image);
        return;
      }

      console.log("Requesting DELETE signed URL for filename:", filename);

      // 1. Get the DELETE signed URL from the backend
      const deleteUrlResponse = await fetch("/api/delete-signed-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filename }),
      });

      if (!deleteUrlResponse.ok) {
        const errorData = await deleteUrlResponse.text();
        console.error("Failed to get DELETE signed URL:", errorData);
        alert("Could not prepare file deletion request. Please try again.");
        return;
      }

      const data = await deleteUrlResponse.json();
      if (!data.signedUrl) {
        throw new Error("No DELETE signed URL returned from server");
      }

      const deleteSignedUrl = data.signedUrl;
      console.log("DELETE Signed URL received.");

      // 2. Use the signed URL to execute the DELETE request
      console.log("Executing DELETE request using signed URL...");
      const deleteResponse = await fetch(deleteSignedUrl, {
        method: "DELETE",
        // No body or Content-Type needed for standard GCS DELETE via signed URL
      });

      if (!deleteResponse.ok) {
        const deleteErrorText = await deleteResponse.text();
        console.error("Error executing DELETE signed URL:", deleteErrorText);
        alert(
          "Failed to delete the file from storage. It might have already been deleted.",
        );
      } else {
        console.log("File deleted successfully using signed URL.");
      }

      // Update the state to remove the image reference
      // We'll create a temporary object without the image property and update state
      const updatedPostData = {
        ...data.post,
        image: null,
      };

      // Save the updated post with image removed
      const updateResponse = await fetch(`/api/post/${post.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: post.content,
          author: post.author,
          avatar: post.avatar,
          image: null, // Explicitly set image to null
        }),
      });

      if (updateResponse.ok) {
        // Update the post in the UI
        data.post = {
          ...data.post,
          image: null,
        };
      } else {
        console.error("Failed to update post after removing image");
        alert(
          "Image removed from storage but post not updated. Please try again.",
        );
      }
    } catch (error) {
      console.error("Error during the delete process:", error);
      alert("An error occurred while removing the image.");
    }
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

        <Header
          isLogin={data.isLogin}
          avatar_url={data.avatar_url}
          html_url={data.html_url}
          isDark={isDark}
        />

        <div className="max-w-xl mx-auto">
          <main className="max-w-2xl mx-auto px-0 sm:px-4">
            {/* Post Detail Card */}
            <div
              className={`${themeStyles.cardBg} rounded-lg ${themeStyles.cardGlow} p-6 border ${themeStyles.cardBorder} backdrop-blur-lg mb-0 sm:mb-4 relative`}
            >
              {/* Post author info and options */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  {/* Only show avatar when not editing */}
                  {!isEditing && (
                    <div className="mt-1 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                      <img
                        src={post.avatar}
                        alt={post.author}
                        className="w-full h-full rounded-full"
                      />
                    </div>
                  )}
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
                <div className="relative">
                  <button
                    type="button"
                    className={`p-1 rounded-full hover:bg-gray-700/30 ${themeStyles.text} ml-4`}
                    aria-label="Post options"
                    onClick={togglePostMenu}
                  >
                    <VDotsIcon />
                  </button>
                  {showPostMenu && (
                    <div
                      className={`absolute right-0 mt-1 w-36 rounded-md shadow-lg ${themeStyles.cardBg} ${themeStyles.cardBorder} z-20`}
                    >
                      <div className="py-1">
                        <button
                          type="button"
                          className={`block w-full text-left px-4 py-2 text-sm ${themeStyles.text} hover:bg-gray-700/30 transition-colors flex items-center gap-2`}
                          onClick={handleSharePost}
                        >
                          <ShareIcon />
                          Share post
                        </button>
                        {/* Only show edit and delete options if the user is the author */}
                        {post.author === data.author && (
                          <>
                            <button
                              type="button"
                              className={`block w-full text-left px-4 py-2 text-sm ${themeStyles.text} hover:bg-gray-700/30 transition-colors flex items-center gap-2`}
                              onClick={handleEditPost}
                            >
                              <EditIcon />
                              Edit post
                            </button>
                            <button
                              type="button"
                              className={`block w-full text-left px-4 py-2 text-sm ${themeStyles.text} hover:bg-red-500/10 hover:text-red-500 transition-colors flex items-center gap-2`}
                              onClick={handleDeletePost}
                            >
                              <DeleteIcon />
                              Delete post
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
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

              {/* Post Content */}
              {isEditing
                ? (
                  <div className="mt-4">
                    {post.image && (
                      <div className="mt-3 mb-3 relative">
                        <img
                          src={post.image}
                          alt="Post attachment"
                          className="w-full h-[330px] rounded-lg object-cover"
                        />
                        <button
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 hover:bg-gray-700 text-white w-6 h-6 flex items-center justify-center transition-colors"
                          aria-label="Remove image"
                        >
                          <XIcon />
                        </button>
                      </div>
                    )}

                    <textarea
                      value={editPostContent}
                      onChange={(e) =>
                        setEditPostContent(e.currentTarget.value)}
                      onInput={(e) => setEditPostContent(e.currentTarget.value)}
                      rows={6}
                      className={`w-full p-3 rounded-lg border ${themeStyles.input}
                        resize-none ${
                        isEditing
                          ? isMobile
                            ? "min-h-[150px] h-[200px]"
                            : "min-h-[300px] h-[400px]"
                          : isMobile
                          ? "min-h-[60px] h-[100px]"
                          : "min-h-[80px] h-[120px]"
                      } max-h-[600px] 
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        scrollbar-thin scrollbar-track-transparent transition-all duration-300
                        ${
                        isDark
                          ? "scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-500"
                          : "scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400"
                      }`}
                    />
                    <div className="flex justify-end mt-2 mb-3 space-x-2">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          isDark
                            ? "bg-gray-700 text-white hover:bg-gray-600"
                            : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                        }`}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveEdit}
                        className={`px-4 py-1.5 rounded-lg text-white text-sm font-medium transition-colors ${themeStyles.button}`}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )
                : (
                  <div className="markdown-content prose prose-sm dark:prose-invert max-w-none">
                    <div
                      className={`${themeStyles.text} text-base sm:text-lg whitespace-pre-wrap leading-relaxed mb-0`}
                      dangerouslySetInnerHTML={renderMarkdown(post.content)}
                    />
                  </div>
                )}

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
