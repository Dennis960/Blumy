#!/bin/bash

# Set variables for database names, container names, and password
PROD_DB_CONTAINER="blumy-production-db-1"
TEST_DB_CONTAINER="blumy-test-db-1"
DB_USER="blumy"
DB_NAME="blumy"
DB_PASSWORD="blumy"

# Step 1: Create a dump of the production database and restore it to the test database
echo "Creating production database dump and restoring it to the test database..."
ssh Blumy << EOF
  # Dump the production database and directly pipe it to the test database
  docker exec -e PGPASSWORD=${DB_PASSWORD} ${PROD_DB_CONTAINER} pg_dump -U ${DB_USER} --clean --if-exists ${DB_NAME} | docker exec -e PGPASSWORD=${DB_PASSWORD} -i ${TEST_DB_CONTAINER} psql -U ${DB_USER} -d ${DB_NAME}
EOF

echo "Database synchronization complete."
