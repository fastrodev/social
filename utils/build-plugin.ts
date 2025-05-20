// deno-lint-ignore-file no-explicit-any
import { h } from "preact";
import { renderToString } from "preact-render-to-string";
import { BuildResult, PluginBuild } from "./build-builder.ts";

export interface PageData {
  user?: {
    id: string;
    avatar: string;
    name: string;
  };
  title: string;
  description: string;
  [key: string]: any;
}

export interface MetaData {
  title: string;
  description: string;
  image: string;
  [key: string]: any;
}

export interface IndexPluginOptions {
  name: string;
  outputPath: string;
  bundlePath: string;
  Layout: any;
  Page: any;
  getPageData: () => Promise<PageData> | PageData;
  getMetaData: (pageData: PageData) => MetaData;
}

export const createIndexPlugin = (options: IndexPluginOptions) => ({
  name: options.name,
  setup(build: PluginBuild) {
    build.onEnd(async (result: BuildResult) => {
      if (result.errors.length > 0) return;

      try {
        const pageData = await Promise.resolve(options.getPageData());
        const metaData = options.getMetaData(pageData);

        let fullHtml = `<!DOCTYPE html>${
          renderToString(
            options.Layout({
              children: h(options.Page, { data: pageData }),
              data: metaData,
              nonce: "random-nonce-value",
            }),
          )
        }`;

        const serializedData = JSON.stringify(pageData).replace(
          /</g,
          "\\u003c",
        );
        const scripts =
          `<script id="__DATA__" type="application/json">${serializedData}</script>` +
          `<script type="module" src="${options.bundlePath}?v=${
            new Date().getTime()
          }"></script>`;

        fullHtml = fullHtml.replace("</body>", `${scripts}</body>`);
        await Deno.writeTextFile(options.outputPath, fullHtml);
        console.log("HTML file written successfully");
      } catch (error) {
        console.error("Error during rendering:", error);
      }
    });
  },
});
