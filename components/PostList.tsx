// deno-lint-ignore-file
import { Comment, Post } from "@app/modules/index/type.ts";
import { CommentIcon } from "@app/components/icons/comment.tsx";
import { ViewIcon } from "@app/components/icons/view.tsx";
import { VDotsIcon } from "@app/components/icons/vdots.tsx";
import { ShareIcon } from "@app/components/icons/share.tsx";
import { EditIcon } from "@app/components/icons/edit.tsx";
import { DeleteIcon } from "@app/components/icons/delete.tsx";
import { PostMenuButton } from "./PostMenuButton.tsx";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "preact/hooks";
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
  const [postViews, setPostViews] = useState<Record<string, number>>({});
  const sentinelRef = useRef<HTMLDivElement>(null);
  const fetchedPosts = useRef(new Set<string>());
  const dataCache = useRef(
    new Map<string, { post: Post; comments: Comment[] }>(),
  );

  const handlePostClick = async (postId: string, post: Post) => {
    // Pass the post directly to avoid searching again
    if (isMobile) {
      setMenuOpenForPost(null);
    }

    try {
      // Use cached data if available
      if (dataCache.current.has(postId)) {
        const { post, comments } = dataCache.current.get(postId)!;
        onOpenModal(post, comments);
        updateViewCount(postId);
        return;
      }

      // We already have the post, no need to search
      const commentsResponse = await fetch(
        `${api_base_url}/api/comments/${postId}`,
      );
      if (!commentsResponse.ok) {
        throw new Error("Failed to fetch comments");
      }

      const comments = await commentsResponse.json();
      dataCache.current.set(postId, { post, comments });

      onOpenModal(post, comments);
      updateViewCount(postId);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const updateViewCount = async (postId: string) => {
    try {
      const response = await fetch(`${api_base_url}/api/view/${postId}`, {
        method: "GET",
      });

      if (response.ok) {
        setPostViews((prev) => ({
          ...prev,
          [postId]: (prev[postId] || 0) + 1,
        }));
      }
    } catch (error) {
      console.error("Error updating view count:", error);
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

  const handleLoadMore = useCallback(async () => {
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
  }, [localPosts, api_base_url]);

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
      handlePostClick: (postId: string, post: Post) =>
        handlePostClick(postId, post),
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
    if (!isMobile) {
      const observer = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          if (entry.isIntersecting) {
            handleLoadMore();
          }
        },
        {
          root: null,
          rootMargin: "100px",
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
    }
  }, [isMobile, localPosts, api_base_url, handleLoadMore]);

  const prefetchPostData = async (postId: string) => {
    // Skip if already fetched
    if (fetchedPosts.current.has(postId)) {
      console.debug(`Post ${postId} already prefetched.`);
      return;
    }

    // Find post from local state
    const post = localPosts.find((p) => p.id === postId);
    if (!post) {
      console.debug("Post not found for prefetch");
      return;
    }

    // Mark as fetched to prevent duplicate requests
    fetchedPosts.current.add(postId);

    try {
      // Only fetch comments since we have the post
      const commentsResponse = await fetch(
        `${api_base_url}/api/comments/${postId}`,
      );
      if (!commentsResponse.ok) {
        throw new Error("Failed to fetch comments");
      }

      const comments = await commentsResponse.json();

      // Cache the data for when the user clicks
      dataCache.current.set(postId, { post, comments });

      // Preload the image if it exists
      if (post.image) {
        const img = new Image();
        img.src = post.image;
      }
    } catch (error) {
      console.debug("Prefetch failed:", error);
    }
  };

  const themeStyles = useMemo(
    () => ({
      cardBg: isDark ? "bg-gray-800/90" : "bg-white/95",
      text: isDark ? "text-gray-50" : "text-gray-900",
      footer: isDark ? "text-gray-100" : "text-gray-800",
      metadata: isDark ? "text-gray-200" : "text-gray-700",
      timestamp: isDark ? "text-gray-200" : "text-gray-700",
      link: isDark
        ? "text-purple-300 hover:text-purple-200"
        : "text-purple-700 hover:text-purple-800",
      cardBorder: isDark? "border-purple-500/20" : "border-purple-400/20",
      cardGlow: isMobile
        ? ""
        : `backdrop-blur-sm transition-all duration-300
           hhadow-purple-500/10 hover:border-purple-500/30 hover:shadow-2xl
           before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-r 
        om-purple-500/5 before:to-pink-500/5 before:-z-10`,
    }),
    [isDark, isMobile],
  );

  return (
    <>
      {showPosts && memoizedPosts.length > 0 && (
        <div className="space-y-4">
          {memoizedPosts.map((post, idx) => (
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
              className={`${themeStyles.cardBg} flex flex-col rounded-lg px-4 py-3 border ${themeStyles.cardBorder} backdrop-blur-sm ${themeStyles.cardGlow} relative`}
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
                    <p className={`text-xs ${themeStyles.timestamp}`}>
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
                    className={`p-1.5 rounded-full hover:bg-gray-700/40 transition-colors ${
                      isDark
                        ? "text-gray-200 hover:text-gray-50" // Increased contrast
                        : "text-gray-700 hover:text-gray-900" // Increased contrast
                    }`}
                    aria-label="Post options"
                  >
                    <VDotsIcon />
                  </button>

                  {menuOpenForPost === post.id && (
                    // menu container
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
                          onClick={() =>
                            memoizedHandlers.handleSharePost(post.id)}
                          isDark={isDark}
                        />

                        {post.isAuthor && (
                          <PostMenuButton
                            icon={<EditIcon />}
                            label="Edit post"
                            onClick={() =>
                              memoizedHandlers.handleEditPost(post.id)}
                            isDark={isDark}
                          />
                        )}

                        {(post.isAdmin || post.isAuthor) && (
                          <PostMenuButton
                            icon={<DeleteIcon />}
                            label="Delete post"
                            onClick={() =>
                              memoizedHandlers.handleDeletePost(post.id)}
                            isDark={isDark}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {/* End Modified Header Section */}

              <div
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  memoizedHandlers.handlePostClick(post.id, post);
                }}
                className="block relative cursor-pointer"
              >
                {/* Modified image section with title overlay */}
                <div className="w-full aspect-[1/1] mb-4 relative">
                  {/* Ensures 1:1 aspect ratio */}
                  <img
                    src={post.image || post.defaultImage}
                    alt="Post attachment"
                    width={600}
                    height={600}
                    className="w-full h-full rounded-none object-cover"
                    loading={idx === 0 ? "eager" : "lazy"}
                  />
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
                    )} {/* Title comes after tags */}{" "}
                    <h2 className="text-xl font-extrabold text-white line-clamp-5">
                      {post.title ? post.title : post.content}
                    </h2>
                  </div>
                </div>
              </div>{" "}
              <div className="flex items-center justify-between">
                <a
                  href={`${api_base_url}/post/${post.id}`}
                  className={`flex items-center gap-x-1 ${themeStyles.footer} text-xs hover:${
                    themeStyles.link.split(" ")[0]
                  }`}
                >
                  <CommentIcon />{" "}
                  <span>
                    {post.commentCount
                      ? `${post.commentCount} ${
                        post.commentCount === 1 ? "comment" : "comments"
                      }`
                      : "Add comment"}
                  </span>
                </a>{" "}
                <div
                  className={`flex items-center gap-x-2 ${themeStyles.metadata} text-xs`}
                >
                  <span className="flex items-center gap-x-2">
                    <ViewIcon /> {((post.views || post.viewCount || 0) +
                        (postViews[post.id] || 0)) === 0
                      ? "Be the first viewer"
                      : `${
                        (post.views || post.viewCount || 0) +
                        (postViews[post.id] || 0)
                      } ${
                        ((post.views || post.viewCount || 0) +
                            (postViews[post.id] || 0)) === 1
                          ? "view"
                          : "views"
                      }`}
                  </span>
                </div>
              </div>
            </div>
          ))} {/* Load more button for mobile / Sentinel for desktop */}{" "}
          {localPosts.length > 0 && (
            <>
              {isMobile
                ? (
                  <div className="flex justify-center mt-4 mb-8">
                    <button
                      onClick={handleLoadMore}
                      className={`px-4 py-2 rounded-lg ${
                        isDark
                          ? "bg-purple-600 hover:bg-purple-700"
                          : "bg-purple-500 hover:bg-purple-600"
                      } text-white transition-colors`}
                    >
                      Load More Posts
                    </button>
                  </div>
                )
                : (
                  <div
                    ref={sentinelRef}
                    className="h-10 w-full flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500" />
                  </div>
                )}
            </>
          )}
        </div>
      )}
    </>
  );
});
