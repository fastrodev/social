import { useState } from "preact/hooks";

type Tab = {
  key: string;
  label: string;
};

type Post = {
  id: number;
  title: string;
};

type TabbedContentProps = {
  tabs: readonly Tab[];
  data: Record<string, Post[]>;
  initialTabKey: string;
};

export function TabbedContent(
  { tabs, data, initialTabKey }: TabbedContentProps,
) {
  const [activeTab, setActiveTab] = useState<string>(initialTabKey);

  return (
    <div className="w-full p-4 bg-gray-800/90 rounded-lg shadow-lg 
      border border-purple-500/20 backdrop-blur-sm
      transition-all duration-300 relative
      hover:shadow-purple-500/10 hover:border-purple-500/30 hover:shadow-2xl
      before:absolute before:inset-0 before:rounded-lg before:-z-10">
      <div className="border-b border-gray-800">
        <nav
          className="-mb-px flex space-x-4 overflow-x-auto scrollbar-hide"
          aria-label="Tabs"
        >
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`whitespace-nowrap flex-shrink-0 px-4 pb-3 text-sm font-medium cursor-pointer hover:cursor-pointer ${
                activeTab === tab.key
                  ? "border-b-2 border-purple-500 text-purple-400"
                  : "border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-700"
              }`}
              aria-current={activeTab === tab.key ? "page" : undefined}
            >
              <div className="flex flex-col items-center">
                <span className="text-xs">{tab.label.split(" ")[0]}</span>
                <span className="text-xs">
                  {tab.label.split(" ").slice(1).join(" ")}
                </span>
              </div>
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-4 space-y-4">
        {data[activeTab]?.map((post) => (
          <div
            key={post.id}
            className="flex items-center gap-3 p-2.5 border border-gray-800 rounded-md bg-gray-950/90 hover:bg-gray-900/90 hover:shadow-md transition-all duration-200 cursor-pointer"
          >
            <div className="w-12 h-12 flex-shrink-0 overflow-hidden rounded">
              <img
                src={`https://picsum.photos/seed/${post.id}/100/100`}
                alt="Post thumbnail"
                className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                loading="lazy"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-100">
                {post.title}
              </h3>
              <p className="mt-0.5 text-xs text-gray-400">
                This is a dummy description.
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
