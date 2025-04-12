#!/bin/bash

BUCKET_NAME="${GCS_BUCKET}"
DB_PATH="/app/db/sqlite.db"
BACKUP_PATH="/app/db/sqlite.db.backup"

# Function to upload to GCS
upload_to_gcs() {
    gsutil cp $DB_PATH gs://$BUCKET_NAME/sqlite.db
}

# Function to download from GCS
download_from_gcs() {
    gsutil cp gs://$BUCKET_NAME/sqlite.db $DB_PATH
}

# Initial download if DB doesn't exist
if [ ! -f $DB_PATH ]; then
    download_from_gcs
fi

# Continuously monitor and sync
while true; do
    if [ -f $DB_PATH ]; then
        # Create backup of current file
        cp $DB_PATH $BACKUP_PATH
        
        # If files are different, upload to GCS
        if ! cmp -s $DB_PATH $BACKUP_PATH; then
            upload_to_gcs
            echo "Database synced to GCS at $(date)"
        fi
    fi
    
    # Wait for 5 minutes before next sync
    sleep 300
done