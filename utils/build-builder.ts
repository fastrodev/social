// deno-lint-ignore-file no-explicit-any
import * as esbuild from "npm:esbuild@0.25.3";
import { denoPlugins } from "jsr:@luca/esbuild-deno-loader@^0.11.0";
import postcss from "postcss";
import tailwindCss, { Config } from "tailwindcss";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import { TailwindPluginOptions } from "@app/middlewares/tailwind/types.ts";

export interface BuildResult {
  errors: esbuild.Message[];
  warnings: esbuild.Message[];
  outputFiles?: esbuild.OutputFile[];
}

export interface PluginBuild {
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

interface BuildOptions {
  entryPoint: string;
  outfile: string;
  plugin: any;
}

export async function buildClient(builds: BuildOptions[]) {
  const cwd = Deno.cwd();
  const configPath = `${cwd}/deno.json`;

  for (const { plugin, entryPoint, outfile } of builds) {
    await esbuild.build({
      entryPoints: [entryPoint],
      bundle: true,
      outfile: outfile,
      format: "esm",
      loader: { ".tsx": "tsx" },
      jsxFactory: "h",
      jsxFragment: "Fragment",
      plugins: [
        plugin,
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
  }
}

try {
  const cwd = Deno.cwd();

  const robotsTxt = `User-agent: *
Allow: /
Disallow: /auth/
Disallow: /api/
    
Sitemap: https://social.fastro.dev/sitemap.xml`;

  await Deno.writeTextFile("public/robots.txt", robotsTxt);
  console.log("robots.txt created successfully");

  await processCss(cwd + "/public");
} catch (error) {
  console.error("Build failed:", error);
  Deno.exit(1);
} finally {
  esbuild.stop();
}
