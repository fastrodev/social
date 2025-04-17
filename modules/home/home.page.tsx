// deno-lint-ignore-file
import { useEffect, useRef, useState } from "preact/hooks";
import Header from "./header.tsx";
import { JSX } from "preact/jsx-runtime";
import { PageProps } from "fastro/mod.ts";
import { HexaIcon } from "@app/components/icons/hexa.tsx";
import { CommentIcon } from "@app/components/icons/comment.tsx";
import { ViewIcon } from "@app/components/icons/view.tsx";
import { DeleteIcon } from "@app/components/icons/delete.tsx";
import { ClipIcon } from "@app/components/icons/clip.tsx";
import { SubmitIcon } from "@app/components/icons/submit.tsx"; // Make sure this path is correct
import { VDotsIcon } from "@app/components/icons/vdots.tsx"; // Import the VdotsIcon
import { marked } from "marked";

interface Post {
  id: string;
  content: string;
  timestamp: string;
  author: string;
  avatar: string;
  commentCount?: number;
  viewCount?: number;
  views?: number;
  isMarkdown?: boolean;
  image?: string; // Add this field for image URL
}

export default function Home({ data }: PageProps<{
  user: string;
  title: string;
  description: string;
  baseUrl: string;
  isLogin: boolean;
  avatar_url: string;
  html_url: string;
  author: string;
  message?: string;
  posts: Post[];
}>) {
  const [postContent, setPostContent] = useState("");
  const [posts, setPosts] = useState<Post[]>(data.posts || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showPreviewMode, setShowPreviewMode] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detect mobile devices
  useEffect(() => {
    console.log("author", data.author);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const renderMarkdown = (content: string) => {
    try {
      const html = marked.parse(content, {
        // Remove mangle and headerIds options as they don't exist in the type definition
      });

      return { __html: typeof html === "string" ? html : String(html) };
    } catch (e) {
      console.error("Markdown parsing error:", e);
      return { __html: content };
    }
  };

  const handleFileSelect = async (
    e: JSX.TargetedEvent<HTMLInputElement, Event>,
  ) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file (JPEG, PNG, etc.)");
      return;
    }

    setUploadingImage(true);

    try {
      // Generate a unique filename
      const extension = file.name.split(".").pop();
      const filename = `uploads/${Date.now()}-${
        Math.random()
          .toString(36)
          .substring(2, 15)
      }.${extension}`;

      console.log("Requesting signed URL for:", filename);

      // Get a signed URL from our API
      const signedUrlResponse = await fetch("/api/signed-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Send both filename and contentType
        body: JSON.stringify({ filename, contentType: file.type }),
      });

      if (!signedUrlResponse.ok) {
        const errorData = await signedUrlResponse.text();
        console.error("Signed URL response error:", errorData);
        throw new Error(`Failed to get signed URL: ${errorData}`);
      }

      const data = await signedUrlResponse.json();
      console.log("Signed URL received:", data);

      if (!data.signedUrl) {
        throw new Error("No signed URL returned from server");
      }

      const { signedUrl } = data;

      // Upload the file using the signed URL
      console.log("Uploading to signed URL...");
      const uploadResponse = await fetch(signedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
          // Add this header back, matching the one in signed-url.ts
          "x-goog-content-length-range": "0,10485760",
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        const uploadErrorText = await uploadResponse.text();
        console.error("Upload error details:", uploadErrorText);
        throw new Error(
          `Failed to upload image: ${uploadResponse.status} ${uploadResponse.statusText}`,
        );
      }

      console.log("Upload successful");

      // Extract the public URL (IMPORTANT: The URL structure must be correct for your bucket)
      // If your bucket is set up for public access, you can use this URL format
      const publicUrl =
        `https://storage.googleapis.com/replix-394315-file/${filename}`;
      console.log("Setting public URL:", publicUrl);
      setImageUrl(publicUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert(
        `Failed to upload image: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = async () => {
    if (!imageUrl) return;

    // Extract filename from the public URL
    const urlParts = imageUrl.split("/");
    const filename = urlParts.slice(4).join("/");

    if (!filename) {
      console.error("Could not extract filename from URL:", imageUrl);
      setImageUrl(null); // Clear preview even if we can't delete
      return;
    }

    console.log("Requesting DELETE signed URL for filename:", filename);

    try {
      // 1. Get the DELETE signed URL from the backend
      const deleteUrlResponse = await fetch("/api/delete-signed-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filename }),
      });

      if (!deleteUrlResponse.ok) {
        const errorData = await deleteUrlResponse.text();
        console.error("Failed to get DELETE signed URL:", errorData);
        alert("Could not prepare file deletion request. Please try again.");
        // Decide if you want to clear the preview here or not
        // setImageUrl(null);
        return; // Stop if we can't get the URL
      }

      const data = await deleteUrlResponse.json();
      if (!data.signedUrl) {
        throw new Error("No DELETE signed URL returned from server");
      }

      const deleteSignedUrl = data.signedUrl;
      console.log("DELETE Signed URL received.");

      // 2. Use the signed URL to execute the DELETE request
      console.log("Executing DELETE request using signed URL...");
      const deleteResponse = await fetch(deleteSignedUrl, {
        method: "DELETE",
        // No body or Content-Type needed for standard GCS DELETE via signed URL
      });

      if (!deleteResponse.ok) {
        // Handle potential errors during the actual delete operation
        const deleteErrorText = await deleteResponse.text();
        console.error("Error executing DELETE signed URL:", deleteErrorText);
        // Inform user, but maybe still clear preview
        alert(
          "Failed to delete the file from storage. It might have already been deleted.",
        );
      } else {
        console.log("File deleted successfully using signed URL.");
      }
    } catch (error) {
      console.error("Error during the delete process:", error);
    } finally {
      // Always remove the image preview from the UI after attempting deletion
      setImageUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = async (e: JSX.TargetedEvent<HTMLFormElement, Event>) => {
    e.preventDefault();

    if (!postContent.trim()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: postContent,
          isMarkdown: true,
          image: imageUrl,
        }),
      });

      if (response.ok) {
        const newPost = await response.json();
        setPosts([newPost, ...posts]);
        setPostContent("");
        setImageUrl(null);
        setSubmitSuccess(true);

        // Reset success message after 3 seconds
        setTimeout(() => {
          setSubmitSuccess(false);
        }, 3000);
      } else {
        console.error("Failed to create post");
      }
    } catch (error) {
      console.error("Error submitting post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: { currentTarget: { value: string } }) => {
    setPostContent(e.currentTarget.value);
  };

  const handleKeyDown = (
    e: JSX.TargetedEvent<HTMLTextAreaElement, KeyboardEvent>,
  ) => {
    // Only override Enter key behavior on non-mobile devices (desktop)
    if (!isMobile && e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent newline on desktop Enter

      if (postContent.trim()) {
        // Trigger form submission
        handleSubmit({
          preventDefault: () => {},
          currentTarget: e.currentTarget.form, // Pass the form if needed by handleSubmit
        } as unknown as JSX.TargetedEvent<HTMLFormElement, Event>);
      }
    }
    // On mobile: Let Enter key behave normally (insert newline).
    // On desktop: Shift+Enter also behaves normally (insert newline) because we don't preventDefault.
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      const response = await fetch(`/api/post/${postId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setPosts(posts.filter((post) => post.id !== postId));
      } else {
        console.error("Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const themeStyles = {
    background: isDark ? "#0f172a" : "#f8fafc",
    cardBg: isDark ? "bg-gray-800/90" : "bg-white/90",
    text: isDark ? "text-gray-100" : "text-gray-800",
    input: isDark
      ? "bg-gray-700/30 border-gray-600 text-white placeholder-gray-400"
      : "bg-gray-100/70 border-gray-300 text-gray-900 placeholder-gray-500",
    button: isDark
      ? "bg-purple-600 hover:bg-purple-700"
      : "bg-purple-500 hover:bg-purple-600",
    footer: isDark ? "text-gray-400" : "text-gray-600",
    link: isDark
      ? "text-purple-400 hover:text-purple-300"
      : "text-purple-600 hover:text-purple-500",
    cardBorder: isDark ? "border-gray-700" : "border-gray-200",
    cardGlow: isDark
      ? "shadow-lg shadow-purple-900/30"
      : "shadow-lg shadow-purple-200/30",
  };

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0"
          style={{ backgroundColor: themeStyles.background }}
        />
        <div
          className={`fixed inset-0 z-0 ${
            isMobile ? "opacity-10" : "opacity-20"
          }`}
        >
          <HexaIcon />
        </div>
      </div>

      <div className="relative z-10 min-h-screen">
        <button
          type="button"
          onClick={toggleTheme}
          className={`fixed bottom-4 right-4 p-3 rounded-full transition-colors 
            shadow-lg hover:scale-110 transform duration-200 z-50
            ${
            isDark ? "bg-gray-800 text-gray-200" : "bg-gray-200 text-gray-800"
          }`}
          aria-label="Toggle theme"
        >
          {isDark ? "☀️" : "🌙"}
        </button>

        <div className="max-w-xl mx-auto">
          <Header
            isLogin={data.isLogin}
            avatar_url={data.avatar_url}
            html_url={data.html_url}
            isDark={isDark}
            message={data.message}
          />

          {/* Main Container */}
          <main className="max-w-2xl mx-auto px-3 sm:px-4 relative">
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-purple-600/30 via-blue-500/20 to-transparent blur-3xl transform-gpu animate-pulse-slow" />
            <div
              className={`${themeStyles.cardBg} rounded-lg ${themeStyles.cardGlow} p-4 sm:p-6 mb-4 border ${themeStyles.cardBorder} backdrop-blur-lg`}
            >
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <div className="flex justify-between items-center mb-2">
                    <div className={`flex items-center ${themeStyles.text}`}>
                      <button
                        type="button"
                        onClick={() => setShowPreviewMode(!showPreviewMode)}
                        className={`text-xs px-2 py-1 rounded border ${
                          isDark
                            ? "text-gray-300 hover:bg-gray-700 border-gray-600"
                            : "text-gray-700 hover:bg-gray-200 border-gray-300"
                        }`}
                      >
                        {showPreviewMode ? "Edit" : "Preview"}
                      </button>
                    </div>

                    <a
                      href="https://www.markdownguide.org/cheat-sheet/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-xs ${themeStyles.link}`}
                    >
                      Markdown Help
                    </a>
                  </div>

                  {showPreviewMode
                    ? (
                      <div
                        className={`w-full rounded-lg border ${themeStyles.cardBorder} ${themeStyles.text} min-h-[100px] max-h-[400px] overflow-y-auto`}
                      >
                        {postContent
                          ? (
                            <div
                              className="markdown-preview prose prose-sm dark:prose-invert max-w-none p-3"
                              dangerouslySetInnerHTML={renderMarkdown(
                                postContent,
                              )}
                            />
                          )
                          : (
                            <div
                              className={`p-4 text-sm opacity-70`}
                            >
                              Nothing to preview yet.
                            </div>
                          )}
                      </div>
                    )
                    : (
                      <textarea
                        placeholder="What's on your mind? (Markdown supported)"
                        value={postContent}
                        onInput={handleChange}
                        onKeyDown={handleKeyDown}
                        required
                        rows={4}
                        className={`w-full px-4 py-2 rounded-lg border ${themeStyles.input} 
                          resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          scrollbar-thin scrollbar-track-transparent
                          ${
                          isDark
                            ? "scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-500"
                            : "scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400"
                        }`}
                      />
                    )}
                  <div className="mt-0 flex justify-between items-center">
                    <div>
                      <p
                        className={`text-xs ${themeStyles.footer} hidden sm:block`}
                      >
                        Press Enter to submit, Shift+Enter for new line
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Wrapper for buttons */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="image/jpeg,image/png,image/gif"
                        className="hidden"
                      />

                      <button
                        type="button"
                        onClick={handleAttachmentClick}
                        className={`p-1.5 rounded-full ${
                          isDark
                            ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700/30"
                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/30"
                        } transition-colors`}
                        aria-label="Add attachment"
                        disabled={uploadingImage}
                      >
                        {uploadingImage
                          ? <span className="animate-pulse">⏳</span>
                          : <ClipIcon />}
                      </button>

                      {/* Mobile Post Button */}
                      <button
                        type="submit"
                        className={`sm:hidden p-1.5 rounded-full text-sm font-medium transition-colors ${
                          // Changed to rounded-full
                          isDark
                            ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700/30" // Matched attachment button styles
                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/30" // Matched attachment button styles
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                        disabled={isSubmitting || uploadingImage ||
                          !postContent.trim()}
                        aria-label="Submit post" // Added aria-label for accessibility
                      >
                        <SubmitIcon />
                      </button>
                    </div>
                  </div>

                  {imageUrl && (
                    <div className="mt-3 relative">
                      <img
                        src={imageUrl}
                        alt="Uploaded preview"
                        className="max-h-60 w-auto rounded-lg object-contain bg-gray-100/10"
                      />
                      <button
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 bg-gray-800/70 hover:bg-gray-700 text-white rounded-full p-1"
                        aria-label="Remove image"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                {submitSuccess || isSubmitting
                  ? (
                    <div className="flex justify-start w-full">
                      {submitSuccess && (
                        <div className="bg-green-500/20 text-green-500 px-4 py-2 rounded-lg">
                          Post created successfully!
                        </div>
                      )}
                      {isSubmitting && (
                        <div className="bg-blue-500/20 text-blue-500 px-4 py-2 rounded-lg">
                          Posting...
                        </div>
                      )}
                    </div>
                  )
                  : ""}
              </form>
            </div>

            <div className="space-y-4 mb-8">
              {posts.length > 0
                ? (
                  posts.map((post) => (
                    <div
                      key={post.id}
                      className={`${themeStyles.cardBg} rounded-lg p-4 sm:p-6 border ${themeStyles.cardBorder} relative ${
                        !isMobile ? "backdrop-blur-lg" : ""
                      } ${
                        !isMobile
                          ? "transition-all duration-300 hover:scale-[1.01]"
                          : ""
                      }`}
                    >
                      {data.isLogin && ( // Show icon only if logged in
                        <button
                          type="button"
                          onClick={data.author === post.author
                            ? () => handleDeletePost(post.id)
                            : undefined} // Only set onClick for author
                          className={`absolute top-4 right-3 sm:right-4 p-1.5 rounded-full hover:bg-gray-700/30 transition-colors ${
                            isDark
                              ? "text-gray-400 hover:text-gray-200"
                              : "text-gray-500 hover:text-gray-700"
                          } ${
                            data.author !== post.author ? "cursor-pointer" : ""
                          }`} // Add cursor-pointer for vdots
                          aria-label={data.author === post.author
                            ? "Delete post"
                            : "More options"}
                        >
                          {data.author === post.author
                            ? <DeleteIcon />
                            : <VDotsIcon />}
                        </button>
                      )}

                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
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

                      <a href={`/post/${post.id}`} className="block">
                        {post.image && (
                          <div className="mb-3">
                            <img
                              src={post.image}
                              alt="Post attachment"
                              className="w-full rounded-lg object-cover"
                            />
                          </div>
                        )}
                        <div
                          className={`${themeStyles.text} whitespace-pre-wrap mb-0 markdown-content prose prose-sm dark:prose-invert ${
                            post.content.length > 1000
                              ? "relative overflow-hidden max-h-[300px]"
                              : ""
                          }`}
                          dangerouslySetInnerHTML={renderMarkdown(
                            post.content.length > 280
                              ? post.content.substring(0, 280) + "..."
                              : post.content,
                          )}
                        />
                        {post.content.length > 280 && (
                          <div
                            className={`text-right mt-1 mb-6 ${themeStyles.link} text-sm`}
                          >
                            Read more...
                          </div>
                        )}
                      </a>

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
                                  {post.commentCount} {post.commentCount === 1
                                    ? "comment"
                                    : "comments"}
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
                          <span className="flex items-center">
                            <ViewIcon />
                            {post.views || post.viewCount || 0} views
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )
                : (
                  <div
                    className={`${themeStyles.cardBg} rounded-lg p-6 border ${themeStyles.cardBorder} text-center ${themeStyles.text} ${
                      !isMobile ? "backdrop-blur-lg" : ""
                    }`}
                  >
                    <p>No posts yet. Be the first to post something!</p>
                  </div>
                )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
