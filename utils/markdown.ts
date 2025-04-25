import { marked } from "marked";

export const renderMarkdownWithHashtags = (content: string) => {
  try {
    const contentWithoutHashtags = content.replace(/#\w+/g, "");

    let html = marked.parse(contentWithoutHashtags) as string;

    html = html.replace(/>\s+</g, "><").trim();
    return { __html: html };
  } catch (e) {
    console.error("Markdown parsing error:", e);
    const escaped = content
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return { __html: escaped };
  }
};

// Helper function to clean markdown for SEO description
export function createSeoDescription(
  markdown: string,
  maxLength = 150,
): string {
  // Convert markdown to plain text
  let text = markdown;

  // Remove markdown headers (# Title)
  text = text.replace(/^#+ .*$/gm, "").trim();

  // Remove other markdown syntax
  text = text
    .replace(/[*_`~#>]+/g, "") // Remove formatting chars
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Replace links with just text
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "") // Remove images
    .replace(/\n+/g, " ") // Replace newlines with spaces
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();

  // If after cleaning we have empty text, fall back to original with basic cleaning
  if (!text) {
    text = markdown.replace(/[#*_`~>]+/g, "").trim();
  }

  // Truncate to desired length
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + "...";
  }

  return text;
}

// Extract a meaningful title from post content
export function extractPostTitle(
  content: string,
  _author: string,
  maxLength = 140,
): string {
  console.log("Extracting title from post content");
  // Get the first line of content
  const firstLine = content.trim().split("\n")[0];

  // Remove leading # characters if present
  const cleanTitle = firstLine.replace(/^#+\s*/, "").trim();

  // If title is too long, truncate
  if (cleanTitle.length > maxLength) {
    return cleanTitle.substring(0, maxLength) + "...";
  }

  console.log("Cleaned title:", cleanTitle);
  return cleanTitle;
}
