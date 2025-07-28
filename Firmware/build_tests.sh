#!/bin/bash
# Build script for ESP-IDF firmware tests

# Set test environment
export SDKCONFIG=${SDKCONFIG:-sdkconfig.test}

# Copy test CMakeLists.txt to main location
cp CMakeLists_test.txt CMakeLists.txt

echo "Building firmware tests..."

# Build the tests
idf.py build

# Restore original CMakeLists.txt
git checkout CMakeLists.txt 2>/dev/null || echo "No original CMakeLists.txt to restore"

echo "Test build completed"