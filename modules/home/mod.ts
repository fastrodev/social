import pageLayout from "@app/modules/home/home.layout.tsx";
import pageComponent from "@app/modules/home/home.page.tsx";
import pageHandler from "@app/modules/home/home.handler.ts";
import postDetailComponent from "@app/modules/home/post.page.tsx";
import postDetailHandler, {
  deletePostHandler,
  editPostHandler,
  getPostsHandler,
  postHandler,
} from "@app/modules/home/post.handler.ts";
import { Fastro } from "fastro/mod.ts";
import {
  commentHandler,
  deleteCommentHandler,
  getCommentsHandler,
} from "@app/modules/home/comment.handler.ts";

export default function (s: Fastro) {
  s.page("/home", {
    folder: "modules/home",
    component: pageComponent,
    layout: pageLayout,
    handler: pageHandler,
  });

  s.page("/post/:id", {
    folder: "modules/home",
    component: postDetailComponent,
    layout: pageLayout,
    handler: postDetailHandler,
  });
  s.post("/api/post", postHandler);
  s.put("/api/post/:id", editPostHandler);
  s.delete("/api/post/:id", deletePostHandler);
  s.get("/api/posts", getPostsHandler);
  s.post("/api/comment", commentHandler);
  s.get("/api/comments/:id", getCommentsHandler);
  s.delete("/api/comments/:id", deleteCommentHandler);

  return s;
}
