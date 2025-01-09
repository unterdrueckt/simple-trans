#!/bin/sh

# Start PocketBase in the background
echo "Starting PocketBase..."
/usr/local/bin/pocketbase serve --dir /pb_data &

# Wait for PocketBase to become available (important for CLI commands)
echo "Waiting for PocketBase to start..."
until curl -s "http://127.0.0.1:8090/api/health" > /dev/null; do
    sleep 2
done
echo "PocketBase is running."

# Upsert the superuser using the PocketBase CLI
if [ -n "$ADMIN_EMAIL" ] && [ -n "$ADMIN_PASSWORD" ]; then
    echo "Upserting superuser..."
    pocketbase superuser upsert "$ADMIN_EMAIL" "$ADMIN_PASSWORD"
    if [ $? -eq 0 ]; then
        echo "Superuser upserted successfully."
    else
        echo "Failed to upsert superuser."
    fi
else
    echo "POCKETBASE_ADMIN_EMAIL or POCKETBASE_ADMIN_PASSWORD environment variable is not set. Skipping superuser upsert."
fi

# Start Nginx
echo "Starting Nginx..."
nginx -g 'daemon off;'
--db /pb_data
