import pageLayout from "@app/modules/home/home.layout.tsx";
import pageComponent from "@app/modules/home/home.page.tsx";
import pageHandler from "@app/modules/home/home.handler.ts";
import { Fastro } from "fastro/mod.ts";

export default function (s: Fastro) {
  s.page("/home", {
    folder: "modules/home",
    component: pageComponent,
    layout: pageLayout,
    handler: pageHandler,
  });

  return s;
}
