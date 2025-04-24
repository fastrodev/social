import { Context, HttpRequest } from "fastro/core/server/types.ts";

const ALLOWED_ORIGINS = [
  "https://web.fastro.dev",
  "https://social.fastro.dev",
  "http://localhost:8000",
];

export default function authMiddleware() {
  return (req: HttpRequest, ctx: Context) => {
    const origin = req.headers.get("Origin");
    const secFetchSite = req.headers.get("Sec-Fetch-Site");
    const secFetchMode = req.headers.get("Sec-Fetch-Mode");
    const secFetchDest = req.headers.get("Sec-Fetch-Dest");

    // Log received headers for debugging
    console.log(`Auth Middleware - Received Origin: ${origin}`);
    console.log(`Auth Middleware - Sec-Fetch-Site: ${secFetchSite}`);
    console.log(`Auth Middleware - Sec-Fetch-Mode: ${secFetchMode}`);
    console.log(`Auth Middleware - Sec-Fetch-Dest: ${secFetchDest}`);

    // Allow direct browser navigation (no Origin header, and appropriate Sec-Fetch-* headers)
    if (
      !origin && secFetchMode === "navigate" &&
      (secFetchSite === "none" || secFetchSite === null)
    ) {
      console.log("Auth Middleware - Allowing direct browser navigation");
      return ctx.next();
    }

    // For API requests (typically with Origin header), strictly enforce allowed origins
    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
      console.error(
        `Auth Middleware - Blocking request due to invalid Origin: ${origin}`,
      );
      return ctx.send(
        {
          status: 403,
          message: "Forbidden: Invalid Origin header.",
        },
        403,
      );
    }

    // If we get here, either:
    // 1. Origin is in allowed list, or
    // 2. Origin is missing but it's not a navigation request (handled by earlier check)
    console.log("Auth Middleware - Allowing request.");
    return ctx.next();
  };
}
