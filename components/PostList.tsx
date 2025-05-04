// deno-lint-ignore-file
import { Comment, Post } from "@app/modules/index/type.ts";
import { CommentIcon } from "@app/components/icons/comment.tsx";
import { ViewIcon } from "@app/components/icons/view.tsx";
import { VDotsIcon } from "@app/components/icons/vdots.tsx";
import { ShareIcon } from "@app/components/icons/share.tsx";
import { EditIcon } from "@app/components/icons/edit.tsx";
import { DeleteIcon } from "@app/components/icons/delete.tsx";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { memo } from "preact/compat";

interface Props {
  posts: Post[];
  data: {
    isLogin: boolean;
    author: string;
    avatar_url: string;
  };
  isDark: boolean;
  isMobile: boolean;
  api_base_url: string;
  share_base_url: string;
  onOpenModal: (post: Post, comments: Comment[]) => void;
}

export const PostList = memo(function PostList({
  posts,
  data,
  isDark,
  isMobile,
  api_base_url,
  share_base_url,
  onOpenModal,
}: Props) {
  const [menuOpenForPost, setMenuOpenForPost] = useState<string | null>(null);
  const [showPosts, setShowPosts] = useState(true);
  const [localPosts, setLocalPosts] = useState<Post[]>(posts);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const handlePostClick = async (postId: string) => {
    try {
      const [postResponse, commentsResponse] = await Promise.all([
        fetch(`${api_base_url}/api/post/${postId}`),
        fetch(`${api_base_url}/api/comments/${postId}`),
      ]);

      if (!postResponse.ok || !commentsResponse.ok) {
        throw new Error("Failed to fetch data");
      }

      const [post, comments] = await Promise.all([
        postResponse.json(),
        commentsResponse.json(),
      ]);

      onOpenModal(post, comments);
    } catch (error) {
      console.error("Error fetching post details:", error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      const response = await fetch(`${api_base_url}/api/post/${postId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setLocalPosts((prevPosts) =>
          prevPosts.filter((post) => post.id !== postId)
        );
        window.dispatchEvent(
          new CustomEvent("postDeleted", { detail: { postId } }),
        );
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleSharePost = async (postId: string) => {
    const postUrl = `${share_base_url}/post/${postId}`;
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
      navigator.clipboard.writeText(postUrl)
        .then(() => alert("Link copied to clipboard!"))
        .catch((err) => console.error("Failed to copy link:", err));
    }
  };

  const handleEditPost = (postId: string) => {
    window.location.href = `${api_base_url}/post/${postId}?edit=true`;
  };

  const PREFETCH_DELAY = 300;

  const memoizedPosts = useMemo(() => {
    return localPosts.map((post) => ({
      ...post,
      formattedDate: new Date(post.timestamp).toLocaleString(),
      isAuthor: data.author === post.author,
      isAdmin: data.author === "ynwd",
    }));
  }, [localPosts, data.author]);

  const memoizedHandlers = useMemo(
    () => ({
      handlePostClick,
      handleDeletePost,
      handleSharePost,
      handleEditPost,
    }),
    [api_base_url], // Add other dependencies if needed
  );

  useEffect(() => {
    setLocalPosts(posts);
  }, [posts]);

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
    if (isMobile) return; // Skip for mobile

    const loadMorePosts = async () => {
      try {
        const lastPost = localPosts[localPosts.length - 1];
        const response = await fetch(
          `${api_base_url}/api/posts?cursor=${lastPost.id}`,
        );
        if (!response.ok) throw new Error("Failed to fetch more posts");

        const newPosts = await response.json();
        if (newPosts.length > 0) {
          setLocalPosts((prev) => [...prev, ...newPosts]);
        }
      } catch (error) {
        console.error("Error loading more posts:", error);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          loadMorePosts();
        }
      },
      {
        root: null,
        rootMargin: "100px", // Load before reaching the end
        threshold: 0.1,
      },
    );

    const sentinel = sentinelRef.current;
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => {
      if (sentinel) {
        observer.disconnect();
      }
    };
  }, [isMobile, localPosts, api_base_url]);

  const prefetchPostData = async (postId: string) => {
    try {
      // Fetch API data
      const [postResponse, commentsResponse] = await Promise.all([
        fetch(`${api_base_url}/api/post/${postId}`),
        fetch(`${api_base_url}/api/comments/${postId}`),
      ]);

      // Get post data to preload image
      const post = await postResponse.json();

      // Preload the image
      if (post.image) {
        const img = new Image();
        img.src = post.image;
      }

      // Cache the comments
      await commentsResponse.json();
    } catch (error) {
      console.debug("Prefetch failed:", error);
    }
  };

  const themeStyles = useMemo(
    () => ({
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
    }),
    [isDark, isMobile],
  );

  return (
    <>
      {showPosts && memoizedPosts.length > 0 && (
        <div className="space-y-4">
          {memoizedPosts.map((post) => (
            // Use memoized post data
            <div
              key={post.id}
              onMouseEnter={() => {
                const timer = setTimeout(
                  () => prefetchPostData(post.id),
                  PREFETCH_DELAY,
                );
                return () => clearTimeout(timer);
              }}
              className={`${themeStyles.cardBg} flex flex-col rounded-lg px-4 py-3 border ${themeStyles.cardBorder} ${themeStyles.cardGlow} relative`}
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
                        onClick={() =>
                          memoizedHandlers.handleSharePost(post.id)}
                        className={`flex items-center w-full gap-x-2 px-4 py-2 text-sm ${
                          isDark
                            ? "text-gray-200 hover:bg-gray-700"
                            : "text-gray-700 hover:bg-gray-100"
                        } rounded-md`}
                      >
                        <ShareIcon />
                        <span className="font-medium">Share post</span>
                      </button>

                      {/* Edit option only for post author */}
                      {post.isAuthor && (
                        <button
                          onClick={() =>
                            memoizedHandlers.handleEditPost(post.id)}
                          className={`flex items-center w-full gap-x-2 px-4 py-2 text-sm ${
                            isDark
                              ? "text-gray-200 hover:bg-gray-700"
                              : "text-gray-700 hover:bg-gray-100"
                          } rounded-md`}
                        >
                          <EditIcon />
                          <span className="font-medium">Edit post</span>
                        </button>
                      )}

                      {/* Delete option only for post author */}
                      {(post.isAdmin || post.isAuthor) && (
                        <button
                          onClick={() =>
                            memoizedHandlers.handleDeletePost(post.id)}
                          className={`flex items-center w-full gap-x-2 px-4 py-2 text-sm ${
                            isDark
                              ? "text-gray-200 hover:bg-gray-700"
                              : "text-gray-700 hover:bg-gray-100"
                          } rounded-md`}
                        >
                          <DeleteIcon />
                          <span className="font-medium">Delete post</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {/* End Modified Header Section */}

              <div
                onClick={() => memoizedHandlers.handlePostClick(post.id)}
                className="block relative cursor-pointer"
              >
                {/* Modified image section with title overlay */}
                <div className="-mx-4 mb-4 relative">
                  <div className="w-full h-[600px] sm:h-[450px]">
                    <img
                      src={post.image || post.defaultImage}
                      alt="Post attachment"
                      sizes="(max-width: 640px) 100vw, 600px"
                      width="600"
                      height="600"
                      className="w-full h-full rounded-none object-cover"
                      loading="lazy"
                    />
                  </div>

                  {/* Title overlay container - Now uses Flexbox */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm px-4 py-3 flex flex-col justify-end">
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
                    <h2 className="text-xl font-extrabold text-white line-clamp-5">
                      {post.title ? post.title : post.content}
                    </h2>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <a
                  href={`${api_base_url}/post/${post.id}`}
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
          ))}
          {/* Sentinel for infinite scrolling */}
          {!isMobile && localPosts.length > 0 && (
            <div
              ref={sentinelRef}
              className="h-10 w-full flex items-center justify-center"
              aria-hidden="true"
            >
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500" />
            </div>
          )}
        </div>
      )}
    </>
  );
});
