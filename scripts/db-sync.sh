# Upload all files to GCS
upload_to_gcs() {
    log_message "Uploading SQLite database files to GCS bucket: $BUCKET_NAME"
    
    local upload_success=true
    
    # Upload main DB file
    if [ -f "$DB_PATH" ]; then
        log_message "Uploading main DB file: $DB_PATH"
        if ! gsutil cp "$DB_PATH" "gs://$BUCKET_NAME/sqlite.db"; then
            log_message "ERROR: Failed to upload main DB file"
            upload_success=false
        else
            log_message "Successfully uploaded main DB file"
        fi
    else
        log_message "WARNING: Main DB file not found for upload"
    fi
    
    # List files in directory for debugging
    log_message "Current files in database directory:"
    ls -la $(dirname "$DB_PATH") | while read line; do
        log_message "FILE: $line"
    done
    
    # Upload WAL file with better logging
    if [ -f "$WAL_PATH" ]; then
        log_message "Uploading WAL file: $WAL_PATH"
        if ! gsutil cp "$WAL_PATH" "gs://$BUCKET_NAME/sqlite.db-wal"; then
            log_message "ERROR: Failed to upload WAL file"
            upload_success=false
        else
            log_message "Successfully uploaded WAL file"
        fi
    else
        log_message "WAL file not found for upload"
    fi
    
    # Upload SHM file with better logging
    if [ -f "$SHM_PATH" ]; then
        log_message "Uploading SHM file: $SHM_PATH"
        if ! gsutil cp "$SHM_PATH" "gs://$BUCKET_NAME/sqlite.db-shm"; then
            log_message "ERROR: Failed to upload SHM file"
            upload_success=false
        else
            log_message "Successfully uploaded SHM file"
        fi
    else
        log_message "SHM file not found for upload"
    fi
    
    # Upload backup file with better logging
    if [ -f "$BACKUP_PATH" ]; then
        log_message "Uploading backup file: $BACKUP_PATH"
        if ! gsutil cp "$BACKUP_PATH" "gs://$BUCKET_NAME/sqlite.db.backup"; then
            log_message "ERROR: Failed to upload backup file"
            upload_success=false
        else
            log_message "Successfully uploaded backup file"
        fi
    else
        log_message "Backup file not found for upload"
    fi
    
    if [ "$upload_success" = true ]; then
        log_message "All database files successfully synced to GCS"
    else
        log_message "WARNING: Some files failed to upload to GCS"
    fi
    
    # List files in bucket for verification
    log_message "Current files in GCS bucket:"
    gsutil ls "gs://$BUCKET_NAME/" | while read line; do
        log_message "BUCKET: $line"
    done
}