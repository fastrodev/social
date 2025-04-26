// deno-lint-ignore-file
import { Post } from "@app/modules/index/type.ts";
import { CommentIcon } from "@app/components/icons/comment.tsx";
import { ViewIcon } from "@app/components/icons/view.tsx";
import { VDotsIcon } from "@app/components/icons/vdots.tsx";
import { ShareIcon } from "@app/components/icons/share.tsx";
import { EditIcon } from "@app/components/icons/edit.tsx";
import { DeleteIcon } from "@app/components/icons/delete.tsx";
import { useEffect, useState } from "preact/hooks";

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
    cardGlow: isDark
      ? "shadow-2xl shadow-purple-500/30"
      : "shadow-lg shadow-gray-200/30",
  };

  return (
    <>
      {posts.length > 0 && (
        posts.map((post) => (
          <div
            key={post.id}
            className={`${themeStyles.cardBg} rounded-lg px-6 py-4 border ${themeStyles.cardBorder} ${themeStyles.cardGlow} relative`}
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
              {data.isLogin && (
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
              )}
            </div>
            {/* End Modified Header Section */}

            <a href={`/post/${post.id}`} className="block relative">
              {/* Modified image section */}
              <div className="mb-3">
                <img
                  src={post.image || post.defaultImage}
                  alt="Post attachment"
                  className="w-full h-[300px] rounded-lg object-cover"
                />
              </div>

              <div
                className={`markdown-body prose prose-sm dark:prose-invert max-w-none prose-a:no-underline prose-a:font-normal prose-p:my-2 ${themeStyles.text}`}
              >
                <h2 className="text-xl font-extrabold mb-2">
                  {post.title ? post.title : post.content}
                </h2>

                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-1">
                    {post.tags.map((tag, index) => (
                      <span
                        key={index}
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          isDark
                            ? "bg-purple-800/40 text-purple-200"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </a>

            {/* the style breaked by the hash tag content. fix it */}
            <div className="pt-3 border-t border-gray-700/30 flex items-center justify-between">
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
                  {post.views || post.viewCount || 0} views
                </span>
              </div>
            </div>
          </div>
        ))
      )}
    </>
    // <div className="flex flex-col gap-4">
    //   {posts.length > }
    // </div>
  );
}

export function Skeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="bg-gray-800/90 rounded-lg p-6 animate-pulse border border-gray-700"
        >
          <div className="flex items-center space-x-3 mb-4">
            {/* Avatar skeleton */}
            <div className="h-10 w-10 bg-gray-700/50 rounded-full animate-pulse" />
            <div className="space-y-2 flex-1">
              {/* Username skeleton */}
              <div className="h-4 bg-gray-700/50 rounded w-24 animate-pulse" />
              {/* Time skeleton */}
              <div className="h-3 bg-gray-700/50 rounded w-16 animate-pulse" />
            </div>
          </div>
          {/* Content skeleton */}
          <div className="space-y-3">
            <div className="h-4 bg-gray-700/50 rounded w-full animate-pulse" />
            <div className="h-4 bg-gray-700/50 rounded w-5/6 animate-pulse" />
            <div className="h-4 bg-gray-700/50 rounded w-4/6 animate-pulse" />
          </div>
          {/* Footer skeleton */}
          <div className="flex items-center space-x-4 mt-4">
            <div className="h-8 w-16 bg-gray-700/50 rounded animate-pulse" />
            <div className="h-8 w-16 bg-gray-700/50 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
