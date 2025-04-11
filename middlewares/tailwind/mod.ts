// deno-lint-ignore-file no-explicit-any

import tailwindCss, { Config } from "tailwindcss";
import postcss from "postcss";
import cssnano from "cssnano";
import autoprefixer from "autoprefixer";
import { TailwindPluginOptions } from "./types.ts";
import { Context, HttpRequest } from "fastro/core/server/types.ts";

function render(content: string) {
  return new Response(content, {
    status: 200,
    headers: {
      "Content-Type": "text/css",
      "Cache-Control": "no-cache, no-store, max-age=0, must-revalidate",
    },
  });
}

async function getPath() {
  let twc;
  try {
    twc = await import(Deno.cwd() + "/tailwind.config.ts");
  } catch (_err) {
    twc = await import("../../tailwind.config.ts");
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
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export default function tailwind(pathname = "/styles.css", staticDir = "/") {
  const cache = new Map<string, string>();

  async function m(_req: HttpRequest, ctx: Context) {
    if (ctx.url.pathname !== pathname) {
      return ctx.next();
    }

    const cached = cache.get(pathname);
    if (cached) return render(cached);

    const result = await processCss(staticDir);
    if (result) {
      cache.set(pathname, result.content);
      return render(result.content);
    }
  }

  return m;
}
