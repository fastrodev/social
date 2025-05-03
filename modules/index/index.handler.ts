import { Context, HttpRequest } from "fastro/core/server/types.ts";
import { getSession } from "@app/utils/session.ts";

export async function indexHandler(req: HttpRequest, ctx: Context) {
  const ses = await getSession(req, ctx);
  const isLogin = ses?.isLogin;
  console.log("isLogin", isLogin);

  if (isLogin) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
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

  const avatar_url = ses?.avatar_url;
  const html_url = ses?.html_url;
  const author = ses?.username;
  console.log("author", author);

  const baseUrl = Deno.env.get("BASE_URL") || "https://social.fastro.dev";
  const imageUrl = "https://social.fastro.dev/img/social.jpeg";

  return await ctx.render({
    title: "Home",
    description: "Share your thoughts and connect with others",
    image: imageUrl,
    isLogin,
    avatar_url,
    html_url,
    author,
    brand: Deno.env.get("BRAND") || "Fastro Social",
    url: baseUrl,
    message: `Hi ${author}`,
    base_url: baseUrl,
    apiBaseUrl: Deno.env.get("API_BASE_URL") || "https://web.fastro.dev",
  });
}
