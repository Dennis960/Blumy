#!/bin/bash

# Step 1: Connect to the server and create a dump with the --clean and --if-exists options
ssh Blumy << 'EOF'
echo "Creating production database dump with schema cleanup..."
docker exec blumy-production-db-1 pg_dump -U blumy -W --clean --if-exists blumy > /tmp/blumy_prod_dump.sql
EOF

# Step 2: Download the dump from the server
echo "Downloading production database dump..."
scp Blumy:/tmp/blumy_prod_dump.sql ./

# Step 3: Completely wipe the local development database
echo "Dropping and recreating the local database schema..."
docker exec -e PGPASSWORD blumy -i blumy-dev-db-1 psql -U blumy -W blumy -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Step 4: Restore the dump to the local development database
echo "Restoring the dump to the local development database..."
docker exec -i blumy-dev-db-1 psql -U blumy -W blumy < ./blumy_prod_dump.sql

# Step 5: Clean up the local dump file
echo "Cleaning up local dump file..."
rm ./blumy_prod_dump.sql

echo "Database synchronization complete."
