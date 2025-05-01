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

  const base_url = Deno.env.get("BASE_URL") || "https://web.fastro.dev";
  console.log("BASE_URL", base_url);
  return await ctx.render({
    title: "Fastro Social",
    description: "A social network built with Fastro",
    image: "https://social.fastro.dev/img/social.jpeg",
    isLogin,
    base_url,
  });
}
