// deno-lint-ignore-file
import { PageProps } from "fastro/core/server/types.ts";
import { HexaIcon } from "@app/components/icons/hexa.tsx";
import { useEffect, useState } from "preact/hooks";
import Header from "@app/components/Header.tsx";
import { Editor } from "@app/components/Editor.tsx";
import { PostList } from "@app/components/PostList.tsx";
import { Comment, Post } from "@app/modules/index/type.ts";
import Welcome from "@app/components/Welcome.tsx";
import { PostDetail } from "@app/components/PostDetail.tsx";
import { PostModal } from "@app/components/PostModal.tsx";
import { TagSelector } from "@app/components/TagSelector.tsx";
import { Advertisement } from "@app/components/Advertisement.tsx";

// Add this function to read specific cookie
const getCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
};

export default function Index({ data }: PageProps<
  {
    user: string;
    title: string;
    description: string;
    github_auth: string;
    base_url: string;
    apiBaseUrl: string;
    share_base_url: string;
    avatar_url?: string;
    isLogin: boolean;
    author: string;
    message: string;
  }
>) {
  const [isDark, setIsDark] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isEditorActive, setIsEditorActive] = useState(false);
  const [modalState, setModalState] = useState<{
    open: boolean;
    post: Post | null;
    comments: Comment[];
  }>({ open: false, post: null, comments: [] });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleLoadMore = () => {
      if (hasMore && !isLoading) {
        fetchPosts(false);
      }
    };

    window.addEventListener("loadMorePosts", handleLoadMore);
    return () => window.removeEventListener("loadMorePosts", handleLoadMore);
  }, [hasMore, isLoading]);

  useEffect(() => {
    fetchPosts(true);
  }, []);

  useEffect(() => {
    const userCookie = getCookie("oauth-session");
    console.log("oauth-session cookie:", userCookie);
  }, []);

  const fetchPosts = async (isInitial: boolean = false) => {
    try {
      setIsLoading(true);
      const url = new URL("/api/posts", data.apiBaseUrl);
      console.log("Fetching posts from:", url.toString());
      url.searchParams.set("limit", isMobile ? "5" : "10");
      if (!isInitial && cursor) {
        url.searchParams.set("cursor", cursor);
      }

      const response = await fetch(url);
      const contentType = response.headers.get("content-type");

      if (!response.ok || !contentType?.includes("application/json")) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const post = await response.json();

      // Validate that data is an array
      if (!Array.isArray(post)) {
        throw new Error("Invalid response format: expected an array");
      }

      // Check if we received any posts
      if (post.length === 0) {
        setHasMore(false);
        return;
      }

      // Set the cursor to the last post's ID for pagination
      setCursor(post[post.length - 1].id);

      // Check if we have fewer posts than requested (indicates end of data)
      if (post.length < 4) {
        setHasMore(false);
      }

      // Ensure we don't duplicate posts by checking IDs
      if (isInitial) {
        setPosts(post);
      } else {
        setPosts((prev) => {
          // Get existing post IDs
          const existingIds = new Set(prev.map((post) => post.id));
          // Filter out any duplicates
          const newPosts = post.filter((post) => !existingIds.has(post.id));
          return [...prev, ...newPosts];
        });
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      setHasMore(false); // Stop trying to load more if we hit an error
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (post: Post, comments: Comment[]) => {
    setModalState({ open: true, post, comments });
  };

  const handleCloseModal = () => {
    setModalState({ open: false, post: null, comments: [] });
  };

  const handleTagSelect = (tag: string) => {
    console.log(`Selected tag: ${tag}`);
  };

  const themeStyles = {
    button: isDark
      ? "bg-purple-600 text-white hover:bg-purple-700"
      : "bg-purple-500 text-white hover:bg-purple-600",
    // Add any other theme styles you need here
  };

  return (
    <main className="min-h-screen flex flex-col bg-gray-950 relative overflow-hidden">
      <div className="fixed inset-0 z-0 opacity-20">
        <HexaIcon />
      </div>

      {/* Container of header and main content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {modalState.open && modalState.post && (
          <PostModal
            selectedPost={modalState.post}
            isDark={isDark}
            onClose={handleCloseModal}
          >
            <PostDetail
              post={modalState.post}
              comments={modalState.comments as any}
              isDark={isDark}
              isLoading={isLoading}
              apiBaseUrl={data.apiBaseUrl}
              share_base_url={data.share_base_url}
              data={{
                isLogin: data.isLogin,
                author: data.author,
                avatar_url: data.avatar_url || "",
              }}
            />
          </PostModal>
        )}

        {isLoading
          ? (
            // Loading state - only show Welcome centered
            <div className="flex-1 flex items-center justify-center">
              <Welcome key="welcome" />
            </div>
          )
          : (
            // Normal content when not loading
            <>
              <Header
                isLogin={data.isLogin}
                avatar_url={data.avatar_url || ""}
                html_url=""
                message={`Hi ${data.author}`}
                base_url={data.base_url}
              />

              {/* Main Content Section */}
              <div className="max-w-6xl mx-auto w-full px-4">
                {/* Three Column Layout */}
                <div className="flex flex-col lg:flex-row gap-6">
                  <TagSelector isDark={isDark} onSelectTag={handleTagSelect} />

                  {/* Middle Column - Main Content (Largest) */}
                  <main className="lg:flex-1 min-w-0">
                    <div className="w-full flex flex-col gap-y-4 sm:gap-y-6 min-h-[400px]">
                      {!isLoading && (
                        <Editor
                          apiBaseUrl={data.apiBaseUrl}
                          posts={posts}
                          setPosts={setPosts}
                          setIsEditorActive={setIsEditorActive}
                        />
                      )}

                      {!isEditorActive
                        ? (
                          <PostList
                            posts={posts}
                            data={{
                              isLogin: data.isLogin,
                              author: data.author,
                              avatar_url: data.avatar_url || "",
                            }}
                            isDark={isDark}
                            isMobile={isMobile}
                            api_base_url={data.apiBaseUrl}
                            share_base_url={data.share_base_url}
                            onOpenModal={handleOpenModal}
                          />
                        )
                        : (
                          <div className="h-[200px] transition-all duration-300 ease-in-out opacity-0">
                          </div>
                        )}
                    </div>
                  </main>

                  {/* Right Column - Advertisement */}
                  <Advertisement />
                </div>
              </div>
            </>
          )}
      </div>
    </main>
  );
}
