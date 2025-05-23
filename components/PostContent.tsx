import { Post } from "@app/modules/index/type.ts";

interface Props {
  post: Post;
  isDark: boolean;
  index: number;
  onPostClick: (postId: string, post: Post) => void;
}

export function PostContent({ post, isDark, index, onPostClick }: Props) {
  return (
    <div
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onPostClick(post.id, post);
      }}
      className="block relative cursor-pointer"
    >
      <div className="w-full mb-4">
        {/* static height for mobile and desktop (smaller) */}
        <img
          src={post.image || post.defaultImage}
          alt="Post attachment"
          className="w-full h-36 sm:h-48 md:h-60 rounded-t-md object-cover"
          loading={index === 0 ? "eager" : "lazy"}
        />
        <div className="bg-black/60 backdrop-blur-sm px-4 py-3 flex flex-col justify-end rounded-b-lg">
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    isDark
                      ? "bg-purple-800/80 text-purple-200 backdrop-blur-sm"
                      : "bg-purple-100/90 text-purple-700 backdrop-blur-sm"
                  }`}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
          <h2 className="text-base font-semibold sm:font-extrabold sm:text-xl text-white line-clamp-5">
            {post.title || post.content}
          </h2>
        </div>
      </div>
    </div>
  );
}
