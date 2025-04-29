import { getSession } from "@app/utils/session.ts";

import { Context, HttpRequest } from "fastro/mod.ts";
import { getPosts } from "../post/post.service.ts";

export default async function homeHandler(req: HttpRequest, ctx: Context) {
  const ses = await getSession(req, ctx);
  const isLogin = ses?.isLogin;
  if (!isLogin) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
      },
    });
  }

  const avatar_url = ses?.avatar_url;
  const html_url = ses?.html_url;
  const author = ses?.username;
  const posts = await getPosts();
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
    posts,
    brand: Deno.env.get("BRAND") || "Fastro Social",
    url: baseUrl,
    message: `Hi ${author}`,
  });
}
