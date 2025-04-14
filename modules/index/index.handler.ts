import { Context, HttpRequest } from "fastro/core/server/types.ts";
import { indexService } from "@app/modules/index/index.service.ts";
import { getSession } from "@app/utils/session.ts";

export async function indexHandler(req: HttpRequest, ctx: Context) {
  const ses = await getSession(req, ctx);
  const isLogin = ses?.isLogin;
  // const avatar_url = ses?.avatar_url;
  // const html_url = ses?.html_url;

  // Redirect to home page if user is already logged in
  if (isLogin) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/home",
      },
    });
  }

  const indexData = indexService();
  return ctx.render(indexData);
}
