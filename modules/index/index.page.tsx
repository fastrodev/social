// deno-lint-ignore-file
import { PageProps } from "fastro/core/server/types.ts";
import { HexaIcon } from "@app/components/icons/hexa.tsx";
import { useEffect, useState } from "preact/hooks";
import Header from "../../components/Header.tsx";

import { Editor } from "../../components/Editor.tsx";
import { PostList, Skeleton } from "../../components/PostList.tsx";
import { Post } from "@app/modules/index/type.ts";
import Welcome from "../../components/Welcome.tsx";

export default function Index({ data }: PageProps<
  {
    user: string;
    title: string;
    description: string;
    github_auth: string;
    base_url: string;
    apiBaseUrl: string;
    avatar_url?: string;
    isLogin: boolean;
    author: string;
    message: string;
  }
>) {
  const [_isHealthy, setIsHealthy] = useState(false);
  const [_isChecking, setIsChecking] = useState(true);
  const [isDark, setIsDark] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isEditorActive, setIsEditorActive] = useState(false);

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

  const fetchPosts = async (isInitial: boolean = false) => {
    try {
      setIsLoading(true);
      const base = data && data.base_url
        ? data.base_url
        : "https://web.fastro.dev/api/posts";

      console.log("base url", base);
      const url = new URL("/api/posts", base);
      // const url = new URL("https://web.fastro.dev/api/posts");
      url.searchParams.set("limit", "10");
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
        <Header
          isLogin={data.isLogin}
          avatar_url={data.avatar_url || ""}
          html_url=""
          message={`Hi ${data.author}`}
          base_url={data.base_url}
        />

        {/* Main Content Section */}
        <div className="max-w-xl mx-auto flex-1 w-full flex items-center justify-center">
          <main className="w-full relative flex flex-col h-full gap-y-4 sm:gap-y-6">
            {(posts.length === 0 || isLoading) && <Welcome key="welcome" />}
            <Editor
              apiBaseUrl={data.apiBaseUrl}
              posts={posts}
              setPosts={setPosts}
              setIsEditorActive={setIsEditorActive}
            />

            {!isEditorActive && (
              <>
                <PostList
                  posts={posts}
                  data={{
                    isLogin: data.isLogin,
                    author: data.author,
                    avatar_url: data.avatar_url || "",
                  }}
                  isDark={isDark}
                  isMobile={isMobile}
                  base_url={data.base_url || "https://web.fastro.dev"}
                />
                {isMobile && posts.length > 0
                  ? (
                    // load more posts when scrolled to the bottom
                    <>
                      {hasMore && (
                        <div className="mt-2 mb-4 flex justify-center">
                          <button
                            onClick={() => fetchPosts(false)}
                            disabled={isLoading}
                            className={`px-4 py-2 rounded-lg ${themeStyles.button} ${
                              isLoading ? "opacity-50" : ""
                            }`}
                          >
                            {isLoading ? "Loading..." : "Load More Posts"}
                          </button>
                        </div>
                      )}
                    </>
                  )
                  : (
                    <>
                    </>
                  )}
              </>
            )}
          </main>
        </div>
      </div>
    </main>
  );
}
