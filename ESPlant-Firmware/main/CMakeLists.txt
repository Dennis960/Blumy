idf_component_register(SRCS "plantstore.c" "plantfi.c" "configuration_mode_server.c" "peripherals/sensors.c" "peripherals/adc.c" "main.c"
                    INCLUDE_DIRS ".")

# TODO Uncomment to flash the littlefs image, comment to save time
littlefs_create_partition_image(littlefs ../data FLASH_IN_PROJECT)