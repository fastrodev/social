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

  console.log("Rendering Index with data:", data);

  useEffect(() => {
    const checkHealth = async () => {
      const maxRetries = 5;
      const retryDelay = 2000;

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const response = await fetch(
            "https://web.fastro.dev/api/healthcheck",
          );
          console.log(`Health check attempt ${attempt + 1}:`, response);

          if (response.ok) {
            setIsHealthy(true);
            setIsChecking(false);
            return;
          }

          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        } catch (error) {
          console.error(`Health check attempt ${attempt + 1} failed:`, error);
          if (attempt === maxRetries - 1) {
            setIsChecking(false);
          }
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
      }
      setIsChecking(false);
    };

    checkHealth();
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/posts?limit=10");
        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

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
            {isLoading ? <Skeleton /> : (
              <PostList
                posts={posts}
                data={{
                  isLogin: false,
                  author: "anonymous",
                }}
                isDark={isDark}
                isMobile={isMobile}
              />
            )}
          </main>
        </div>
      </div>
    </main>
  );
}
