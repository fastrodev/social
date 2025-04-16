import { Fastro } from "fastro/core/server/types.ts";
import { generateSignedUrl } from "../../utils/signed-url.ts";

export function apisModule(s: Fastro) {
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
      return res.status(500).send({
        error: "Failed to generate signed URL",
      });
    }
  });

  return s;
}
