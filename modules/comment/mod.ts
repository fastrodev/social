import { Context, Fastro } from "fastro/mod.ts";
import {
  commentHandler,
  deleteCommentHandler,
  getCommentsHandler,
} from "../comment/comment.handler.ts";

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
  s.options("/api/comments", optionsHandler);
  s.post("/api/comment", commentHandler);
  s.get("/api/comments/:id", getCommentsHandler);
  s.delete("/api/comments/:id", deleteCommentHandler);

  return s;
}
