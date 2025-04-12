#!/bin/bash

BUCKET_NAME="${GCS_BUCKET}"
DB_PATH="/app/db/sqlite.db"
WAL_PATH="/app/db/sqlite.db-wal"
SHM_PATH="/app/db/sqlite.db-shm"
BACKUP_PATH="/app/db/sqlite.db.backup"

# Function for timestamped logging
log_message() {
    echo "[$(date +"%Y-%m-%d %H:%M:%S")] DB-SYNC: $1"
}

# Create local backup of the database
create_backup() {
    if [ -f "$DB_PATH" ]; then
        cp "$DB_PATH" "$BACKUP_PATH"
        log_message "Local backup created successfully"
    else
        log_message "WARNING: Cannot create backup - main DB file not found"
    fi
}

# Restore from local backup if needed
restore_from_backup() {
    if [ -f "$BACKUP_PATH" ]; then
        cp "$BACKUP_PATH" "$DB_PATH"
        log_message "Database restored from local backup"
        return 0
    else
        log_message "WARNING: No local backup found to restore from"
        return 1
    fi
}

# Upload all files to GCS
upload_to_gcs() {
    log_message "Uploading SQLite database files to GCS bucket: $BUCKET_NAME"
    
    local upload_success=true
    
    # Upload main DB file
    if [ -f "$DB_PATH" ]; then
        if ! gsutil cp "$DB_PATH" "gs://$BUCKET_NAME/sqlite.db"; then
            log_message "ERROR: Failed to upload main DB file"
            upload_success=false
        fi
    fi
    
    # Upload WAL file
    if [ -f "$WAL_PATH" ]; then
        if ! gsutil cp "$WAL_PATH" "gs://$BUCKET_NAME/sqlite.db-wal"; then
            log_message "ERROR: Failed to upload WAL file"
            upload_success=false
        fi
    fi
    
    # Upload SHM file
    if [ -f "$SHM_PATH" ]; then
        if ! gsutil cp "$SHM_PATH" "gs://$BUCKET_NAME/sqlite.db-shm"; then
            log_message "ERROR: Failed to upload SHM file"
            upload_success=false
        fi
    fi
    
    # Upload backup file
    if [ -f "$BACKUP_PATH" ]; then
        if ! gsutil cp "$BACKUP_PATH" "gs://$BUCKET_NAME/sqlite.db.backup"; then
            log_message "ERROR: Failed to upload backup file"
            upload_success=false
        fi
    fi
    
    if [ "$upload_success" = true ]; then
        log_message "All database files successfully synced to GCS"
    fi
}
# Download all files from GCS
download_from_gcs() {
    log_message "Downloading SQLite database files from GCS bucket: $BUCKET_NAME"
    
    local download_success=true
    
    # Download main DB file
    if ! gsutil cp "gs://$BUCKET_NAME/sqlite.db" "$DB_PATH" 2>/dev/null; then
        log_message "WARNING: Main DB file not found in bucket or download failed"
        download_success=false
    fi
    
    # Download WAL, SHM, and backup files silently (suppress error messages)
    gsutil cp "gs://$BUCKET_NAME/sqlite.db-wal" "$WAL_PATH" 2>/dev/null
    gsutil cp "gs://$BUCKET_NAME/sqlite.db-shm" "$SHM_PATH" 2>/dev/null
    gsutil cp "gs://$BUCKET_NAME/sqlite.db.backup" "$BACKUP_PATH" 2>/dev/null
    
    if [ "$download_success" = true ]; then
        log_message "Database files successfully downloaded from GCS"
    else
        log_message "ERROR: Failed to download main database from GCS"
    fi
}

# Trap termination signals to sync before shutdown
trap 'log_message "Received termination signal, syncing database before shutdown"; create_backup; upload_to_gcs; exit 0' SIGTERM SIGINT

log_message "Starting database sync service (PID: $$)"
log_message "Database path: $DB_PATH"
log_message "WAL file: $WAL_PATH"
log_message "SHM file: $SHM_PATH"
log_message "Backup file: $BACKUP_PATH" 
log_message "GCS bucket: $BUCKET_NAME"

# Check if database exists, otherwise try to restore or download
if [ ! -f "$DB_PATH" ]; then
    log_message "Main database file not found"
    if ! restore_from_backup; then
        log_message "Trying to download from GCS"
        download_from_gcs
    fi
else
    log_message "Database file found locally"
    # Create initial backup
    log_message "Creating initial backup"
    create_backup
    # Force initial upload
    log_message "Forcing initial upload to GCS"
    upload_to_gcs
fi

# For debugging
iteration=0

# Continuously monitor and sync
while true; do
    # Increment counter for debugging
    ((iteration++))
    
    log_message "Check #$iteration: Syncing database files..."
    
    if [ -f "$DB_PATH" ]; then
        # Create backup and upload every time (simplified approach)
        create_backup
        upload_to_gcs
    else
        log_message "WARNING: Main database file not found during check!"
        # Try to restore from backup first
        if ! restore_from_backup; then
            download_from_gcs
        fi
    fi
    
    log_message "Waiting 30 seconds until next sync..."
    sleep 30
done