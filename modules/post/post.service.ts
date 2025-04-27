import { kv } from "@app/utils/db.ts";
import { ulid } from "jsr:@std/ulid/ulid";
import {
  createSeoDescription,
  extractPostTitle,
} from "../../utils/markdown.ts";
import { extractTags } from "@app/utils/tags.ts";

interface PostInput {
  title: string;
  description: string;
  content: string;
  author: string;
  avatar?: string;
  image?: string;
  tags?: string[];
  expired?: boolean;
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
  title?: string;
  description?: string;
  tags?: string[] | null;
}

interface PostUpdateInput {
  content?: string;
  author?: string;
  avatar?: string;
  image?: string;
  title?: string;
  description?: string;
  tags?: string[];
}

interface Comment {
  id: string;
  content: string;
  postId: string;
  timestamp: string;
  author: string;
  avatar?: string;
}

interface GetPostsOptions {
  limit: number;
  cursor?: string | null;
  tag?: string | null;
}

export async function getPostsFromDb(
  { limit, cursor, tag }: GetPostsOptions,
): Promise<Post[]> {
  console.log("Fetching posts with options:", { limit, cursor, tag });

  // Get all posts
  const postsResults: Post[] = [];
  const iterator = kv.list<Post>({ prefix: ["posts"] });

  for await (const entry of iterator) {
    // Filter by tag if specified
    if (tag && (!entry.value.tags || !entry.value.tags.includes(tag))) {
      continue;
    }
    postsResults.push(entry.value);
  }

  // Get comment counts
  const commentCounts = new Map<string, number>();
  const commentsIterator = kv.list<Comment>({ prefix: ["comments"] });

  for await (const entry of commentsIterator) {
    const postId = entry.value.postId;
    commentCounts.set(postId, (commentCounts.get(postId) || 0) + 1);
  }

  // Add metadata and sort posts
  const postsWithMetadata = postsResults.map((post) => ({
    ...post,
    commentCount: commentCounts.get(post.id) || 0,
    views: post.views || 0,
  }));

  // Sort posts by timestamp (newest first)
  const sortedPosts = postsWithMetadata.sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Handle cursor-based pagination
  let startIndex = 0;
  if (cursor) {
    startIndex = sortedPosts.findIndex((post) => post.id === cursor) + 1;
  }

  // Return paginated results
  const paginatedPosts = sortedPosts.slice(startIndex, startIndex + limit);

  console.log(`Retrieved ${paginatedPosts.length} posts`);
  return paginatedPosts;
}

export async function editPostById(
  id: string,
  updates: PostUpdateInput,
): Promise<Post | null> {
  const primaryKey = ["posts", id];
  console.log("Editing post with ID:", id);
  console.log("Updates:", updates);

  // First check if the post exists
  const existingPost = await kv.get<Post>(primaryKey);
  if (!existingPost.value) {
    console.log("Post not found with ID:", id);
    return null;
  }

  try {
    const newTitle = extractPostTitle(
      updates.content || existingPost.value.content,
      existingPost.value.author,
    );
    const newDescription = createSeoDescription(
      updates.content || existingPost.value.content,
    );

    const newTags = extractTags(
      updates.content || existingPost.value.content,
    );

    const updatedPost: Post = {
      ...existingPost.value,
      ...updates,
      title: newTitle,
      description: newDescription,
      tags: newTags,
      // Preserve original id and timestamp
      id: existingPost.value.id,
      timestamp: existingPost.value.timestamp,
    };

    // Update the post in the database
    const result = await kv.set(primaryKey, updatedPost);

    if (!result.ok) {
      console.error("Failed to update post:", id);
      return null;
    }

    console.log("Successfully updated post:", id);
    return updatedPost;
  } catch (error) {
    console.error("Error updating post:", error);
    return null;
  }
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
    title: input.title,
    description: input.description,
    tags: input.tags,
  };

  const primaryKey = ["posts", id];
  const opt = input.expired ? { expireIn: 60 * 60 * 24 * 7 } : undefined;
  const atomic = kv.atomic()
    .check({ key: primaryKey, versionstamp: null })
    .set(primaryKey, post, opt);

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
