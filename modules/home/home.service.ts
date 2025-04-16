import { ulid } from "jsr:@std/ulid/ulid";
import { kv } from "@app/utils/db.ts";

interface PostInput {
  content: string;
  author: string;
  avatar?: string;
  image?: string;
}

interface Post {
  id: string;
  content: string;
  timestamp: string;
  author: string;
  commentCount?: number;
  views?: number;
  avatar?: string;
  image?: string;
}

export async function createPost(input: PostInput): Promise<Post> {
  const id = ulid();
  const post: Post = {
    id,
    content: input.content,
    timestamp: new Date().toISOString(),
    author: input.author,
    avatar: input.avatar,
    image: input.image,
  };

  const primaryKey = ["posts", id];
  console.log("Creating post with ID:", id);

  const atomic = kv.atomic()
    .check({ key: primaryKey, versionstamp: null })
    .set(primaryKey, post);

  const res = await atomic.commit();
  console.log("Post creation result:", res);
  if (!res.ok) throw new Error("Failed to create post");

  return post;
}

export async function getPosts(limit = 20): Promise<Post[]> {
  console.log("Fetching posts");

  // Get all posts
  const postsResults: Post[] = [];
  const iterator = kv.list<Post>({ prefix: ["posts"] });

  for await (const entry of iterator) {
    postsResults.push(entry.value);
  }

  // Get comment counts for each post
  const commentCounts = new Map<string, number>();
  const commentsIterator = kv.list<Comment>({ prefix: ["comments"] });

  for await (const entry of commentsIterator) {
    const postId = entry.value.postId;
    commentCounts.set(postId, (commentCounts.get(postId) || 0) + 1);
  }

  // Add comment counts and ensure views property to posts
  const postsWithMetadata = postsResults.map((post) => ({
    ...post,
    commentCount: commentCounts.get(post.id) || 0,
    views: post.views || 0, // Ensure views property exists with default 0
  }));

  // Sort posts by timestamp (newest first)
  const posts = postsWithMetadata
    .sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(0, limit);

  console.log(`Retrieved ${posts.length} posts`);
  return posts;
}

export async function getPostById(id: string): Promise<Post | null> {
  console.log("Fetching post with ID:", id);

  try {
    // Use the correct key structure for your KV database
    const primaryKey = ["posts", id];

    const result = await kv.get<Post>(primaryKey);
    if (!result.value) {
      console.log("Post not found with ID:", id);
      return null;
    }

    // Create a new post object with the view count incremented
    const post = result.value;
    const updatedPost = {
      ...post,
      views: (post.views || 0) + 1,
    };

    // Update the post with the new view count
    const updateResult = await kv.set(primaryKey, updatedPost);
    if (!updateResult.ok) {
      console.warn("Failed to update view count for post:", id);
      // Still return the post even if view count update fails
      return post;
    }

    return updatedPost;
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
}

export async function deletePostById(id: string): Promise<boolean> {
  const primaryKey = ["posts", id];
  console.log("Deleting post with ID:", id);

  // First check if the post exists
  const existingPost = await kv.get<Post>(primaryKey);
  if (!existingPost.value) {
    console.log("Post not found with ID:", id);
    return false;
  }

  try {
    // First, get all comments for this post
    const commentsToDelete: string[] = [];
    const commentsIterator = kv.list<Comment>({ prefix: ["comments"] });

    for await (const entry of commentsIterator) {
      if (entry.value.postId === id) {
        commentsToDelete.push(entry.key[1] as string); // Get the comment ID
      }
    }

    console.log(
      `Found ${commentsToDelete.length} comments to delete for post ${id}`,
    );

    // Create atomic operation that deletes both the post and all its comments
    let atomic = kv.atomic();

    // Add post deletion to the atomic operation
    atomic = atomic.delete(primaryKey);

    // Add all comment deletions to the atomic operation
    for (const commentId of commentsToDelete) {
      atomic = atomic.delete(["comments", commentId]);
    }

    // Execute the atomic operation
    const result = await atomic.commit();

    if (!result.ok) {
      console.error("Failed to delete post and its comments atomically");
      return false;
    }

    console.log(
      `Successfully deleted post ${id} and ${commentsToDelete.length} associated comments`,
    );
    return true;
  } catch (error) {
    console.error("Error deleting post and its comments:", error);
    return false;
  }
}

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
