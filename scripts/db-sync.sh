#!/bin/bash

BUCKET_NAME="${GCS_BUCKET}"
DB_PATH="/app/db/sqlite.db"
WAL_PATH="/app/db/sqlite.db-wal"
SHM_PATH="/app/db/sqlite.db-shm"
BACKUP_PATH="/app/db/sqlite.db.backup"
CHECKSUM_FILE="/app/db/last_checksum"

# Function for timestamped logging
log_message() {
    echo "[$(date +"%Y-%m-%d %H:%M:%S")] DB-SYNC: $1"
}

# Calculate checksums for all DB files
get_db_checksum() {
    # Get checksums for all three files
    local db_sum=""
    local wal_sum=""
    local shm_sum=""
    
    if [ -f "$DB_PATH" ]; then
        db_sum=$(md5sum "$DB_PATH" | awk '{print $1}')
    fi
    
    if [ -f "$WAL_PATH" ]; then
        wal_sum=$(md5sum "$WAL_PATH" | awk '{print $1}')
    fi
    
    if [ -f "$SHM_PATH" ]; then
        shm_sum=$(md5sum "$SHM_PATH" | awk '{print $1}')
    fi
    
    echo "${db_sum}_${wal_sum}_${shm_sum}"
}

# Function to create local backup
create_backup() {
    log_message "Creating local backup of the database"
    if [ -f "$DB_PATH" ]; then
        cp "$DB_PATH" "$BACKUP_PATH"
        log_message "Local backup created successfully"
    else
        log_message "WARNING: Cannot create backup - main DB file not found"
    fi
}

# Function to restore from local backup
restore_from_backup() {
    log_message "Attempting to restore from local backup"
    if [ -f "$BACKUP_PATH" ]; then
        cp "$BACKUP_PATH" "$DB_PATH"
        log_message "Database restored from local backup"
        return 0
    else
        log_message "WARNING: No local backup found to restore from"
        return 1
    fi
}

# Function to upload to GCS
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
    
    if [ "$upload_success" = true ]; then
        log_message "Database successfully synced to GCS"
        # Create local backup after successful upload
        create_backup
        # Save current checksum
        get_db_checksum > "$CHECKSUM_FILE"
    fi
}

# Function to download from GCS
download_from_gcs() {
    log_message "Attempting to download SQLite database files from GCS bucket: $BUCKET_NAME"
    
    local download_success=true
    
    # Download main DB file
    if ! gsutil cp "gs://$BUCKET_NAME/sqlite.db" "$DB_PATH" 2>/dev/null; then
        log_message "WARNING: Main DB file not found in bucket or download failed"
        download_success=false
    fi
    
    # Download WAL file if it exists
    gsutil cp "gs://$BUCKET_NAME/sqlite.db-wal" "$WAL_PATH" 2>/dev/null || log_message "Note: WAL file not found in bucket (this may be normal)"
    
    # Download SHM file if it exists
    gsutil cp "gs://$BUCKET_NAME/sqlite.db-shm" "$SHM_PATH" 2>/dev/null || log_message "Note: SHM file not found in bucket (this may be normal)"
    
    if [ "$download_success" = true ]; then
        log_message "Database successfully downloaded from GCS"
        # Create local backup after successful download
        create_backup
        # Save current checksum after download
        get_db_checksum > "$CHECKSUM_FILE"
    else
        log_message "ERROR: Failed to download database from GCS"
    fi
}

# Function to check if database has changed
check_db_changed() {
    # Get current checksum
    local current_checksum=$(get_db_checksum)
    
    # Check if we have a stored checksum
    if [ -f "$CHECKSUM_FILE" ]; then
        local last_checksum=$(cat "$CHECKSUM_FILE")
        
        log_message "Last checksum: $last_checksum"
        log_message "Current checksum: $current_checksum"
        
        # If checksums differ
        if [ "$current_checksum" != "$last_checksum" ]; then
            log_message "Database content has changed"
            return 0  # Return success (database modified)
        fi
    else
        log_message "No previous checksum found"
        return 0  # Return success (force upload)
    fi
    
    return 1  # Return failure (no modification)
}

# Trap termination signals to sync before shutdown
trap 'log_message "Received termination signal, syncing database before shutdown"; upload_to_gcs' SIGTERM SIGINT

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
    # Force initial upload
    log_message "Forcing initial upload to GCS"
    upload_to_gcs
fi

# For debugging
iteration=0
force_upload_counter=0

# Continuously monitor and sync
while true; do
    # Increment counter for debugging
    ((iteration++))
    ((force_upload_counter++))
    
    log_message "Check #$iteration: Checking for database changes..."
    
    if [ -f "$DB_PATH" ]; then
        # Check if database has changed or force upload every 10 iterations
        if check_db_changed || [ $force_upload_counter -ge 10 ]; then
            if [ $force_upload_counter -ge 10 ]; then
                log_message "Forcing upload after 10 checks"
                force_upload_counter=0
            else
                log_message "Changes detected in database files"
            fi
            upload_to_gcs
        else
            log_message "No changes detected in this check"
        fi
    else
        log_message "WARNING: Main database file not found during check!"
        # Try to restore from backup first
        if ! restore_from_backup; then
            download_from_gcs
        fi
    fi
    
    log_message "Waiting 30 seconds until next check..."
    sleep 30
done