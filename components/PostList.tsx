// deno-lint-ignore-file
import { Comment, Post } from "@app/modules/index/type.ts";
import { PostHeader } from "./PostHeader.tsx";
import { PostContent } from "./PostContent.tsx";
import { PostFooter } from "./PostFooter.tsx";
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
      cardBorder: isDark ? "border-purple-500/20" : "border-purple-400/20",
      cardGlow: isMobile ? "" : `backdrop-blur-sm transition-all duration-300
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
              <PostHeader
                post={post}
                isDark={isDark}
                menuOpenForPost={menuOpenForPost}
                onMenuToggle={(postId) =>
                  setMenuOpenForPost(
                    menuOpenForPost === postId ? null : postId,
                  )}
                onShare={memoizedHandlers.handleSharePost}
                onEdit={memoizedHandlers.handleEditPost}
                onDelete={memoizedHandlers.handleDeletePost}
              />

              <PostContent
                post={post}
                isDark={isDark}
                index={idx}
                onPostClick={memoizedHandlers.handlePostClick}
              />

              <PostFooter
                postId={post.id}
                commentCount={post.commentCount}
                views={post.views}
                viewCount={post.viewCount}
                postViews={postViews}
                api_base_url={api_base_url}
                themeStyles={themeStyles}
              />
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
