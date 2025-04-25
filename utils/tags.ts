export function extractTags(content: string): string[] | null {
  // Get the last line of content
  const lastLine = content.trim().split("\n").pop() || "";

  // Only process if the last line contains hashtags
  if (!lastLine.includes("#")) {
    return null;
  }

  const tagRegex = /#(\w+)/g;
  const tags: string[] = [];
  let match;

  while ((match = tagRegex.exec(lastLine)) !== null) {
    if (match[1]) {
      tags.push(match[1]);
    }
  }

  return tags.length > 0 ? tags : null;
}
