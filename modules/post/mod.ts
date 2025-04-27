import pageLayout from "@app/modules/home/home.layout.tsx";
import postDetailComponent from "./post.page.tsx";
import postDetailHandler, {
  deletePostHandler,
  editPostHandler,
  getPostsHandler,
  postHandler,
} from "./post.handler.ts";
import { Context, Fastro } from "fastro/mod.ts";

const optionsHandler = function (_req: Request, _ctx: Context) {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
};

export default function (s: Fastro) {
  s.page("/post/:id", {
    folder: "modules/post",
    component: postDetailComponent,
    layout: pageLayout,
    handler: postDetailHandler,
  });
  s.post("/api/post", postHandler);
  s.options("/api/post", optionsHandler);
  s.put("/api/post/:id", editPostHandler);
  s.delete("/api/post/:id", deletePostHandler);
  s.get("/api/posts", getPostsHandler);
  return s;
}
