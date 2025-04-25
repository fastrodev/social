// deno-lint-ignore-file no-explicit-any
import { hydrate } from "preact";
import App from "./index.page.tsx";

console.log("🔄 Client hydration starting");

// Get the data that was serialized during SSR
const dataEl = document.getElementById("__DATA__");
if (!dataEl || !dataEl.textContent) {
  console.error("No data found for hydration");
}

const data = dataEl?.textContent ? JSON.parse(dataEl.textContent) : {};

console.log("Hydrating with data:", data);

// Find the root element where the SSR content was rendered
const rootEl = document.getElementById("root");
if (!rootEl) {
  console.error("No #root element found for hydration");
}

// Hydrate the app
hydrate(<App data={data} />, rootEl as any);
console.log("✅ Hydration complete");
