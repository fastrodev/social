// deno-lint-ignore-file
import { Post } from "@app/modules/index/type.ts";
import { CommentIcon } from "@app/components/icons/comment.tsx";
import { ViewIcon } from "@app/components/icons/view.tsx";
import { VDotsIcon } from "@app/components/icons/vdots.tsx";
import { ShareIcon } from "@app/components/icons/share.tsx";
import { EditIcon } from "@app/components/icons/edit.tsx";
import { DeleteIcon } from "@app/components/icons/delete.tsx";
import { useEffect, useRef, useState } from "preact/hooks";

interface Props {
  posts: Post[];
  data: {
    isLogin: boolean;
    author: string;
  };
  isDark: boolean;
  isMobile: boolean;
}

export function PostList({ posts, data, isDark, isMobile }: Props) {
  const [menuOpenForPost, setMenuOpenForPost] = useState<string | null>(null);
  // Add a ref for the scroll sentinel
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setMenuOpenForPost(null);
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // Add effect for infinite scrolling on desktop
  useEffect(() => {
    if (isMobile) return; // Skip for mobile, as they use button

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        // Dispatch a custom event when sentinel is visible
        window.dispatchEvent(new CustomEvent("loadMorePosts"));
      }
    }, {
      root: null,
      threshold: 0.1, // Trigger when 10% of the element is visible
    });

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [isMobile, posts.length]); // Re-run when posts length changes

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      const response = await fetch(`/api/post/${postId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        console.error("Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleSharePost = async (postId: string) => {
    const postUrl = `https://social.fastro.dev/post/${postId}`;

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
      navigator.clipboard.writeText(postUrl)
        .then(() => {
          alert("Link copied to clipboard!");
        })
        .catch((err) => {
          console.error("Failed to copy link:", err);
        });
    }
  };

  const handleEditPost = (postId: string) => {
    window.location.href = `/post/${postId}?edit=true`;
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
      ? "shadow-[0_0_12px_3px_rgba(168,85,247,0.45)] hover:shadow-[0_0_30px_12px_rgba(168,85,247,0.5)]" // Larger purple glow for dark mode
      : "shadow-[0_0_10px_2px_rgba(156,163,175,0.45)] hover:shadow-[0_0_30px_12px_rgba(156,163,175,0.5)]", // Larger gray glow for light mode
  };

  return (
    <>
      {posts.length > 0 && (
        posts.map((post) => (
          <div
            key={post.id}
            className={`${themeStyles.cardBg} flex flex-col rounded-lg px-6 py-4 border ${themeStyles.cardBorder} ${themeStyles.cardGlow} relative`}
          >
            {/* Modified Header Section */}
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
                  <p className={`font-medium ${themeStyles.text}`}>
                    {post.author}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {new Date(post.timestamp).toLocaleString()}
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
                    setMenuOpenForPost(
                      menuOpenForPost === post.id ? null : post.id,
                    );
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

                {menuOpenForPost === post.id && (
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
                      onClick={() => handleSharePost(post.id)}
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
                        onClick={() => handleEditPost(post.id)}
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

                    {/* Delete option only for post author */}
                    {data.author === post.author && (
                      <button
                        onClick={() => handleDeletePost(post.id)}
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
            {/* End Modified Header Section */}

            <a href={`/post/${post.id}`} className="block relative">
              {/* Modified image section with title overlay */}
              <div className="-mx-6 mb-4 relative">
                <div className="w-full h-[200px] sm:h-[300px]">
                  <img
                    src={post.image || post.defaultImage}
                    alt="Post attachment"
                    className="w-full h-full rounded-none object-cover"
                    loading="lazy"
                  />
                </div>

                {/* Title overlay container - Now uses Flexbox */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-3 flex flex-col justify-end">
                  {/* Tags are placed first within the flex container */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
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

                  {/* Title comes after tags */}
                  <h2 className="text-xl font-extrabold text-white line-clamp-3">
                    {post.title ? post.title : post.content}
                  </h2>
                </div>
              </div>
            </a>

            <div className="flex items-center justify-between">
              <a
                href={`/post/${post.id}`}
                className={`flex items-center gap-x-1 ${themeStyles.footer} text-xs hover:${
                  themeStyles.link.split(" ")[0]
                }`}
              >
                <CommentIcon />
                <span>
                  {post.commentCount
                    ? (
                      <>
                        {post.commentCount}{" "}
                        {post.commentCount === 1 ? "comment" : "comments"}
                      </>
                    )
                    : (
                      "Add comment"
                    )}
                </span>
              </a>

              <div
                className={`flex items-center gap-x-2 ${themeStyles.footer} text-xs`}
              >
                <span className="flex items-center gap-x-2">
                  <ViewIcon />
                  {(post.views || post.viewCount || 0) === 0
                    ? "Be the first viewer"
                    : (
                      <>
                        {post.views || post.viewCount || 0}{" "}
                        {(post.views || post.viewCount || 0) === 1
                          ? "view"
                          : "views"}
                      </>
                    )}
                </span>
              </div>
            </div>
          </div>
        ))
      )}

      {/* Add sentinel at the end of the list for infinite scrolling */}
      {!isMobile && posts.length > 0 && (
        <div
          ref={sentinelRef}
          className="h-10 w-full opacity-0"
          aria-hidden="true"
        />
      )}
    </>
  );
}

export function Skeleton() {
  return (
    <div className="space-y-4">
      {[...Array(1)].map((_, i) => (
        <div
          key={i}
          className="bg-gray-800/90 flex flex-col rounded-lg px-6 py-4 border border-gray-700 relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className="mt-1 w-8 h-8 bg-gray-700/50 rounded-full animate-pulse flex-shrink-0" />
              <div className="ml-3">
                <div className="h-5 bg-gray-700/50 rounded w-28 animate-pulse" />
                <div className="h-3 bg-gray-700/50 rounded w-24 animate-pulse mt-1.5" />
              </div>
            </div>
            <div className="relative">
              <div className="w-8 h-8 bg-gray-700/50 rounded-full animate-pulse" />
            </div>
          </div>

          {/* Image Container */}
          <div className="-mx-6 mb-4 relative">
            <div className="w-full h-[200px] sm:h-[300px] bg-gray-700/50 animate-pulse" />

            {/* Tag overlay */}
            <div className="absolute top-2 right-2 flex flex-wrap gap-1 max-w-[70%] justify-end">
              <div className="h-5 bg-purple-800/50 rounded-full w-16 animate-pulse" />
            </div>

            {/* Title overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-3">
              <div className="h-7 bg-gray-700/50 rounded w-full animate-pulse" />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-x-1">
              <div className="w-5 h-5 bg-gray-700/50 rounded animate-pulse" />
              <div className="h-4 bg-gray-700/50 rounded w-24 animate-pulse ml-2" />
            </div>
            <div className="flex items-center gap-x-2">
              <div className="w-5 h-5 bg-gray-700/50 rounded animate-pulse" />
              <div className="h-4 bg-gray-700/50 rounded w-16 animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
