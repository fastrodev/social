import { Storage } from "@google-cloud/storage";

// Konfigurasi
const BUCKET_NAME = Deno.env.get("GCS_BUCKET") || "your-bucket-name";
const DB_PATH = "/app/db/sqlite.db";
const WAL_PATH = "/app/db/sqlite.db-wal";
const SHM_PATH = "/app/db/sqlite.db-shm";

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
  while (true) {
    console.log("Syncing database files...");

    // Cek apakah file utama ada, jika tidak, unduh dari GCS
    if (!(await fileExists(DB_PATH))) {
      console.log(
        "Main database file not found locally. Downloading from GCS...",
      );
      await downloadFromGCS();
    }

    await uploadToGCS();
    console.log("Waiting 30 seconds until next sync...");
    await new Promise((resolve) => setTimeout(resolve, 30000));
  }
}

// Mulai loop sinkronisasi
syncLoop().catch((err) => {
  console.error("Error in sync loop:", err);
});
