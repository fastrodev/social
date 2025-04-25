import Server from "fastro/mod.ts";
import userModule from "@app/modules/user/user.mod.ts";
import indexModule from "@app/modules/index/index.mod.ts";
import tailwind from "@app/middlewares/tailwind/mod.ts";
import authModule from "@app/modules/auth/mod.tsx";
import homeModule from "@app/modules/home/mod.ts";
import apisModule from "@app/modules/apis/apis.mod.ts";
import authMiddleware from "@app/middlewares/auth/mod.ts";
import "@std/dotenv/load";

const s = new Server();
s.use((req, ctx) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods":
      "GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Custom-Header",
    "Access-Control-Max-Age": "86400",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204, // No Content
      headers: corsHeaders,
    });
  }
  return ctx.next();
});
s.use(authMiddleware());
s.use(tailwind());
s.group(authModule);
s.group(indexModule);
s.group(userModule);
s.group(homeModule);
s.group(apisModule);
s.serve({
  port: Number(Deno.env.get("PORT")) || 8000,
});
