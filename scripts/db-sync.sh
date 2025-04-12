#!/bin/bash

BUCKET_NAME="${GCS_BUCKET}"
DB_PATH="/app/db/sqlite.db"
BACKUP_PATH="/app/db/sqlite.db.backup"

# Function for timestamped logging
log_message() {
    echo "[$(date +"%Y-%m-%d %H:%M:%S")] DB-SYNC: $1"
}

# Function to upload to GCS
upload_to_gcs() {
    log_message "Uploading database to GCS bucket: $BUCKET_NAME"
    if gsutil cp $DB_PATH gs://$BUCKET_NAME/sqlite.db; then
        log_message "Database successfully synced to GCS"
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

# Function to compare files with file info
compare_files() {
    log_message "DB file info: $(ls -la $DB_PATH)"
    log_message "Backup file info: $(ls -la $BACKUP_PATH)"
    
    DB_SIZE=$(stat -c%s "$DB_PATH")
    BACKUP_SIZE=$(stat -c%s "$BACKUP_PATH")
    
    log_message "DB size: $DB_SIZE bytes, Backup size: $BACKUP_SIZE bytes"
    
    if [ "$DB_SIZE" != "$BACKUP_SIZE" ]; then
        log_message "Size difference detected"
        return 1
    fi
    
    if ! cmp -s "$DB_PATH" "$BACKUP_PATH"; then
        log_message "Content difference detected"
        return 1
    fi
    
    return 0
}

# Trap termination signals to sync before shutdown
trap 'log_message "Received termination signal, syncing database before shutdown"; upload_to_gcs' SIGTERM SIGINT

log_message "Starting database sync service (PID: $$)"
log_message "Database path: $DB_PATH"
log_message "GCS bucket: $BUCKET_NAME"

# Force initial upload regardless of comparison
log_message "Forcing initial upload to GCS"
if [ -f $DB_PATH ]; then
    upload_to_gcs
else
    log_message "Database file not found locally"
    download_from_gcs
fi

# Create initial backup
if [ -f $DB_PATH ]; then
    log_message "Creating initial backup of database"
    cp $DB_PATH $BACKUP_PATH
    log_message "Initial backup created"
fi

# For debugging
iteration=0

# Continuously monitor and sync
while true; do
    # Increment counter for debugging
    ((iteration++))
    
    log_message "Check #$iteration: Checking for database changes..."
    
    if [ -f $DB_PATH ]; then
        # Use enhanced comparison function
        if ! compare_files; then
            log_message "Changes detected in database"
            upload_to_gcs
            log_message "Creating new backup"
            cp $DB_PATH $BACKUP_PATH
            log_message "Backup updated"
        else
            log_message "No changes detected in this check"
        fi
    else
        log_message "WARNING: Database file not found during check!"
    fi
    
    log_message "Waiting 30 seconds until next check..."
    sleep 30
done