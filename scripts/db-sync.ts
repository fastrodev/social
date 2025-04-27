import { Storage } from "google-cloud/storage";

// Konfigurasi
const BUCKET_NAME = Deno.env.get("GCS_BUCKET") || "your-bucket-name";
const DB_PATH = "/app/db/sqlite.db";
const WAL_PATH = "/app/db/sqlite.db-wal";
const SHM_PATH = "/app/db/sqlite.db-shm";
const SYNC_INTERVAL_MS = 5 * 60000; // 5 minutes in milliseconds

const storage = new Storage();
const bucket = storage.bucket(BUCKET_NAME);

// Utility function untuk memeriksa apakah file ada
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await Deno.stat(filePath);
    return true;
  } catch {
    return false;
  }
}

// Upload file ke GCS
async function uploadFile(localPath: string, remotePath: string) {
  if (await fileExists(localPath)) {
    console.log(`Uploading ${localPath} to ${remotePath}...`);
    await bucket.upload(localPath, { destination: remotePath });
    console.log(`Uploaded: ${remotePath}`);
  } else {
    console.log(`File not found: ${localPath}`);
  }
}

// Download file dari GCS
async function downloadFile(remotePath: string, localPath: string) {
  console.log(`Downloading ${remotePath} to ${localPath}...`);
  const file = bucket.file(remotePath);
  try {
    await file.download({ destination: localPath });
    console.log(`Downloaded: ${remotePath}`);
  } catch (_err) {
    console.log(`File not found in GCS: ${remotePath}`);
  }
}

// Sinkronisasi file ke GCS
async function uploadToGCS() {
  console.log("Starting upload to GCS...");
  await uploadFile(DB_PATH, "sqlite.db");
  await uploadFile(WAL_PATH, "sqlite.db-wal");
  await uploadFile(SHM_PATH, "sqlite.db-shm");
  console.log("Upload to GCS completed.");
}

// Sinkronisasi file dari GCS
async function downloadFromGCS() {
  console.log("Starting download from GCS...");
  await downloadFile("sqlite.db", DB_PATH);
  await downloadFile("sqlite.db-wal", WAL_PATH);
  await downloadFile("sqlite.db-shm", SHM_PATH);
  console.log("Download from GCS completed.");
}

async function syncLoop() {
  console.log("Starting database sync service...");
  let firstRun = true;

  if (!(await fileExists(DB_PATH))) {
    console.log(
      "Main database file not found locally. Downloading from GCS...",
    );
    await downloadFromGCS();
    firstRun = true;
  }

  while (true) {
    try {
      // If this is the first run after downloading, wait before uploading
      if (firstRun) {
        console.log("Waiting for initial sync interval before first upload...");
        await new Promise((resolve) => setTimeout(resolve, SYNC_INTERVAL_MS));
        firstRun = false;
      }

      console.log("Syncing database files...");
      await uploadToGCS();

      console.log("Waiting 10 minutes until next sync...");
      await new Promise((resolve) => setTimeout(resolve, SYNC_INTERVAL_MS));
    } catch (error) {
      console.error("Error during database sync:", error);
      if (error instanceof Error) {
        console.error(`Error details: ${error.message}`);
        if (error.stack) console.error(`Stack: ${error.stack}`);
      }

      // Implement exponential backoff for retries
      const backoffTime = 30000; // 30 seconds
      console.log(
        `Encountered an error. Retrying in ${backoffTime / 1000} seconds...`,
      );

      // Wait shorter time before retry on error
      await new Promise((resolve) => setTimeout(resolve, backoffTime));
    }
  }
}

// Mulai loop sinkronisasi
syncLoop().catch((err) => {
  console.error("Error in sync loop:", err);
  console.error("Fatal error in sync process. Service terminated.");
});
