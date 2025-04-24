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

  if (Deno.env.get("ENV") !== "DEVELOPMENT") {
    return new Response(null, {
      status: 302,
      headers: {
        Location: "https://social.fastro.dev",
      },
    });
  }

  return await ctx.render({
    title: "Fastro Social",
    description: "A social network built with Fastro",
    image: "https://social.fastro.dev/social.jpeg",
    isLogin,
  });
}
