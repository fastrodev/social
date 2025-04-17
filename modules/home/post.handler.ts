import { getSession } from "@app/utils/session.ts";
import { getPostById } from "@app/modules/home/home.service.ts";
import { Context, HttpRequest } from "fastro/mod.ts";

// Helper function to clean markdown for SEO description
function createSeoDescription(markdown: string, maxLength = 150): string {
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
function extractPostTitle(
  content: string,
  author: string,
  maxLength = 70,
): string {
  // Check if content starts with a markdown header
  const headerMatch = content.match(/^#+\s+(.+)$/m);

  if (headerMatch && headerMatch[1]) {
    // Return the header text exactly as is, only trimming whitespace
    const headerTitle = headerMatch[1].trim();

    return headerTitle.length > maxLength
      ? headerTitle.substring(0, maxLength) + "..."
      : headerTitle;
  }

  // If no header, use the first paragraph exactly as is
  const firstParagraph = content
    .split(/\n\s*\n/)[0] // Get first paragraph
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "") // Only remove images
    .trim();

  // If too long, truncate
  if (firstParagraph.length > maxLength) {
    return firstParagraph.substring(0, maxLength) + "...";
  }

  // If we couldn't extract anything meaningful, fall back to default
  if (!firstParagraph || firstParagraph.length < 10) {
    return `Post by ${author}`;
  }

  return firstParagraph;
}

export default async function postDetailHandler(
  req: HttpRequest,
  ctx: Context,
) {
  // Extract post ID from URL parameters provided by Fastro
  const id = req.params?.id;

  if (!id) {
    console.error("No post ID found in parameters");
    return new Response("No post ID provided", { status: 400 });
  }

  // Check if user is logged in, but don't restrict access
  const ses = await getSession(req, ctx);
  const isLogin = ses?.isLogin || false;
  const avatar_url = ses?.avatar_url || "";
  const html_url = ses?.html_url || "";
  const author = ses?.username || "";

  // Get the post details
  const post = await getPostById(id);
  console.log("Post retrieved:", post ? "Yes" : "No");

  if (!post) {
    // If post doesn't exist, redirect to home
    console.log("Post not found, redirecting to home");
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/home",
      },
    });
  }

  const baseUrl = Deno.env.get("BASE_URL") || "https://social.fastro.dev";
  const imageUrl = baseUrl + "/social.jpeg";
  const seoDescription = createSeoDescription(post.content);

  // Generate a more meaningful title based on post content
  let title = extractPostTitle(post.content, post.author);

  // Ensure the first character is uppercase
  if (title && title.length > 0) {
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }

  // Add author attribution to the title
  if (!title.includes(post.author)) {
    // Avoid redundancy if the author name is already in the title
    title = `${title} by ${post.author}`;
  }

  const image = post.image || imageUrl;
  return await ctx.render({
    title,
    description: seoDescription,
    image: image,
    isLogin,
    avatar_url,
    html_url,
    author,
    post,
    brand: Deno.env.get("BRAND") || "Fastro Social",
    url: `${baseUrl}/post/${id}`,
    publishDate: post.timestamp,
  });
}
