import { getSession } from "@app/utils/session.ts";
import { Context, HttpRequest } from "fastro/mod.ts";
import {
  createPost,
  deletePostById,
  editPostById,
  getPostById,
  getPostsFromDb,
} from "./post.service.ts";
import {
  createSeoDescription,
  extractPostTitle,
} from "../../utils/markdown.ts";
import { extractTags } from "@app/utils/tags.ts";
import { getCorsHeaders } from "@app/utils/headers.ts";

function generateAnonymousUsername(): string {
  const colors = [
    "red",
    "blue",
    "green",
    "yellow",
    "purple",
    "orange",
    "pink",
    "teal",
    "cyan",
    "lime",
    "amber",
    "indigo",
    "violet",
    "magenta",
  ];

  const animals = [
    "panda",
    "tiger",
    "lion",
    "eagle",
    "dolphin",
    "wolf",
    "fox",
    "bear",
    "koala",
    "owl",
    "hawk",
    "whale",
    "shark",
    "zebra",
    "giraffe",
    "elephant",
    "penguin",
    "rabbit",
    "deer",
    "turtle",
  ];

  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
  const randomNum = Math.floor(1000 + Math.random() * 9000); // Generates number between 1000-9999

  return `${randomColor}-${randomAnimal}-${randomNum}`;
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
  console.log("Post details:", post);

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
  const seoDescription = post.description || createSeoDescription(post.content);

  // Generate a more meaningful title based on post content
  let title = post.title || extractPostTitle(post.content, post.author);

  // Ensure the first character is uppercase
  if (title && title.length > 0) {
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }

  // Add author attribution to the title
  if (!title.includes(post.author)) {
    // Avoid redundancy if the author name is already in the title
    title = `${title}`;
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
    baseUrl,
    publishDate: post.timestamp,
  });
}

export async function getPostsHandler(req: HttpRequest) {
  const corsHeaders = getCorsHeaders(req);
  try {
    // Get query parameters for pagination and filtering
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const cursor = url.searchParams.get("cursor");
    const tag = url.searchParams.get("tag");

    // Get posts from service
    const posts = await getPostsFromDb({
      limit,
      cursor,
      tag,
    });

    return new Response(JSON.stringify(posts), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch posts" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
}

export const editPostHandler = async (req: HttpRequest) => {
  const corsHeaders = getCorsHeaders(req);
  const id = req.params?.id;
  if (!id) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Post ID is required",
      }),
      {
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 400,
      },
    );
  }

  try {
    const body = await req.json();

    const post = await editPostById(id, body);

    return new Response(JSON.stringify(post), {
      status: 201,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Error updating post:", error);
    return new Response(JSON.stringify({ error: "Failed to update post" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

function generateAvatarUrl(): string {
  // Generate a random 3-digit number between 100-999
  const randomDigits = Math.floor(100 + Math.random() * 900);
  return `https://avatars.githubusercontent.com/u/1868${randomDigits}?v=4`;
}

export async function postHandler(req: HttpRequest, ctx: Context) {
  const corsHeaders = getCorsHeaders(req);
  try {
    const body = await req.json();
    const content = body.content;

    if (!content || typeof content !== "string" || content.trim() === "") {
      return new Response(JSON.stringify({ error: "Content is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const ses = await getSession(req, ctx);
    const username = ses?.username || generateAnonymousUsername();
    const avatar = ses?.avatar_url || generateAvatarUrl();

    const title = extractPostTitle(content, username);
    const description = createSeoDescription(content);
    const tags: string[] = extractTags(content) || [];

    const post = await createPost({
      content,
      author: username,
      avatar: avatar,
      image: body.image,
      title,
      description,
      tags,
      expired: ses?.username ? false : true,
    });

    return new Response(JSON.stringify(post), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error processing post request:", error);
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
}

export async function deletePostHandler(req: HttpRequest, ctx: Context) {
  const corsHeaders = getCorsHeaders(req);
  try {
    // Extract post ID from the URL path instead of query parameters
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/");
    const id = pathParts[pathParts.length - 1]; // Get the last part of the path

    if (!id) {
      return new Response(JSON.stringify({ error: "Post ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get the user from session for authorization
    const ses = await getSession(req, ctx);
    if (!ses?.isLogin) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Delete the post
    const success = await deletePostById(id);

    if (!success) {
      return new Response(JSON.stringify({ error: "Post not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Error processing delete request:", error);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
}

export async function getPostDetailHandler(req: HttpRequest) {
  const corsHeaders = getCorsHeaders(req);
  try {
    const id = req.params?.id;

    if (!id) {
      return new Response(JSON.stringify({ error: "Post ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const post = await getPostById(id);

    if (!post) {
      return new Response(JSON.stringify({ error: "Post not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify(post), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Error fetching post details:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch post" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
}
