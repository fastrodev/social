// deno-lint-ignore-file
import { useEffect, useRef, useState } from "preact/hooks";

import { JSX } from "preact/jsx-runtime";
import { ViewIcon } from "@app/components/icons/view.tsx";
import { ClipIcon } from "@app/components/icons/clip.tsx";
import { SubmitIcon } from "@app/components/icons/submit.tsx"; // Make sure this path is correct
import { EditIcon } from "@app/components/icons/edit.tsx";
import { XIcon } from "@app/components/icons/x.tsx";
import { CancelIcon } from "@app/components/icons/cancel.tsx";
import { renderMarkdownWithHashtags } from "../../utils/markdown.ts";
import { extractTags } from "@app/utils/tags.ts";
import { getRandomImage } from "@app/utils/random.ts";
import { Post } from "@app/modules/index/type.ts";

// Update Props interface
interface Props {
  posts: Post[];
  setPosts: (posts: Post[]) => void;
  setIsEditorActive: (active: boolean) => void;
}

export function Editor({ posts, setPosts, setIsEditorActive }: Props) {
  const [postContent, setPostContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDark, _setIsDark] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showPreviewMode, setShowPreviewMode] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);

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
      ? "shadow-2xl shadow-purple-500/30"
      : "shadow-lg shadow-gray-200/30",
  };

  const handleSubmit = async (e: JSX.TargetedEvent<HTMLFormElement, Event>) => {
    e.preventDefault();

    if (!postContent.trim()) return;

    setIsSubmitting(true);
    const extractedTags = extractTags(postContent);
    const postImage = imageUrl || getRandomImage(extractedTags);

    try {
      const response = await fetch("https://web.fastro.dev/api/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: postContent,
          isMarkdown: true,
          image: postImage,
          defaultImage: postImage,
        }),
      });

      if (response.ok) {
        const newPost = await response.json();
        setPosts([newPost, ...posts]);
        resetForm();
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
    setIsEditing(!!e.currentTarget.value.trim());
    setIsEditorActive(!!e.currentTarget.value.trim());
  };

  const handleTextareaFocus = () => {
    setIsEditing(true);
    setIsEditorActive(true); // Add this line to hide posts when textarea is focused
  };

  const handleTextareaBlur = () => {
    if (!postContent.trim()) {
      setIsEditing(false);
      setIsEditorActive(false); // Add this line to show posts when textarea is empty and loses focus
    }
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
      const deleteUrlResponse = await fetch(
        "https://web.fastro.dev/api/delete-signed-url",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ filename }),
        },
      );

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

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
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
      const signedUrlResponse = await fetch(
        "https://web.fastro.dev/api/signed-url",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          // Send both filename and contentType
          body: JSON.stringify({ filename, contentType: file.type }),
        },
      );

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

  const resetForm = () => {
    setPostContent("");
    setImageUrl(null);
    setIsEditing(false);
    setIsEditorActive(false);
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const renderMarkdown = renderMarkdownWithHashtags;

  return (
    <>
      <div
        className={`${themeStyles.cardBg} rounded-lg p-4 sm:p-6 border ${themeStyles.cardBorder} backdrop-blur-lg ${themeStyles.cardGlow}`}
      >
        <form
          onSubmit={handleSubmit}
        >
          {imageUrl && (
            <div className="mt-3 mb-3 relative">
              <img
                src={imageUrl}
                alt="Post attachment"
                className="w-full h-[330px] rounded-lg object-cover"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 hover:bg-gray-700 text-white w-6 h-6 flex items-center justify-center transition-colors"
                aria-label="Remove image"
              >
                <XIcon />
              </button>
            </div>
          )}

          <div className="relative flex flex-col gap-y-3">
            {isEditing && (
              <div className="flex justify-between items-center">
                <div className={`flex items-center ${themeStyles.text}`}>
                  <button
                    type="button"
                    onClick={() => setShowPreviewMode(!showPreviewMode)}
                    className={`px-4 py-1.5 rounded-lg flex items-center gap-2 ${
                      isDark
                        ? "text-gray-300 hover:bg-gray-600/30 bg-gray-700/30"
                        : "text-gray-700 hover:bg-gray-200/30"
                    }`}
                  >
                    {showPreviewMode
                      ? (
                        <>
                          <EditIcon />
                          <span className="text-sm">Edit</span>
                        </>
                      )
                      : (
                        <>
                          <ViewIcon />
                          <span className="text-sm">Preview</span>
                        </>
                      )}
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
            )}

            {showPreviewMode
              ? (
                <div
                  className={`w-full rounded-lg border ${themeStyles.cardBorder} ${themeStyles.text} 
                        ${
                    isEditing
                      ? isMobile
                        ? "min-h-[150px] h-[200px]"
                        : "min-h-[300px] h-[400px]"
                      : isMobile
                      ? "min-h-[60px] h-[100px]"
                      : "min-h-[80px] h-[120px]"
                  } max-h-[600px] overflow-y-auto p-3
                        ${
                    isDark
                      ? "scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-500"
                      : "scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400"
                  } scrollbar-thin scrollbar-track-transparent transition-all duration-300`}
                >
                  {postContent
                    ? (
                      <div
                        className={`markdown-body prose prose-sm dark:prose-invert max-w-none ${themeStyles.text}`}
                        dangerouslySetInnerHTML={renderMarkdown(
                          postContent,
                        )}
                      />
                    )
                    : (
                      <div className="opacity-70 text-sm">
                        Nothing to preview yet.
                      </div>
                    )}
                </div>
              )
              : (
                <textarea
                  placeholder="What's on your mind?"
                  value={postContent}
                  onInput={handleChange}
                  onFocus={handleTextareaFocus}
                  onBlur={handleTextareaBlur}
                  required
                  className={`w-full ps-4 py-2 sm:p-3 rounded-lg border ${themeStyles.input}
                        resize-none ${
                    isEditing
                      ? isMobile
                        ? "min-h-[150px] h-[200px]"
                        : "min-h-[300px] h-[400px]"
                      : isMobile
                      ? "min-h-[45px] h-[45px]"
                      : "min-h-[55px] h-[55px]"
                  } max-h-[600px] 
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        scrollbar-thin scrollbar-track-transparent transition-all duration-300
                        ${
                    isDark
                      ? "scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-500"
                      : "scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400"
                  }`}
                />
              )}

            {/* Fixed positioning with consistent margin */}
            {isEditing && (
              <div className="h-10 flex justify-between items-center">
                <div>
                  <button
                    type="button"
                    onClick={handleAttachmentClick}
                    className={`px-4 py-1.5 rounded-lg flex items-center gap-2 ${
                      isDark
                        ? "text-gray-400 bg-gray-700/30 hover:text-gray-200 hover:bg-gray-600/30"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/30"
                    } transition-colors`}
                    aria-label="Add attachment"
                    disabled={uploadingImage || showPreviewMode}
                  >
                    {uploadingImage
                      ? (
                        <>
                          <span className="animate-pulse">⏳</span>
                          <span className="text-sm hidden sm:inline">
                            Uploading...
                          </span>
                        </>
                      )
                      : (
                        <>
                          <ClipIcon />
                          <span className="text-sm hidden sm:inline">
                            Attachment
                          </span>
                        </>
                      )}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/jpeg,image/png,image/gif"
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={resetForm}
                    className={`px-4 py-1.5 rounded-lg flex items-center gap-2 ${
                      isDark
                        ? "text-gray-300 hover:text-red-400 hover:bg-gray-700/50"
                        : "text-gray-600 hover:text-red-600 hover:bg-gray-100"
                    } border ${
                      isDark ? "border-gray-700" : "border-gray-300"
                    } transition-colors`}
                    aria-label="Cancel post"
                  >
                    <CancelIcon />
                    <span className="text-sm font-medium">
                      Cancel
                    </span>
                  </button>

                  <button
                    type="submit"
                    className={`px-4 py-1.5 rounded-lg flex items-center gap-2 ${
                      isDark
                        ? "bg-purple-600 hover:bg-purple-500 text-white"
                        : "bg-purple-500 hover:bg-purple-400 text-white"
                    } disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                    disabled={isSubmitting || uploadingImage ||
                      !postContent.trim()}
                    aria-label="Submit post"
                  >
                    <SubmitIcon />
                    <span className="text-sm font-medium">Create</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </>
  );
}
