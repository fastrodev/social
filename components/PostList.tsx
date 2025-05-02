// deno-lint-ignore-file
import { Post } from "@app/modules/index/type.ts";
import { CommentIcon } from "@app/components/icons/comment.tsx";
import { Comment } from "@app/modules/index/type.ts";
import { ViewIcon } from "@app/components/icons/view.tsx";
import { VDotsIcon } from "@app/components/icons/vdots.tsx";
import { ShareIcon } from "@app/components/icons/share.tsx";
import { EditIcon } from "@app/components/icons/edit.tsx";
import { DeleteIcon } from "@app/components/icons/delete.tsx";
import { PostDetail } from "@app/components/PostDetail.tsx";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { memo } from "preact/compat";
import { XIcon } from "./icons/x.tsx";
import Header from "./Header.tsx";
import HeaderPost from "./HeaderPost.tsx";

interface Props {
  posts: Post[];
  data: {
    isLogin: boolean;
    author: string;
    avatar_url: string;
  };
  isDark: boolean;
  isMobile: boolean;
  base_url: string; // Remove optional flag
}

export function PostList({ posts, data, isDark, isMobile, base_url }: Props) {
  const [menuOpenForPost, setMenuOpenForPost] = useState<string | null>(null);
  const [showPosts, setShowPosts] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showPostDetail, setShowPostDetail] = useState(false);
  const [selectedPostComments, setSelectedPostComments] = useState<Comment[]>(
    [],
  );
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [localPosts, setLocalPosts] = useState<Post[]>(posts);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const memoizedPosts = useMemo(() => {
    return localPosts.map((post) => ({
      ...post,
      formattedDate: new Date(post.timestamp).toLocaleString(),
      isAuthor: data.author === post.author,
      isAdmin: data.author === "ynwd",
    }));
  }, [localPosts, data.author]);

  // Memoize the post detail component
  const postDetailComponent = useMemo(() => {
    if (!showPostDetail || !selectedPost) return null;
    return (
      <PostDetail
        base_url={base_url}
        post={selectedPost}
        comments={selectedPostComments}
        data={data}
        isDark={isDark}
        isMobile={isMobile}
      />
    );
  }, [
    showPostDetail,
    selectedPost,
    selectedPostComments,
    data,
    isDark,
    isMobile,
    base_url,
  ]);

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
      if (isLoading) return;

      try {
        setIsLoading(true);
        const lastPost = localPosts[localPosts.length - 1];
        const response = await fetch(
          `${base_url}/api/posts?cursor=${lastPost.id}`,
        );
        if (!response.ok) throw new Error("Failed to fetch more posts");

        const newPosts = await response.json();
        if (newPosts.length > 0) {
          setLocalPosts((prev) => [...prev, ...newPosts]);
        }
      } catch (error) {
        console.error("Error loading more posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isLoading) {
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
  }, [isMobile, isLoading, localPosts, base_url]);

  useEffect(() => {
    const handleShowPostDetail = (event: CustomEvent) => {
      const { post, action } = event.detail;
      if (action === "hide-posts") {
        // Hide post list container
        setShowPosts(false);
        // Show post detail with the fetched post data
        setSelectedPost(post);
        setShowPostDetail(true);
      }
    };

    window.addEventListener(
      "showPostDetail",
      handleShowPostDetail as EventListener,
    );
    return () => {
      window.removeEventListener(
        "showPostDetail",
        handleShowPostDetail as EventListener,
      );
    };
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isModalOpen]);

  const fetchComments = async (postId: string) => {
    try {
      const response = await fetch(`${base_url}/api/comments/${postId}`);
      if (!response.ok) throw new Error("Failed to fetch comments");
      const comments = await response.json();
      setSelectedPostComments(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      setSelectedPostComments([]);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      const response = await fetch(`${base_url}/api/post/${postId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Remove the deleted post from the local state
        setLocalPosts((prevPosts) =>
          prevPosts.filter((post) => post.id !== postId)
        );

        // Dispatch custom event to notify parent components
        window.dispatchEvent(
          new CustomEvent("postDeleted", {
            detail: { postId },
          }),
        );
      } else {
        console.error("Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleSharePost = async (postId: string) => {
    const postUrl = `${base_url}/post/${postId}`;

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
    window.location.href = `${base_url}/post/${postId}?edit=true`;
  };

  const handlePostClick = async (postId: string) => {
    try {
      // Set loading state while fetching
      setIsLoading(true);

      // Fetch post details
      const response = await fetch(`${base_url}/api/post/${postId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch post details");
      }
      const post = await response.json();

      // Set the selected post
      setSelectedPost(post);

      // Fetch comments for the post
      await fetchComments(postId);

      // Open the modal
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching post details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommentAdded = async () => {
    if (selectedPost) {
      await fetchComments(selectedPost.id);
    }
  };

  const themeStyles = useMemo(() => ({
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
  }), [isDark, isMobile]);

  return (
    <>
      {postDetailComponent || (
        showPosts && memoizedPosts.length > 0 && (
          memoizedPosts.map((post) => (
            // Use memoized post data
            <div
              key={post.id}
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
                      {post.isAuthor && (
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
                      {(post.isAdmin || post.isAuthor) && (
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

              <div
                onClick={() => handlePostClick(post.id)}
                className="block relative cursor-pointer"
              >
                {/* Modified image section with title overlay */}
                <div className="-mx-4 mb-4 relative">
                  <div className="w-full h-[600px] sm:h-[450px]">
                    <img
                      src={post.image || post.defaultImage}
                      alt="Post attachment"
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
                  href={`${base_url}/post/${post.id}`}
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
        )
      )}
      {/* Add sentinel at the end of the list for infinite scrolling */}
      {!isMobile && localPosts.length > 0 && !showPostDetail && (
        <div
          ref={sentinelRef}
          className="h-10 w-full flex items-center justify-center"
          aria-hidden="true"
        >
          {isLoading && (
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500" />
          )}
        </div>
      )}
      {/* Modal */}
      {isModalOpen && selectedPost && (
        <PostModal
          selectedPost={selectedPost}
          isDark={isDark}
          onClose={() => setIsModalOpen(false)}
        >
          <PostDetail
            base_url={base_url}
            post={selectedPost}
            comments={selectedPostComments}
            data={data}
            isDark={isDark}
            isMobile={isMobile}
          />
        </PostModal>
      )}
    </>
  );
}

// Add this new memoized modal component
const PostModal = memo(({ selectedPost, isDark, onClose, children }: {
  selectedPost: Post;
  isDark: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => (
  <div className="fixed inset-0 z-50">
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
      style={{ willChange: "opacity" }}
    />

    <div className="fixed inset-0 flex items-center justify-center p-0 sm:p-6 overscroll-none">
      <div
        className={`relative w-full h-full max-w-2xl mx-auto ${
          isDark ? "bg-gray-800" : "bg-white"
        } shadow-xl rounded-lg flex flex-col transform-gpu`}
        style={{
          contain: "content",
          willChange: "transform",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {/* Fixed Header */}
        <div
          className={`flex justify-between items-center px-3 py-0 ${
            isDark ? "bg-gray-800/80" : "bg-white/80"
          } rounded-t-lg border-b backdrop-blur-sm ${
            isDark ? "border-gray-700/50" : "border-gray-200/50"
          }`}
          style={{ contain: "layout style" }}
        >
          <HeaderPost
            message={`${selectedPost.title} by ${selectedPost.author}`}
          />
          <button
            onClick={onClose}
            className={`right-4 p-2 rounded-full ${
              isDark
                ? "hover:bg-gray-700/70 text-gray-400"
                : "hover:bg-gray-100/70 text-gray-600"
            }`}
          >
            <span className="sr-only">Close</span>
            <XIcon />
          </button>
        </div>

        {/* Scrollable Content */}
        <div
          className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500 scrollbar-track-rounded-full scrollbar-thumb-rounded-full"
          style={{
            contain: "content",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  </div>
));

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
