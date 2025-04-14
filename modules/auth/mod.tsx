import { kv } from "@app/utils/db.ts";
import {
  createGitHubOAuthConfig,
  createHelpers,
} from "jsr:@deno/kv-oauth@0.11.0";
import { ulid } from "jsr:@std/ulid/ulid";
import { DAY } from "jsr:@std/datetime@^0.221.0/constants";
import { Context, Fastro, HttpRequest } from "fastro/mod.ts";
import { STATUS_CODE } from "fastro/core/server/deps.ts";

const redirectUri = Deno.env.get("REDIRECT_URI") ??
  "http://localhost:8000/auth/callback";

const GITHUB_CLIENT_ID = Deno.env.get("GITHUB_CLIENT_ID");
const GITHUB_CLIENT_SECRET = Deno.env.get("GITHUB_CLIENT_SECRET");

if (!GITHUB_CLIENT_ID) {
  throw new Error("GITHUB_CLIENT_ID environment variable must be set");
}

if (!GITHUB_CLIENT_SECRET) {
  throw new Error("GITHUB_CLIENT_SECRET environment variable must be set");
}

const oauthConfig = createGitHubOAuthConfig(
  { redirectUri, scope: ["user"] },
);
const {
  signIn,
  handleCallback,
  getSessionId,
  signOut,
} = createHelpers(oauthConfig);

export { getSessionId, handleCallback, signIn, signOut };

export async function indexHandler(req: HttpRequest, ctx: Context) {
  const sessionId = await getSessionId(req);
  const hasSessionIdCookie = sessionId !== undefined;

  const jsx = (
    <html>
      <head>
        <title>Deno Kv OAuth Demo</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />
      </head>
      <body>
        <div>
          <p>
            Authorization endpoint URI: {oauthConfig.authorizationEndpointUri}
          </p>
          <p>Token URI: {oauthConfig.tokenUri}</p>
          <p>Scope: {oauthConfig.defaults?.scope}</p>
          <p>Signed in: {JSON.stringify(hasSessionIdCookie)}</p>
          <p>
            {hasSessionIdCookie
              ? <a href="/auth/github/signout">Sign out</a>
              : <a href="/auth/github/signin">Sign in</a>}
          </p>
        </div>
      </body>
    </html>
  );

  return ctx.render(jsx);
}

export const signinHandler = async (req: Request) => {
  return await signIn(req);
};

async function getGithubUser(accessToken: string) {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `token ${accessToken}`,
    },
  });
  const data = await response.json();
  return data;
}

const findUserByLogin = (ctx: Context, login: string) => {
  const userStore = ctx.stores.get("users");
  if (!userStore) return null;
  for (const [id, { value }] of userStore.entries()) {
    if (value.username === login) {
      return { ...value, ...{ id } };
    }
  }
  return null;
};

export const callbackHandler = async (req: HttpRequest, ctx: Context) => {
  try {
    const { response, sessionId, tokens } = await handleCallback(
      req,
    );
    const user = await getGithubUser(tokens.accessToken);
    const registeredUser = await findUserByLogin(ctx, user.login);
    if (!registeredUser) {
      const id = ulid();
      await ctx.stores.get("users")?.set(id, {
        username: user.login,
        avatar_url: user.avatar_url,
      }).commit();
    }

    kv.set(["session", sessionId], {
      id: user.id,
      avatar_url: user.avatar_url,
      login: user.login,
    }, { expireIn: DAY });
    return response;
  } catch (err: unknown) {
    console.error("Auth callback error:", err);
    console.error("Request URL:", req.url);

    // Safe error details extraction
    const errorDetails = {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      name: err instanceof Error ? err.name : undefined,
    };

    console.error("Error details:", errorDetails);

    // You could also log to a monitoring service here

    return new Response(
      JSON.stringify({
        error: "Authentication failed",
        message: errorDetails.message,
      }),
      {
        status: STATUS_CODE.InternalServerError,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};

export const signoutHandler = async (req: HttpRequest, ctx: Context) => {
  const sessionId = await getSessionId(req);
  if (sessionId) {
    const store = ctx.stores.get("core");
    if (store) {
      store.delete(sessionId);
      await store.commit();
    }
    return await signOut(req);
  }
};

/**
 * To use this module,
 * see the example: https://github.com/fastrodev/fastro/blob/main/examples/oauth.ts
 * @param f: Fastro
 * @returns Fastro
 */
export default function authModule(f: Fastro) {
  return f.get("/auth", indexHandler)
    .get("/auth/github/signin", signinHandler)
    .get("/auth/signout", signoutHandler)
    .get("/auth/callback", callbackHandler);
}
