import { buildClient } from "./build-builder.ts";
import { indexPlugin } from "./build-index-plugin.ts";

await buildClient([
  {
    entryPoint: "./modules/index/index.client.tsx",
    outfile: "public/js/bundle.js",
    plugin: indexPlugin,
  },
]);
