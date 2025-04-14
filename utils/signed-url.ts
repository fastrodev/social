import { Storage } from "google-cloud/storage";

/**
 * Response type for the signed URL generation
 */
export interface GenerateSignedUrlResponse {
  signedUrl: string;
}

/**
 * Generate a signed URL for uploading files to Google Cloud Storage.
 * This URL can be used to upload files directly from the frontend.
 * The URL is valid for 15 minutes and allows writing to the specified bucket.
 * The file should be uploaded with the same name as specified in the filename parameter.
 * The content type is set to "application/octet-stream" by default.
 * The signed URL is generated using the Google Cloud Storage client library.
 *
 * @param filename
 * @returns { signedUrl: string }
 * @throws {Error} If the signed URL generation fails
 * @example
 * const { signedUrl } = await generateSignedUrl("example.txt");
 * const file = yourFileInput.files[0];
 * await fetch(signedUrl, {
 *   method: 'PUT',
 *   headers: {
 *     'Content-Type': 'application/octet-stream',
 *   },
 *   body: file
 * });
 * @see https://cloud.google.com/storage/docs/access-control/signed-urls
 * @see https://cloud.google.com/storage/docs/access-control/signed-urls#creating-signed-urls
 * @see https://cloud.google.com/storage/docs/access-control/signed-urls#using-signed-urls
 */
// Use this URL to upload a file (frontend example with fetch)
export async function generateSignedUrl(
  filename: string,
): Promise<GenerateSignedUrlResponse> {
  try {
    const options = {
      version: "v4" as const,
      action: "write" as const,
      expires: Date.now() + 15 * 60 * 1000,
      contentType: "application/octet-stream",
    };
    const bucketName: string = Deno.env.get("BUCKET_NAME") || "";
    const storageClient = new Storage();
    const [url] = await storageClient
      .bucket(bucketName)
      .file(filename)
      .getSignedUrl(options);

    return {
      signedUrl: url,
    };
  } catch (error) {
    throw new Error(
      `Failed to generate signed URL: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}
