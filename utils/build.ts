// deno-lint-ignore-file no-explicit-any
import { h } from "preact";
import * as esbuild from "npm:esbuild@0.25.3";
import { renderToString } from "preact-render-to-string";
import { indexLayout } from "../modules/index/index.layout.tsx";
import Index from "../modules/index/index.page.tsx";
import { denoPlugins } from "jsr:@luca/esbuild-deno-loader@^0.11.0";
import postcss from "postcss";
import tailwindCss, { Config } from "tailwindcss";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import { TailwindPluginOptions } from "@app/middlewares/tailwind/types.ts";

interface BuildResult {
  errors: esbuild.Message[];
  warnings: esbuild.Message[];
  outputFiles?: esbuild.OutputFile[];
}

interface PluginBuild {
  onEnd(callback: (result: BuildResult) => void | Promise<void>): void;
}

async function getPath() {
  let twc;
  try {
    twc = await import(Deno.cwd() + "/tailwind.config.ts");
  } catch (_err) {
    twc = await import("../tailwind.config.ts");
  }
  return twc;
}

const twc = await getPath();

function createProcessor(
  config: {
    staticDir: string;
    dev: boolean;
  },
  options: TailwindPluginOptions,
) {
  const tailwindConfig = twc.default as Config;
  const plugins = [
    tailwindCss(tailwindConfig) as any,
    autoprefixer(options.autoprefixer) as any,
  ];

  if (!config.dev) {
    plugins.push(cssnano());
  }

  return postcss(plugins);
}

async function processCss(staticDir: string) {
  try {
    const processor = createProcessor({
      staticDir,
      dev: false,
    }, {});

    const path = Deno.cwd() + "/static/tailwind.css";
    const content = Deno.readTextFileSync(path);
    const result = await processor.process(content, {
      from: undefined,
    });
    await Deno.writeTextFile("public/styles.css", result.css);
    console.log("Tailwind CSS built successfully");
  } catch (error) {
    console.error(error);
    throw error;
  }
}

const htmlPlugin = {
  name: "html",
  setup(build: PluginBuild) {
    build.onEnd(async (result: BuildResult) => {
      if (result.errors.length > 0) return;

      try {
        const pageData = {
          user: "Example User",
          title: "Join the Conversation",
          description: "Today's ideas become tomorrow's innovations",
          github_auth: "https://web.fastro.dev/auth/github/signin",
          base_url: Deno.env.get("ENV") === "DEV"
            ? ""
            : "https://web.fastro.dev",
          apiBaseUrl: Deno.env.get("API_BASE_URL") || "https://web.fastro.dev",
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

try {
  const cwd = Deno.cwd();
  const configPath = `${cwd}/deno.json`;

  // Create robots.txt
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /auth/
Disallow: /api/
    
Sitemap: https://social.fastro.dev/sitemap.xml`;

  await Deno.writeTextFile("public/robots.txt", robotsTxt);
  console.log("robots.txt created successfully");

  await processCss(cwd + "/public");

  await esbuild.build({
    entryPoints: ["./modules/index/index.client.tsx"], // ← make sure this points exactly at your client‑side hydrate file
    bundle: true,
    outfile: "public/js/bundle.js",
    format: "esm",
    loader: { ".tsx": "tsx" },
    jsxFactory: "h",
    jsxFragment: "Fragment",
    plugins: [
      htmlPlugin,
      ...denoPlugins({
        configPath,
      }),
    ],
    jsx: "automatic",
    jsxImportSource: "preact",
    metafile: true,
    treeShaking: true,
    minify: true,
  });
} catch (error) {
  console.error("Build failed:", error);
  Deno.exit(1);
} finally {
  esbuild.stop();
}
