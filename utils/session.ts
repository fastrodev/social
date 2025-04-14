// deno-lint-ignore-file no-explicit-any
import { getSessionId } from "@app/modules/auth/mod.tsx";
import { kv } from "@app/utils/db.ts";
import { Context, HttpRequest } from "fastro/core/server/types.ts";

export async function getSession(req: HttpRequest, _ctx: Context) {
  const sessionId = await getSessionId(req);
  if (!sessionId) return undefined;
  const r = (await kv.get(["session", sessionId])).value as any;
  if (!r) return;
  const avatar_url = r.avatar_url;
  const html_url = r.html_url;
  const isLogin = true;
  const username = r.login;
  return { isLogin, avatar_url, html_url, username };
}
