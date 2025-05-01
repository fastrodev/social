import { getSession } from "@app/utils/session.ts";

import { Context, HttpRequest } from "fastro/mod.ts";
import {
  createComment,
  deleteCommentById,
  getCommentsByPostId,
} from "./comment.service.ts";
import { getCorsHeaders } from "../../utils/headers.ts";

export async function commentHandler(req: HttpRequest, ctx: Context) {
  const corsHeaders = getCorsHeaders(req);
  try {
    const body = await req.json();
    const { content, postId } = body;

    if (!content || typeof content !== "string" || content.trim() === "") {
      return new Response(JSON.stringify({ error: "Content is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!postId) {
      return new Response(JSON.stringify({ error: "Post ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get the user from session
    const ses = await getSession(req, ctx);
    if (!ses?.isLogin) {
      return new Response(
        JSON.stringify({ error: "Login required to comment" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const username = ses.username || "";

    // Create the comment
    const comment = await createComment({
      content,
      postId,
      author: username,
      avatar: ses?.avatar_url,
    });

    return new Response(JSON.stringify(comment), {
      status: 201,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Error processing comment request:", error);
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
}

// Get comments for a post
export async function getCommentsHandler(req: HttpRequest, _ctx: Context) {
  const corsHeaders = getCorsHeaders(req);
  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/");
    const postId = pathParts[pathParts.length - 1];

    if (!postId) {
      return new Response(JSON.stringify({ error: "Post ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const comments = await getCommentsByPostId(postId);

    return new Response(JSON.stringify(comments), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
}

// Handle comment deletion
export async function deleteCommentHandler(req: HttpRequest, ctx: Context) {
  const corsHeaders = getCorsHeaders(req);
  try {
    // Extract comment ID from the URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/");
    const commentId = pathParts[pathParts.length - 1]; // Get the last part of the path

    if (!commentId) {
      return new Response(JSON.stringify({ error: "Comment ID is required" }), {
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

    // Delete the comment (assuming deleteCommentById function exists in service)
    const success = await deleteCommentById(commentId, ses.username);

    if (!success) {
      return new Response(
        JSON.stringify({
          error: "Comment not found or you're not authorized to delete it",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Error processing delete comment request:", error);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
}
