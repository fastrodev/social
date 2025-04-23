import { Context, HttpRequest } from "fastro/core/server/types.ts";
import { getSession } from "@app/utils/session.ts";

export async function indexHandler(req: HttpRequest, ctx: Context) {
  const ses = await getSession(req, ctx);
  const isLogin = ses?.isLogin;

  if (isLogin) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/home",
      },
    });
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: "https://social.fastro.dev",
    },
  });
}
