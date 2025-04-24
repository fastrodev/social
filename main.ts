import Server from "fastro/mod.ts";
import { indexModule } from "@app/modules/index/index.mod.ts";
import { userModule } from "@app/modules/user/user.mod.ts";
import tailwind from "@app/middlewares/tailwind/mod.ts";
import authModule from "@app/modules/auth/mod.tsx";
import homeModule from "@app/modules/home/mod.ts";

import "jsr:@std/dotenv/load";
import { apisModule } from "@app/modules/apis/apis.mod.ts";
import authMiddleware from "@app/middlewares/auth/mod.ts";

const s = new Server();
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
