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

type User = {
  id: string;
  name: string;
  avatar: string;
};

export default function Index({ data }: PageProps<{
  user: User; // Update this type
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
}>) {
  const [isDark, setIsDark] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // const [hasMore, setHasMore] = useState(true);
  const [isEditorActive, setIsEditorActive] = useState(false);
  const [modalState, setModalState] = useState<{
    open: boolean;
    post: Post | null;
    comments: Comment[];
  }>({ open: false, post: null, comments: [] });

  useEffect(() => {
    // Initial check
    const initialWidth = window.innerWidth;
    setIsMobile(initialWidth < 768);

    // Direct resize handler without debounce
    const checkMobile = () => {
      const isMobileWidth = window.innerWidth < 768;
      // Still keep the value check to avoid unnecessary rerenders
      if (isMobileWidth !== isMobile) {
        setIsMobile(isMobileWidth);
      }
    };

    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [isMobile]);

  useEffect(() => {
    healthCheck(true);
  }, []);

  useEffect(() => {
    const userCookie = getCookie("oauth-session");
    console.log("oauth-session cookie:", userCookie);
  }, []);

  const healthCheck = async (isInitial: boolean = false) => {
    try {
      setIsLoading(true);
      const url = new URL("/api/healthcheck", data.apiBaseUrl);
      await fetch(url);
    } catch (error) {
      console.error("Health check failed:", error);
      if (isInitial) {
        setIsLoading(false);
      }
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

  return (
    <main className="min-h-screen flex flex-col bg-gray-950 relative overflow-hidden">
      {/* Background hexagon pattern */}
      <div className="fixed inset-0 z-0 opacity-20">
        <HexaIcon />
      </div>

      {/* Modal should be outside the transformed container */}
      {modalState.open && modalState.post && (
        <div className="fixed inset-0 z-50">
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
        </div>
      )}

      {/* Main content container */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {isLoading
          ? (
            <div className="flex-1 flex items-center justify-center transform translate-z-0">
              <Welcome key="welcome" />
            </div>
          )
          : (
            <>
              {/* Header is sticky to the viewport */}
              <Header
                className="sticky top-0 z-30 bg-gray-950 shadow-md"
                isLogin={data.isLogin}
                avatar_url={data.avatar_url || ""}
                html_url=""
                message={`Hi ${data.author}`}
                base_url={data.base_url}
              />

              {/* Main Content Section */}
              <div className="max-w-6xl mx-auto w-full px-4">
                {/* Three Column Layout */}
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Left Column - TagSelector */}
                  {!isEditorActive && (
                    <div className="hidden lg:block w-64 flex-shrink-0">
                      <div className="">
                        <TagSelector
                          isDark={isDark}
                          onSelectTag={handleTagSelect}
                          user={data.isLogin
                            ? {
                              id: data.author,
                              name: data.author,
                              avatar: data.avatar_url || "",
                            }
                            : undefined}
                        />
                      </div>
                    </div>
                  )}

                  {/* Middle Column - Main Content */}
                  <main className="lg:flex-1 min-w-0">
                    <div className="w-full flex flex-col gap-y-4 h-[calc(100vh-78px)] overflow-y-auto scrollbar-hide">
                      {!isLoading && (
                        <Editor
                          apiBaseUrl={data.apiBaseUrl}
                          posts={posts}
                          setPosts={setPosts}
                          setIsEditorActive={setIsEditorActive}
                        />
                      )}

                      {!isEditorActive && (
                        <PostList
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
                      )}
                    </div>
                  </main>

                  {/* Right Column - Advertisement */}
                  {!isEditorActive && (
                    <div className="hidden lg:block w-80 flex-shrink-0">
                      <div className="sticky z-20">
                        <Advertisement />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
      </div>
    </main>
  );
}
