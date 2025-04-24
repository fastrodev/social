import { ulid } from "jsr:@std/ulid/ulid";
import { kv } from "@app/utils/db.ts";

// Comment interface
interface CommentInput {
  content: string;
  postId: string;
  author: string;
  avatar?: string;
}

interface Comment {
  id: string;
  content: string;
  postId: string;
  timestamp: string;
  author: string;
  avatar?: string;
}

// Create a new comment
export async function createComment(input: CommentInput): Promise<Comment> {
  const id = ulid();
  const comment: Comment = {
    id,
    content: input.content,
    postId: input.postId,
    timestamp: new Date().toISOString(),
    author: input.author,
    avatar: input.avatar,
  };

  const primaryKey = ["comments", id];
  console.log("Creating comment with ID:", id);

  const atomic = kv.atomic()
    .check({ key: primaryKey, versionstamp: null })
    .set(primaryKey, comment);

  const res = await atomic.commit();
  console.log("Comment creation result:", res);
  if (!res.ok) throw new Error("Failed to create comment");

  return comment;
}

// Get comments for a specific post
export async function getCommentsByPostId(postId: string): Promise<Comment[]> {
  console.log("Fetching comments for post:", postId);
  const results: Comment[] = [];

  const iterator = kv.list<Comment>({ prefix: ["comments"] });

  for await (const entry of iterator) {
    if (entry.value.postId === postId) {
      results.push(entry.value);
    }
  }

  // Sort comments by timestamp (oldest first, newest last)
  const comments = results.sort((a, b) =>
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  console.log(`Retrieved ${comments.length} comments for post ${postId}`);
  return comments;
}

// Delete a comment by ID and verify ownership
export async function deleteCommentById(
  id: string,
  username: string,
): Promise<boolean> {
  const primaryKey = ["comments", id];
  console.log("Attempting to delete comment with ID:", id);

  try {
    // First check if the comment exists
    const existingComment = await kv.get<Comment>(primaryKey);
    if (!existingComment.value) {
      console.log("Comment not found with ID:", id);
      return false;
    }

    // Verify that the current user is the author of the comment
    if (existingComment.value.author !== username) {
      console.log(
        "Unauthorized delete attempt - user doesn't own this comment",
      );
      return false;
    }

    // Delete the comment
    await kv.delete(primaryKey);

    console.log(`Successfully deleted comment ${id}`);
    return true;
  } catch (error) {
    console.error("Error deleting comment:", error);
    return false;
  }
}
