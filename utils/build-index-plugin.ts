import { indexLayout } from "../modules/index/index.layout.tsx";
import Index from "../modules/index/index.page.tsx";
import { createIndexPlugin } from "./build-plugin.ts";

export const indexPlugin = createIndexPlugin({
  name: "html",
  outputPath: "public/index.html",
  bundlePath: "/js/bundle.js",
  Layout: indexLayout,
  Page: Index,
  getPageData: () => ({
    title: "Join the Conversation",
    description: "Today's ideas become tomorrow's innovations",
    github_auth: "https://web.fastro.dev/auth/github/signin",
    base_url: Deno.env.get("ENV") === "DEV" ? "" : "https://web.fastro.dev",
    apiBaseUrl: Deno.env.get("API_BASE_URL") || "https://web.fastro.dev",
    share_base_url: Deno.env.get("SHARE_BASE_URL") ||
      "https://social.fastro.dev",
    avatar_url: "",
    isLogin: false,
    author: "",
    message: "",
  }),
  getMetaData: (pageData) => ({
    title: pageData.title,
    description: pageData.description,
    image: "https://social.fastro.dev/img/social.jpeg",
    ogType: "website",
    twitterCard: "summary_large_image",
  }),
});
