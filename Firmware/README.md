# First Setup

- Open this folder in VS-Code
- Install python3-venv using apt install python3-venv
- Add the esp-idf vscode extension and follow the express installation
- Install and build the frontend. Make sure python-is-python3 is installed to use the python command

## Running Tests

The firmware includes unit tests that cover WiFi functionality, HTTP server API, and ESP-NOW communication. These tests use the ESP-IDF Unity testing framework.

### Running Tests Locally

To run the tests locally, you need ESP-IDF installed:

```bash
# Navigate to the Firmware directory
cd Firmware

# Build and run tests using Docker (recommended)
docker run --rm -v $PWD:/project -w /project/Firmware -u $UID -e HOME=/tmp -e IDF_COMPONENT_MANAGER=0 espressif/idf:v5.4.1 /bin/bash -c "cp CMakeLists_test.txt CMakeLists.txt && idf.py build"

# Or if you have ESP-IDF installed locally:
# Copy test CMakeLists.txt and build
cp CMakeLists_test.txt CMakeLists.txt
export IDF_COMPONENT_MANAGER=0
idf.py build

# Restore original CMakeLists.txt after testing
git checkout CMakeLists.txt
```

### Test Coverage

The firmware tests cover:

- **WiFi/PlantFi functionality**: Initialization, AP configuration, connection status, RSSI reading, network scanning
- **HTTP Server API**: Web server start/stop, multiple cycles, error handling
- **ESP-NOW/PlantNow**: Initialization, peer management, data transmission, cloud setup

Tests are automatically run in the CI pipeline before building the production firmware.

### Test Architecture

- Tests use ESP-IDF Unity framework for assertions and test organization
- Stub implementations are used for hardware dependencies that can't be tested in CI
- Tests are organized by functional area with descriptive test names
- All tests include proper setup and teardown to avoid interference

## VS Code Configuration

c_cpp_properties.json should be something like this:

```json
{
  "configurations": [
    {
      "name": "Linux",
      "defines": [],
      "compilerPath": "${config:idf.toolsPath}/tools/riscv32-esp-elf/esp-13.2.0_20240530/riscv32-esp-elf/bin/riscv32-esp-elf-gcc",
      "cStandard": "c17",
      "cppStandard": "gnu++17",
      "intelliSenseMode": "linux-gcc-x64",
      "compileCommands": "${workspaceFolder}/build/compile_commands.json",
      "includePath": [
        "${config:idf.espIdfPath}/components/**",
        "${config:idf.espIdfPathWin}/components/**",
        "${workspaceFolder}/**"
      ],
      "browse": {
        "path": [
          "${config:idf.espIdfPath}/components",
          "${config:idf.espIdfPathWin}/components",
          "${workspaceFolder}"
        ]
      }
    }
  ],
  "version": 4
}
```

settings.json:

```json
{
    "idf.adapterTargetName": "esp32c6",
    "files.associations": {
        "configuration_mode_server.h": "c",
        "freertos.h": "c",
        "esp_mac.h": "c",
        "task.h": "c"
    },
    "idf.openOcdConfigs": [
        "board/esp32c6-builtin.cfg"
    ],
    "idf.port": "/dev/ttyACM0",
    "idf.flashType": "JTAG",
}
```