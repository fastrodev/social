import { Fastro } from "fastro/core/server/types.ts";
import {
  generateDeleteSignedUrl,
  generateSignedUrl,
} from "../../utils/signed-url.ts";

export default function apisModule(s: Fastro) {
  s.post("/api/signed-url", async (req, res) => {
    try {
      const body = await req.json();
      const { filename, contentType } = body;

      if (!filename || typeof filename !== "string") {
        return res.send({
          error: "Invalid request: filename is required",
        });
      }
      if (!contentType || typeof contentType !== "string") {
        return res.status(400).send({
          error: "Invalid request: contentType is required",
        });
      }

      const signedUrlResponse = await generateSignedUrl(filename, contentType);

      return res.send(
        {
          signedUrl: signedUrlResponse.signedUrl,
        },
        200,
        new Headers({
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        }),
      );
    } catch (error) {
      console.error("Error generating signed URL:", error);
      return res.send({
        error: "Failed to generate signed URL",
      }, 500);
    }
  });

  s.post("/api/delete-signed-url", async (req, res) => {
    try {
      const body = await req.json();
      const { filename } = body;

      if (!filename || typeof filename !== "string") {
        return res.status(400).send({
          error: "Invalid request: filename is required",
        });
      }

      const deleteUrlResponse = await generateDeleteSignedUrl(filename);

      return res.send(
        deleteUrlResponse,
        200,
        new Headers({
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        }),
      ); // Send { signedUrl: "..." }
    } catch (error) {
      console.error("Error generating delete signed URL:", error);

      return res.send({
        error: "Failed to generate delete signed URL",
        details: error,
      }, 500);
    }
  });

  s.get("/api/healthcheck", (_req, ctx) => {
    try {
      return new Response("API is healthy", {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    } catch (error) {
      console.error("Healthcheck failed:", error);
      return ctx.send({
        error: "Healthcheck failed",
        details: error,
      }, 500);
    }
  });

  s.get("/api/avatar/:seed", (req) => {
    const seed = req.params?.seed ? req.params.seed : "avatar";

    function stringToColor(str: string, salt = "") {
      let hash = 0;
      const salted = str + salt;
      for (let i = 0; i < salted.length; i++) {
        hash = salted.charCodeAt(i) + ((hash << 5) - hash);
      }
      let color = "#";
      for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xff;
        color += ("00" + value.toString(16)).slice(-2);
      }
      return color;
    }

    function generatePattern(seed: string) {
      const size = 5; // 5x5 grid
      const center = Math.floor(size / 2);
      const pattern: boolean[][] = Array(size).fill(0).map(() =>
        Array(size).fill(false)
      );

      // Create a simple hash function based on the seed
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
      }

      // Generate half of the pattern randomly (we'll mirror for symmetry)
      for (let y = 0; y < size; y++) {
        for (let x = 0; x <= center; x++) {
          // Use the hash to deterministically decide if this cell is filled
          const val = (hash >> ((y * size + x) % 31)) & 1;
          pattern[y][x] = val === 1;

          // Mirror horizontally (except for center column)
          if (x !== center) {
            pattern[y][size - 1 - x] = pattern[y][x];
          }
        }
      }

      return pattern;
    }

    // Generate different colors for background and pattern
    const fgColor = stringToColor(seed || "avatar");
    const bgColor = stringToColor(seed || "avatar", "background");
    const cellSize = 16;
    const margin = 8;
    const pattern = generatePattern(seed);
    const size = pattern.length;
    const svgSize = cellSize * size + margin * 2;

    // Generate SVG content from the pattern
    let cells = "";
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (pattern[y][x]) {
          cells += `<rect x="${margin + x * cellSize}" y="${
            margin + y * cellSize
          }" width="${cellSize}" height="${cellSize}" fill="${fgColor}" />`;
        }
      }
    }

    const svg = `
      <svg width="${svgSize}" height="${svgSize}" viewBox="0 0 ${svgSize} ${svgSize}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="${svgSize}" height="${svgSize}" fill="${bgColor}"/>
        ${cells}
      </svg>
    `.trim();

    return new Response(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  });

  return s;
}
