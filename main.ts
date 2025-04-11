import Server from "fastro/mod.ts";
import { indexModule } from "@app/modules/index/index.mod.ts";
import { userModule } from "@app/modules/user/user.mod.ts";
import { markdownModule } from "@app/modules/markdown/markdown.mod.ts";
import tailwind from "@app/middlewares/tailwind/mod.ts";

const s = new Server();
s.use(tailwind());
s.group(indexModule);
s.group(userModule);
s.group(markdownModule);
s.serve({
  port: 8080,
});
