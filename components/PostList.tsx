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
import { AdvertisementCard } from "./AdvertisementCard.tsx";

const DEFAULT_CONTACT_EMAIL = "hello@fastro.dev";

interface Props {
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
  data,
  isDark,
  isMobile,
  api_base_url,
  share_base_url,
  onOpenModal,
}: Props) {
  const [menuOpenForPost, setMenuOpenForPost] = useState<string | null>(null);
  const [showPosts, setShowPosts] = useState(true);
  const [localPosts, setLocalPosts] = useState<Post[]>([]);
  const [postViews, setPostViews] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const fetchedPosts = useRef(new Set<string>());
  const dataCache = useRef(
    new Map<string, { post: Post; comments: Comment[] }>(),
  );
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const LIMIT = 5; // Default limit

  // Fetch posts with cursor
  const fetchPosts = async (cursorId: string | null = null) => {
    try {
      let url = `${api_base_url}/api/posts?limit=${LIMIT}`;
      if (cursorId) url += `&cursor=${cursorId}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch posts");
      const posts = await response.json();

      // If fewer posts are returned than the limit, we've reached the end
      if (posts.length < LIMIT) setHasMore(false);

      return posts;
    } catch (error) {
      console.error("Error fetching posts:", error);
      setHasMore(false);
      return [];
    }
  };

  // Initial load
  useEffect(() => {
    let mounted = true;
    const loadInitialPosts = async () => {
      setIsLoading(true);
      const initialPosts = await fetchPosts(null);
      if (!mounted) return;

      setLocalPosts(initialPosts);
      setCursor(
        initialPosts.length ? initialPosts[initialPosts.length - 1].id : null,
      );
      setHasMore(initialPosts.length === LIMIT);
      setIsLoading(false);
    };
    loadInitialPosts();
    return () => {
      mounted = false;
    };
  }, []); // Only run once on mount

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

  // Load more posts
  const handleLoadMore = async () => {
    if (isLoading || !hasMore) return; // Prevent duplicate fetches
    setIsLoading(true);

    const newPosts = await fetchPosts(cursor);
    setLocalPosts((prev) => {
      const existingIds = new Set(prev.map((p: Post) => p.id));
      const filtered = newPosts.filter((p: Post) => !existingIds.has(p.id));
      return [...prev, ...filtered];
    });

    setCursor(newPosts.length ? newPosts[newPosts.length - 1].id : cursor);
    setHasMore(newPosts.length === LIMIT);
    setIsLoading(false);
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

  // Update memoizedHandlers dependencies
  const memoizedHandlers = useMemo(
    () => ({
      handlePostClick: (postId: string, post: Post) =>
        handlePostClick(postId, post),
      handleDeletePost,
      handleSharePost,
      handleEditPost,
      handleLoadMore,
    }),
    [api_base_url, cursor], // Add cursor as dependency
  );

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

  useEffect(() => {
    // Preload the image for the first post to improve LCP
    if (localPosts.length > 0 && localPosts[0].image) {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = localPosts[0].image;
      link.crossOrigin = "anonymous";
      document.head.appendChild(link);

      // Clean up on unmount
      return () => {
        document.head.removeChild(link);
      };
    }
  }, [localPosts]);

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

  // Add this effect for infinite scroll
  useEffect(() => {
    if (isMobile) return; // Only for desktop

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && !isLoading && hasMore) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 }, // Trigger when 10% of the element is visible
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [isLoading, hasMore, isMobile]);

  return (
    <>
      {/* add advertisement-card in the last item in every API request. show it only on mobile device. */}
      {showPosts && memoizedPosts.length > 0 && (
        <div className="space-y-4 mb-4">
          {memoizedPosts.map((post, idx) => (
            <>
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
              {/* Show advertisement after every 5th post on mobile */}
              {isMobile && (idx + 1) % 5 === 0 && (
                <div className="block sm:hidden lg:hidden">
                  <AdvertisementCard contactEmail={DEFAULT_CONTACT_EMAIL} />
                </div>
              )}
            </>
          ))} {/* Load more button for mobile */} {localPosts.length > 0 && (
            <>
              {isMobile
                ? (
                  <div className="flex justify-center mt-4 mb-8">
                    <button
                      onClick={handleLoadMore}
                      disabled={isLoading || !hasMore}
                      className={`px-4 py-2 rounded-lg ${
                        isDark
                          ? "bg-purple-600 hover:bg-purple-700"
                          : "bg-purple-500 hover:bg-purple-600"
                      } text-white transition-colors ${
                        (isLoading || !hasMore)
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {isLoading
                        ? "Loading..."
                        : !hasMore
                        ? "No More Posts"
                        : "Load More Posts"}
                    </button>
                  </div>
                )
                : (
                  // Invisible loader for desktop infinite scroll
                  <div
                    ref={loadMoreRef}
                    className="h-10 w-full"
                    aria-hidden="true"
                  />
                )}
            </>
          )}
        </div>
      )}
    </>
  );
});
