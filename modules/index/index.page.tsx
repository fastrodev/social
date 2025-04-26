// deno-lint-ignore-file
import { PageProps } from "fastro/core/server/types.ts";
import { HexaIcon } from "@app/components/icons/hexa.tsx";
import { useEffect, useState } from "preact/hooks";
import Header from "@app/modules/home/header.tsx";

import { Editor } from "@app/modules/index/Editor.tsx";
import { PostList, Skeleton } from "@app/modules/index/PostList.tsx";
import { Post } from "@app/modules/index/type.ts";

export default function Index({ data }: PageProps<
  {
    user: string;
    title: string;
    description: string;
    github_auth: string;
    base_url?: string;
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

  console.log("Rendering Index with data:", data);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleScroll = async (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !isLoading) {
        setIsLoading(true);
        await fetchPosts(false);
      }
    };

    const observer = new IntersectionObserver(handleScroll, {
      root: null,
      threshold: 1.0,
    });

    const sentinel = document.getElementById("scroll-sentinel");
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, cursor]);

  useEffect(() => {
    fetchPosts(true);
  }, []);

  const fetchPosts = async (isInitial: boolean = false) => {
    try {
      const url = new URL("/api/posts", window.location.origin);
      url.searchParams.set("limit", "4");
      if (!isInitial && cursor) {
        url.searchParams.set("cursor", cursor);
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      const data = await response.json();

      if (data.length < 4) {
        setHasMore(false);
      }

      if (data.length > 0) {
        setCursor(data[data.length - 1].id);
        setPosts((prev) => isInitial ? data : [...prev, ...data]);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-gray-950 relative overflow-hidden">
      <div className="fixed inset-0 z-0 opacity-20">
        <HexaIcon />
      </div>

      <div className="relative z-10 min-h-screen">
        <Header
          isLogin={false}
          avatar_url=""
          html_url=""
          message=""
          base_url={data.base_url}
        />

        {/* Main Content Section */}
        <div className="max-w-xl mx-auto">
          <main
            className={`max-w-2xl mx-auto relative flex flex-col gap-y-3 sm:gap-y-6`}
          >
            <Editor posts={posts} setPosts={setPosts} />
            <PostList
              posts={posts}
              data={{
                isLogin: false,
                author: "anonymous",
              }}
              isDark={isDark}
              isMobile={isMobile}
            />
            {hasMore && <div id="scroll-sentinel" />}
            {isLoading && <Skeleton />}
          </main>
        </div>
      </div>
    </main>
  );
}
