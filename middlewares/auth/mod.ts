import { Context, HttpRequest } from "fastro/core/server/types.ts";

export default function authMiddleware() {
  return async (req: HttpRequest, ctx: Context) => {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return ctx.send(
        {
          status: 401,
          message: "Unauthorized: Missing or invalid Authorization header",
        },
        401,
      );
    }

    const token = authHeader.split(" ")[1];

    try {
      const isValid = await verifyToken(token);
      if (!isValid) {
        return ctx.send(
          {
            status: 401,
            message: "Unauthorized: Invalid token",
          },
          401,
        );
      }

      ctx.state.user = { id: "user-id", role: "user-role" };
      return ctx.next();
    } catch (error) {
      console.error("Authentication error:", error);
      return ctx.send(
        {
          status: 500,
          message: "Internal Server Error: Authentication failed",
        },
        500,
      );
    }
  };
}

// deno-lint-ignore require-await
async function verifyToken(token: string): Promise<boolean> {
  // Replace this with your actual token verification logic
  return token === "valid-token"; // Example: Replace with real validation
}
