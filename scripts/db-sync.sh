#!/bin/bash

BUCKET_NAME="${GCS_BUCKET}"
DB_PATH="/app/db/sqlite.db"
BACKUP_PATH="/app/db/sqlite.db.backup"
LAST_MODIFIED_FILE="/app/db/last_modified"

# Function for timestamped logging
log_message() {
    echo "[$(date +"%Y-%m-%d %H:%M:%S")] DB-SYNC: $1"
}

# Function to upload to GCS
upload_to_gcs() {
    log_message "Uploading database to GCS bucket: $BUCKET_NAME"
    if gsutil cp $DB_PATH gs://$BUCKET_NAME/sqlite.db; then
        log_message "Database successfully synced to GCS"
        # Record successful upload time
        date +%s > "$LAST_MODIFIED_FILE"
    else
        log_message "ERROR: Failed to sync database to GCS"
    fi
}

# Function to download from GCS
download_from_gcs() {
    log_message "Attempting to download database from GCS bucket: $BUCKET_NAME"
    if gsutil cp gs://$BUCKET_NAME/sqlite.db $DB_PATH; then
        log_message "Database successfully downloaded from GCS"
    else
        log_message "ERROR: Failed to download database from GCS"
    fi
}

# Function to check if database has been accessed
check_db_accessed() {
    # Get current timestamp of database file
    local current_db_time=$(stat -c %Y "$DB_PATH")
    
    # Check if we have a stored last modified time
    if [ -f "$LAST_MODIFIED_FILE" ]; then
        local last_upload_time=$(cat "$LAST_MODIFIED_FILE")
        
        log_message "Last upload time: $(date -d @$last_upload_time)"
        log_message "Current DB time: $(date -d @$current_db_time)"
        
        # If DB was accessed after our last upload
        if (( current_db_time > last_upload_time )); then
            log_message "Database has been modified since last upload"
            return 0  # Return success (database modified)
        fi
    else
        log_message "No previous upload timestamp found"
        return 0  # Return success (force upload)
    fi
    
    return 1  # Return failure (no modification)
}

# Trap termination signals to sync before shutdown
trap 'log_message "Received termination signal, syncing database before shutdown"; upload_to_gcs' SIGTERM SIGINT

log_message "Starting database sync service (PID: $$)"
log_message "Database path: $DB_PATH"
log_message "GCS bucket: $BUCKET_NAME"

# Force initial upload
log_message "Forcing initial upload to GCS"
if [ -f $DB_PATH ]; then
    upload_to_gcs
else
    log_message "Database file not found locally"
    download_from_gcs
fi

# For debugging
iteration=0

# Continuously monitor and sync
while true; do
    # Increment counter for debugging
    ((iteration++))
    
    log_message "Check #$iteration: Checking for database changes..."
    
    if [ -f $DB_PATH ]; then
        # Check if database has been accessed/modified
        if check_db_accessed; then
            log_message "Changes detected in database"
            upload_to_gcs
        else
            log_message "No changes detected in this check"
        fi
    else
        log_message "WARNING: Database file not found during check!"
    fi
    
    log_message "Waiting 30 seconds until next check..."
    sleep 30
done