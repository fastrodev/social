#!/bin/bash

BUCKET_NAME="${GCS_BUCKET}"
DB_PATH="/app/db/sqlite.db"
BACKUP_PATH="/app/db/sqlite.db.backup"

# Function to upload to GCS
upload_to_gcs() {
    gsutil cp $DB_PATH gs://$BUCKET_NAME/sqlite.db
    echo "Database synced to GCS at $(date)"
}

# Function to download from GCS
download_from_gcs() {
    gsutil cp gs://$BUCKET_NAME/sqlite.db $DB_PATH
    echo "Database downloaded from GCS at $(date)"
}

# Trap termination signals to sync before shutdown
trap upload_to_gcs SIGTERM SIGINT

# Initial download if DB doesn't exist
if [ ! -f $DB_PATH ]; then
    download_from_gcs
fi

# Initial backup
if [ -f $DB_PATH ]; then
    cp $DB_PATH $BACKUP_PATH
fi

# Continuously monitor and sync
while true; do
    if [ -f $DB_PATH ]; then
        # If files are different, upload to GCS
        if ! cmp -s $DB_PATH $BACKUP_PATH; then
            upload_to_gcs
            cp $DB_PATH $BACKUP_PATH
        fi
    fi
    
    # Wait for 30 seconds before next sync - shorter interval for Cloud Run
    sleep 30
done