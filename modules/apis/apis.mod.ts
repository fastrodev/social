import { Fastro } from "fastro/core/server/types.ts";
// Import both functions
import {
  generateDeleteSignedUrl,
  generateSignedUrl,
} from "../../utils/signed-url.ts";

export function apisModule(s: Fastro) {
  // --- Existing /api/signed-url endpoint for uploads ---
  s.post("/api/signed-url", async (req, res) => {
    try {
      const body = await req.json();
      // Destructure both filename and contentType
      const { filename, contentType } = body;

      if (!filename || typeof filename !== "string") {
        return res.send({
          error: "Invalid request: filename is required",
        });
      }
      // Also validate contentType (optional but recommended)
      if (!contentType || typeof contentType !== "string") {
        return res.status(400).send({
          error: "Invalid request: contentType is required",
        });
      }

      // Pass contentType to the generation function
      const signedUrlResponse = await generateSignedUrl(filename, contentType);

      return res.send({
        signedUrl: signedUrlResponse.signedUrl,
      });
    } catch (error) {
      console.error("Error generating signed URL:", error);
      return res.send({
        error: "Failed to generate signed URL",
      }, 500);
    }
  });

  // --- NEW: API endpoint to get a DELETE signed URL ---
  s.post("/api/delete-signed-url", async (req, res) => {
    try {
      const body = await req.json();
      const { filename } = body;

      if (!filename || typeof filename !== "string") {
        return res.status(400).send({
          error: "Invalid request: filename is required",
        });
      }

      // Generate the delete signed URL using the new utility function
      const deleteUrlResponse = await generateDeleteSignedUrl(filename);

      return res.send(deleteUrlResponse); // Send { signedUrl: "..." }
    } catch (error) {
      console.error("Error generating delete signed URL:", error);

      return res.send({
        error: "Failed to generate delete signed URL",
        details: error,
      }, 500);
    }
  });

  return s;
}
