export interface Post {
  id: string;
  content: string;
  timestamp: string;
  author: string;
  avatar: string;
  commentCount?: number;
  viewCount?: number;
  views?: number;
  isMarkdown?: boolean;
  image?: string;
  defaultImage?: string; // Add this field
  title?: string;
  tags?: string[];
}
