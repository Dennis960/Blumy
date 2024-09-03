# First Setup

- Open this folder in VS-Code
- Install python3-venv using apt install python3-venv
- Add the esp-idf vscode extension and follow the express installation
- Install and build the frontend. Make sure python-is-python3 is installed to use the python command

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