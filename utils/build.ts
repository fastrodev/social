import { h } from "preact";
import * as esbuild from "npm:esbuild@0.25.3";
import { renderToString } from "preact-render-to-string";
import { indexLayout } from "../modules/index/index.layout.tsx";
import Index from "../modules/index/index.page.tsx";

interface BuildResult {
  errors: esbuild.Message[];
  warnings: esbuild.Message[];
  outputFiles?: esbuild.OutputFile[];
}

interface PluginBuild {
  onEnd(callback: (result: BuildResult) => void | Promise<void>): void;
}

const htmlPlugin = {
  name: "html",
  setup(build: PluginBuild) {
    build.onEnd(async (result: BuildResult) => {
      if (result.errors.length > 0) return;

      try {
        const pageData = {
          user: "Example User",
          title: "Your Page Title",
          description: "Your page description here",
          youtube: "https://youtube.com/example",
          start: "2023-01-01",
        };

        const metaData = {
          title: pageData.title,
          description: pageData.description,
          image: "/path/to/image.jpg",
        };

        const fullHtml = renderToString(
          indexLayout({
            children: h(Index, { data: pageData }),
            data: metaData,
            nonce: "random-nonce-value",
          }),
        );

        await Deno.writeTextFile("public/index.html", fullHtml);
        console.log("HTML file written successfully");
      } catch (error) {
        console.error("Error during rendering:", error);
      }
    });
  },
};

try {
  await esbuild.build({
    entryPoints: ["modules/index/index.public.tsx"],
    bundle: true,
    outfile: "public/js/bundle.js",
    format: "esm",
    loader: { ".tsx": "tsx" },
    jsxFactory: "h",
    jsxFragment: "Fragment",
    plugins: [htmlPlugin],
    jsx: "automatic",
    jsxImportSource: "preact",
    metafile: true,
    treeShaking: true,
    minify: true,
    minifySyntax: true,
    minifyWhitespace: true,
  });
} catch (error) {
  console.error("Build failed:", error);
  Deno.exit(1);
} finally {
  esbuild.stop();
}
