import { CommentIcon } from "@app/components/icons/comment.tsx";
import { ViewIcon } from "@app/components/icons/view.tsx";

interface PostFooterProps {
  postId: string;
  commentCount?: number;
  views?: number; // Make views optional
  viewCount?: number; // Keep viewCount optional
  postViews: Record<string, number>;
  api_base_url: string;
  themeStyles: {
    footer: string;
    link: string;
    metadata: string;
  };
}

export const PostFooter = ({
  postId,
  commentCount = 0, // Provide default value
  views = 0, // Provide default value
  viewCount = 0, // Provide default value
  postViews,
  api_base_url,
  themeStyles,
}: PostFooterProps) => {
  const totalViews = views + viewCount + (postViews[postId] || 0);

  return (
    <div className="flex items-center justify-between">
      <a
        href={`${api_base_url}/post/${postId}`}
        className={`flex items-center gap-x-1 ${themeStyles.footer} text-xs hover:${
          themeStyles.link.split(" ")[0]
        }`}
      >
        <CommentIcon />{" "}
        <span>
          {commentCount
            ? `${commentCount} ${commentCount === 1 ? "comment" : "comments"}`
            : "Add comment"}
        </span>
      </a>
      <div
        className={`flex items-center gap-x-2 ${themeStyles.metadata} text-xs`}
      >
        <span className="flex items-center gap-x-2">
          <ViewIcon /> {totalViews === 0
            ? "Be the first viewer"
            : `${totalViews} ${totalViews === 1 ? "view" : "views"}`}
        </span>
      </div>
    </div>
  );
};
