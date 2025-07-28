#!/bin/bash
# Test runner script for Blumy firmware tests

set -e

echo "Starting Blumy Firmware Tests..."

# Get script directory to handle relative paths correctly
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR"

# Save original CMakeLists.txt
if [ -f CMakeLists.txt ]; then
    cp CMakeLists.txt CMakeLists.txt.backup
fi

# Use test CMakeLists.txt
cp CMakeLists_test.txt CMakeLists.txt

echo "Building test firmware..."

# Build tests with Docker (default) or local ESP-IDF
if command -v docker &> /dev/null && [ "${USE_LOCAL_IDF}" != "1" ]; then
    echo "Using Docker ESP-IDF..."
    docker run --rm -v $PWD:/project -w /project -e HOME=/tmp -e IDF_COMPONENT_MANAGER=0 espressif/idf:v5.4.1 /bin/bash -c "cd /project && idf.py build"
else
    echo "Using local ESP-IDF..."
    export IDF_COMPONENT_MANAGER=0
    idf.py build
fi

echo "Test build completed successfully!"

# Restore original CMakeLists.txt
if [ -f CMakeLists.txt.backup ]; then
    mv CMakeLists.txt.backup CMakeLists.txt
else
    git checkout CMakeLists.txt 2>/dev/null || echo "Warning: Could not restore original CMakeLists.txt"
fi

echo "Tests completed. Binary available at: build/firmware_tests.bin"
echo ""
echo "To flash and run tests on hardware:"
echo "  idf.py -p /dev/ttyUSB0 flash monitor"
echo ""
echo "Note: Tests include stub implementations for CI compatibility."
echo "Hardware-specific functionality may behave differently on actual hardware."