import { Fastro } from "fastro/core/server/types.ts";
import { generateSignedUrl } from "../../utils/signed-url.ts";

export function apisModule(s: Fastro) {
  // API endpoint to get a signed URL for file uploads
  s.post("/api/signed-url", async (req, res) => {
    try {
      // Get filename from request body
      const { filename } = await req.json();

      if (!filename || typeof filename !== "string") {
        return res.status(400).json({
          error: "Invalid request: filename is required",
        });
      }

      // Generate signed URL
      const signedUrlResponse = await generateSignedUrl(filename);

      // Return the signed URL
      return res.json(signedUrlResponse);
    } catch (error) {
      console.error("Error generating signed URL:", error);
      return res.status(500).json({
        error: "Failed to generate signed URL",
      });
    }
  });

  return s;
}
