// deno-lint-ignore-file no-explicit-any
import { hydrate } from "preact";
import App from "./index.page.tsx";

const dataEl = document.getElementById("__DATA__");
const data = dataEl ? JSON.parse(dataEl.textContent || "{}") : {};

hydrate(
  App({ data }),
  document.getElementById("root") as any,
);
