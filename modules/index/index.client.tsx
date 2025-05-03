// deno-lint-ignore-file no-explicit-any
import { hydrate } from "preact";
import App from "./index.page.tsx";

const dataEl = document.getElementById("__DATA__");
if (!dataEl || !dataEl.textContent) {
  console.error("No data found for hydration");
}

const data = dataEl?.textContent ? JSON.parse(dataEl.textContent) : {};

const rootEl = document.getElementById("root");
if (!rootEl) {
  console.error("No #root element found for hydration");
}

hydrate(<App data={data} />, rootEl as any);
