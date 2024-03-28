idf_component_register(SRCS "configuration_mode_server.c" "secret.c" "wifi.c" "peripherals/config.c" "peripherals/sensors.c" "peripherals/adc.c" "main.c"
                    INCLUDE_DIRS ".")

littlefs_create_partition_image(littlefs ../data FLASH_IN_PROJECT)