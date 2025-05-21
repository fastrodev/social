// deno-lint-ignore-file
import { useEffect, useRef, useState } from "preact/hooks";

import { JSX } from "preact/jsx-runtime";
import { ViewIcon } from "@app/components/icons/view.tsx";
import { ClipIcon } from "@app/components/icons/clip.tsx";
import { SubmitIcon } from "@app/components/icons/submit.tsx"; // Make sure this path is correct
import { EditIcon } from "@app/components/icons/edit.tsx";
import { XIcon } from "@app/components/icons/x.tsx";
import { CancelIcon } from "@app/components/icons/cancel.tsx";
import { renderMarkdownWithHashtags } from "../utils/markdown.ts";
import { extractTags } from "@app/utils/tags.ts";
import { getRandomImage } from "@app/utils/random.ts";
import { Post } from "@app/modules/index/type.ts";

// Update Props interface
interface Props {
  apiBaseUrl: string;
  posts: Post[];
  setPosts: (posts: Post[]) => void;
  setIsEditorActive: (active: boolean) => void;
}

export function Editor(
  { apiBaseUrl, posts, setPosts, setIsEditorActive }: Props,
) {
  const [postContent, setPostContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDark, _setIsDark] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showPreviewMode, setShowPreviewMode] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Simplify the initialization useEffect to avoid dependency on postContent
  useEffect(() => {
    // Only reset the editor state when the component mounts
    setIsEditing(false);
    setIsEditorActive(false);
  }, [setIsEditorActive]);

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
    cardBorder: isDark ? "border-purple-500/20" : "border-purple-400/20",
    cardGlow: isDark
      ? `shadow-lg
         hover:shadow-purple-500/10
         hover:border-purple-500/30
         hover:shadow-2xl
         transition-all
         duration-300
         before:absolute
         before:inset-0
         before:rounded-lg
         before:-z-10`
      : `shadow-lg
         hover:shadow-purple-400/10
         hover:border-purple-400/30
         hover:shadow-2xl
         transition-all
         duration-300
         before:absolute
         before:inset-0
         before:rounded-lg
         before:-z-10`,
  };

  function getPreviewBoxHeight(isEditing: boolean, isMobile: boolean) {
    if (isEditing) {
      return isMobile
        ? "min-h-[200px] max-h-[300px]" // Mobile editing mode
        : "min-h-[300px] max-h-[500px]"; // Desktop editing mode
    } else {
      return "min-h-[100px] max-h-[200px]"; // Consistent collapsed height
    }
  }

  const handleSubmit = async (e: JSX.TargetedEvent<HTMLFormElement, Event>) => {
    e.preventDefault();

    if (!postContent.trim()) return;

    setIsSubmitting(true);
    const extractedTags = extractTags(postContent);
    const postImage = imageUrl || getRandomImage(extractedTags);

    try {
      const response = await fetch(
        `${apiBaseUrl}/api/post`,
        {
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
        },
      );

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
    const hasContent = !!e.currentTarget.value.trim();

    // Only update these states if they're changing to avoid unnecessary rerenders
    if (hasContent !== isEditing) {
      setIsEditing(hasContent);
    }

    setIsEditorActive(hasContent);
  };

  const handleTextareaFocus = () => {
    // Always set editing mode and editor active on focus, regardless of content
    setIsEditing(true);
    setIsEditorActive(true);
  };

  const handleTextareaBlur = () => {
    if (!postContent.trim()) {
      setIsEditing(false);
      setIsEditorActive(false);
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

  // Conditionally apply glow effect based on device type
  const cardGlowClass = isMobile
    ? ""
    : isDark
    ? "shadow-[0_0_12px_3px_rgba(168,85,247,0.45)] hover:shadow-[0_0_30px_12px_rgba(168,85,247,0.5)]"
    : "shadow-[0_0_10px_2px_rgba(156,163,175,0.45)] hover:shadow-[0_0_30px_12px_rgba(156,163,175,0.5)]";

  const EditorSkeleton = () => (
    <div
      className={`${themeStyles.cardBg} mx-auto max-w-4xl rounded-lg px-4 pt-4 pb-2
        border ${themeStyles.cardBorder} backdrop-blur-lg animate-pulse relative
        ${themeStyles.cardGlow}`}
    >
      <div className="h-[100px] bg-gray-700/30 rounded-lg"></div>
    </div>
  );

  // Update the Tab component style
  const Tab = ({
    isActive,
    onClick,
    icon,
    label,
  }: {
    isActive: boolean;
    onClick: () => void;
    icon: JSX.Element;
    label: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 flex items-center gap-2 transition-colors rounded-t-md border-t border-x 
      ${
        isActive
          ? isDark
            ? "bg-gray-700/30 text-purple-400 border-gray-700"
            : "bg-gray-100/70 text-purple-600 border-gray-300"
          : isDark
          ? "text-gray-400 hover:text-gray-300 border-transparent"
          : "text-gray-600 hover:text-gray-700 border-transparent"
      }`}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </button>
  );

  // First, update the handleMarkdownFormatting function to include list types
  const handleMarkdownFormatting = (
    type: "bold" | "italic" | "underline" | "ordered-list" | "unordered-list",
  ) => {
    if (showPreviewMode || !textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    let prefix = "";
    let suffix = "";
    let textToInsert = selectedText;
    let selectionOffsetStart = 0;
    let selectionOffsetEnd = 0;

    if (type === "bold") {
      prefix = "**";
      suffix = "**";
      if (!selectedText) textToInsert = "bold text";
    } else if (type === "italic") {
      prefix = "*";
      suffix = "*";
      if (!selectedText) textToInsert = "italic text";
    } else if (type === "underline") {
      prefix = "<u>";
      suffix = "</u>";
      if (!selectedText) textToInsert = "underlined text";
    } else if (type === "ordered-list" || type === "unordered-list") {
      // For lists, we need to handle each line separately
      const listPrefix = type === "ordered-list" ? "1. " : "- ";

      if (!selectedText) {
        // If no text is selected, just insert a list item
        prefix = listPrefix;
        textToInsert = "List item";
        selectionOffsetStart = listPrefix.length;
        selectionOffsetEnd = listPrefix.length + textToInsert.length;
      } else {
        // For selected text, add list prefix to each line
        const lines = selectedText.split("\n");
        const formattedLines = lines.map((line, index) => {
          // For ordered lists, increment the number for each line
          const linePrefix = type === "ordered-list"
            ? `${index + 1}. `
            : listPrefix;
          return linePrefix + line;
        });
        textToInsert = formattedLines.join("\n");
        selectionOffsetStart = 0;
        selectionOffsetEnd = textToInsert.length;
      }
      prefix = "";
      suffix = "";
    }

    const newText = textarea.value.substring(0, start) +
      prefix +
      textToInsert +
      suffix +
      textarea.value.substring(end);

    setPostContent(newText);

    // Set cursor position after the operation
    setTimeout(() => {
      textarea.focus();
      if (type === "ordered-list" || type === "unordered-list") {
        textarea.selectionStart = start + selectionOffsetStart;
        textarea.selectionEnd = start + selectionOffsetEnd;
      } else if (selectedText) {
        textarea.selectionStart = start + prefix.length;
        textarea.selectionEnd = start + prefix.length + selectedText.length;
      } else {
        // Place cursor after the inserted text
        const newPosition = start + prefix.length + textToInsert.length;
        textarea.selectionStart = newPosition;
        textarea.selectionEnd = newPosition;
      }
    }, 0);
  };

  // Then add the list icon components (add these with the other icon imports at the top)
  const OrderedListIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="icon icon-tabler icons-tabler-outline icon-tabler-list-numbers"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M11 6h9" />
      <path d="M11 12h9" />
      <path d="M12 18h8" />
      <path d="M4 16a2 2 0 1 1 4 0c0 .591 -.5 1 -1 1.5l-3 2.5h4" />
      <path d="M6 10v-6l-2 2" />
    </svg>
  );

  const UnorderedListIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="icon icon-tabler icons-tabler-outline icon-tabler-list"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M9 6l11 0" />
      <path d="M9 12l11 0" />
      <path d="M9 18l11 0" />
      <path d="M5 6l0 .01" />
      <path d="M5 12l0 .01" />
      <path d="M5 18l0 .01" />
    </svg>
  );

  // First, create a BoldIcon component to match the style of other icons
  const BoldIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="icon icon-tabler icons-tabler-outline icon-tabler-bold"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M7 5h6a3.5 3.5 0 0 1 0 7h-6z" />
      <path d="M13 12h1a3.5 3.5 0 0 1 0 7h-7v-7" />
    </svg>
  );

  // Create an ItalicIcon component to match the style of the BoldIcon
  const ItalicIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="icon icon-tabler icons-tabler-outline icon-tabler-italic"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M11 5l6 0" />
      <path d="M7 19l6 0" />
      <path d="M14 5l-4 14" />
    </svg>
  );

  const UnderlineIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="icon icon-tabler icons-tabler-outline icon-tabler-underline"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M7 5v5a5 5 0 0 0 10 0v-5" />
      <path d="M5 19h14" />
    </svg>
  );

  // Add this icon component after the other icon components
  const HeadingIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="icon icon-tabler icons-tabler-outline icon-tabler-heading"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M7 12h10" />
      <path d="M7 4v16" />
      <path d="M17 4v16" />
    </svg>
  );

  // Add this function after handleMarkdownFormatting
  const handleHeadingFormatting = (level: "h1" | "h2" | "h3" | "normal") => {
    if (showPreviewMode || !textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const lines = textarea.value.split("\n");
    let currentLineStart = 0;

    // Find the start of the current line
    for (let i = 0; i < lines.length; i++) {
      const lineLength = lines[i].length + 1; // +1 for newline character
      if (currentLineStart + lineLength > start) {
        break;
      }
      currentLineStart += lineLength;
    }

    const currentLine = textarea.value.substring(
      currentLineStart,
      textarea.value.indexOf("\n", start) === -1
        ? textarea.value.length
        : textarea.value.indexOf("\n", start),
    );

    // Remove existing heading markup if any
    const cleanLine = currentLine.replace(/^#{1,3}\s/, "");

    let newLine;
    switch (level) {
      case "h1":
        newLine = `# ${cleanLine}`;
        break;
      case "h2":
        newLine = `## ${cleanLine}`;
        break;
      case "h3":
        newLine = `### ${cleanLine}`;
        break;
      case "normal":
        newLine = cleanLine;
        break;
    }

    const newText = textarea.value.substring(0, currentLineStart) +
      newLine +
      textarea.value.substring(
        currentLineStart + currentLine.length,
        textarea.value.length,
      );

    setPostContent(newText);

    // Maintain cursor position
    setTimeout(() => {
      textarea.focus();
      const cursorPosition = currentLineStart + newLine.length;
      textarea.selectionStart = cursorPosition;
      textarea.selectionEnd = cursorPosition;
    }, 0);
  };

  return (
    <>
      {isSubmitting ? <EditorSkeleton /> : (
        <div
          className={`${themeStyles.cardBg} mx-auto w-full rounded-lg px-4 pt-4 pb-2 
              border ${themeStyles.cardBorder} backdrop-blur-lg relative
              ${themeStyles.cardGlow}`}
        >
          <form onSubmit={handleSubmit}>
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

            <div className="relative flex flex-col gap-y-0">
              {isEditing && (
                <div className="flex flex-col">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-0 relative z-10">
                      <Tab
                        isActive={!showPreviewMode}
                        onClick={() => setShowPreviewMode(false)}
                        icon={<EditIcon />}
                        label="Edit"
                      />
                      <Tab
                        isActive={showPreviewMode}
                        onClick={() => setShowPreviewMode(true)}
                        icon={<ViewIcon />}
                        label="Preview"
                      />
                    </div>

                    {/* REPLACE the Markdown Help link with formatting buttons */}
                    <div className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto max-w-[70%] sm:max-w-none pr-1">
                      <button
                        type="button"
                        onClick={() => handleMarkdownFormatting("bold")}
                        className={`p-1.5 sm:px-1 rounded text-sm ${
                          isDark
                            ? "text-gray-300 hover:bg-gray-700/50 hover:text-purple-400"
                            : "text-gray-600 hover:bg-gray-200 hover:text-purple-600"
                        } transition-colors disabled:opacity-50 flex items-center justify-center min-w-[28px]`}
                        title="Bold (**text**)"
                        disabled={showPreviewMode}
                      >
                        <BoldIcon />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMarkdownFormatting("italic")}
                        className={`p-1.5 sm:px-1 rounded text-sm ${
                          isDark
                            ? "text-gray-300 hover:bg-gray-700/50 hover:text-purple-400"
                            : "text-gray-600 hover:bg-gray-200 hover:text-purple-600"
                        } transition-colors disabled:opacity-50 flex items-center justify-center min-w-[28px]`}
                        title="Italic (*text*)"
                        disabled={showPreviewMode}
                      >
                        <ItalicIcon />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMarkdownFormatting("underline")}
                        className={`p-1.5 sm:px-1 rounded text-sm underline ${
                          isDark
                            ? "text-gray-300 hover:bg-gray-700/50 hover:text-purple-400"
                            : "text-gray-600 hover:bg-gray-200 hover:text-purple-600"
                        } transition-colors disabled:opacity-50 flex items-center justify-center min-w-[28px]`}
                        title="Underline (<u>text</u>)"
                        disabled={showPreviewMode}
                      >
                        <UnderlineIcon />
                      </button>

                      {/* Add the new dropdown here */}
                      <div className="relative inline-block">
                        <button
                          type="button"
                          onClick={(e) => {
                            const dropdown = e.currentTarget.nextElementSibling;
                            if (dropdown) {
                              dropdown.classList.toggle("hidden");
                            }
                          }}
                          className={`p-1.5 sm:px-1 rounded text-sm ${
                            isDark
                              ? "text-gray-300 hover:bg-gray-700/50 hover:text-purple-400"
                              : "text-gray-600 hover:bg-gray-200 hover:text-purple-600"
                          } transition-colors disabled:opacity-50 flex items-center justify-center min-w-[28px]`}
                          disabled={showPreviewMode}
                        >
                          <HeadingIcon />
                        </button>
                        <div
                          className={`hidden absolute z-50 mt-1 py-1 w-40 rounded-md shadow-lg ${
                            isDark
                              ? "bg-gray-800 border border-gray-700"
                              : "bg-white border border-gray-200"
                          } ring-1 ring-black ring-opacity-5 right-0 sm:right-auto`}
                        >
                          {[
                            { label: "Heading 1", value: "h1" },
                            { label: "Heading 2", value: "h2" },
                            { label: "Heading 3", value: "h3" },
                            { label: "Normal text", value: "normal" },
                          ].map((item) => (
                            <button
                              key={item.value}
                              type="button"
                              onClick={(e) => {
                                handleHeadingFormatting(
                                  item.value as "h1" | "h2" | "h3" | "normal",
                                );
                                const dropdown =
                                  (e.currentTarget as HTMLElement).closest(
                                    "div.absolute",
                                  );
                                if (dropdown) {
                                  dropdown.classList.add("hidden");
                                }
                              }}
                              className={`block w-full text-left px-4 py-2 text-sm ${
                                isDark
                                  ? "text-gray-300 hover:bg-gray-700 hover:text-purple-400"
                                  : "text-gray-700 hover:bg-gray-100 hover:text-purple-600"
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleMarkdownFormatting("ordered-list")}
                        className={`p-1.5 sm:px-1 rounded text-sm ${
                          isDark
                            ? "text-gray-300 hover:bg-gray-700/50 hover:text-purple-400"
                            : "text-gray-600 hover:bg-gray-200 hover:text-purple-600"
                        } transition-colors disabled:opacity-50 flex items-center justify-center min-w-[28px]`}
                        title="Ordered List (1. item)"
                        disabled={showPreviewMode}
                      >
                        <OrderedListIcon />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleMarkdownFormatting("unordered-list")}
                        className={`p-1.5 sm:px-1 rounded text-sm ${
                          isDark
                            ? "text-gray-300 hover:bg-gray-700/50 hover:text-purple-400"
                            : "text-gray-600 hover:bg-gray-200 hover:text-purple-600"
                        } transition-colors disabled:opacity-50 flex items-center justify-center min-w-[28px]`}
                        title="Unordered List (- item)"
                        disabled={showPreviewMode}
                      >
                        <UnorderedListIcon />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {showPreviewMode
                ? (
                  <div
                    className={`w-full border ${themeStyles.cardBorder} ${themeStyles.text} overflow-y-auto px-4 py-3 rounded-b-lg scrollbar-thin scrollbar-track-transparent transition-all duration-300 ${
                      isDark
                        ? "bg-gray-700/30 scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-500"
                        : "bg-gray-100/70 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400"
                    } ${getPreviewBoxHeight(isEditing, isMobile)}`} // Added height classes
                    style={{ // Added explicit height style
                      height: isEditing
                        ? isMobile ? "200px" : "300px"
                        : "100px",
                    }}
                  >
                    {postContent
                      ? (
                        <div
                          className={`markdown-body ${themeStyles.text}`}
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
                    ref={textareaRef}
                    placeholder={isEditing
                      ? "Write your post here...\n\nTip: You can use Markdown formatting and #hashtags in the end of your post."
                      : "Share your thoughts..."}
                    value={postContent}
                    onInput={handleChange}
                    onFocus={handleTextareaFocus}
                    onBlur={handleTextareaBlur}
                    onClick={handleTextareaFocus} // Add onClick handler to ensure activation on click
                    required
                    spellcheck={true}
                    autoFocus
                    className={`w-full px-4 py-3 border ${themeStyles.input} 
        resize-none outline-none
        ${isEditing ? "rounded-b-lg" : "rounded-lg"}
        ${
                      isEditing
                        ? isMobile
                          ? "min-h-[200px] max-h-[300px]"
                          : "min-h-[300px] max-h-[500px]"
                        : "min-h-[100px] max-h-[200px]"
                    }
        transition-all duration-300 ease-in-out
        focus:ring-0 focus:ring-purple-500/50 focus:border-purple-500/50
        scrollbar-thin scrollbar-track-transparent
        ${
                      isDark
                        ? "scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-500"
                        : "scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400"
                    }`}
                    style={{
                      height: isEditing
                        ? isMobile ? "200px" : "300px"
                        : "100px",
                      marginTop: 0, // Remove extra margin
                    }}
                  />
                )}

              {!isEditing && (
                <div
                  className={`text-xs text-right italic ${themeStyles.footer} mt-2`} // Changed from mt-3
                >
                  Posts disappear after 7 days unless you sign up.
                </div>
              )}

              {/* Fixed positioning with consistent margin */}
              {isEditing && (
                <div className="h-10 flex justify-between items-center mt-2">
                  {/* Changed from mt-3 */}
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
      )}
    </>
  );
}
