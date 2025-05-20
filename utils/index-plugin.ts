import { BuildResult, PluginBuild } from "./build.ts";
import { renderToString } from "preact-render-to-string";
import { indexLayout } from "../modules/index/index.layout.tsx";
import Index from "../modules/index/index.page.tsx";
import { h } from "preact";

export const indexPlugin = {
  name: "html",
  setup(build: PluginBuild) {
    build.onEnd(async (result: BuildResult) => {
      if (result.errors.length > 0) return;

      try {
        const pageData = {
          user: {
            id: "",
            avatar: "",
            name: "",
          },
          title: "Join the Conversation",
          description: "Today's ideas become tomorrow's innovations",
          github_auth: "https://web.fastro.dev/auth/github/signin",
          base_url: Deno.env.get("ENV") === "DEV"
            ? ""
            : "https://web.fastro.dev",
          apiBaseUrl: Deno.env.get("API_BASE_URL") || "https://web.fastro.dev",
          share_base_url: Deno.env.get("SHARE_BASE_URL") ||
            "https://social.fastro.dev",
          avatar_url: "",
          isLogin: false,
          author: "",
          message: "",
        };

        const metaData = {
          title: pageData.title,
          description: pageData.description,
          image: "https://social.fastro.dev/img/social.jpeg",
        };

        let fullHtml = `<!DOCTYPE html>${
          renderToString(
            indexLayout({
              children: h(Index, { data: pageData }),
              data: metaData,
              nonce: "random-nonce-value",
            }),
          )
        }`;

        // Serialize the data for client-side hydration
        const serializedData = JSON.stringify(pageData).replace(
          /</g,
          "\\u003c",
        );
        const scripts =
          `<script id="__DATA__" type="application/json">${serializedData}</script>` +
          `<script type="module" src="/js/bundle.js?v=${
            new Date().getTime()
          }"></script>`;

        fullHtml = fullHtml.replace("</body>", `${scripts}</body>`);

        await Deno.writeTextFile("public/index.html", fullHtml);
        console.log("HTML file written successfully");
      } catch (error) {
        console.error("Error during rendering:", error);
      }
    });
  },
};
