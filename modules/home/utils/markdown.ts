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
