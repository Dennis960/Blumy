execute_process(
    COMMAND date +%s%3N
    OUTPUT_VARIABLE CURRENT_TIME_MS
    OUTPUT_STRIP_TRAILING_WHITESPACE
)

idf_component_register(
    SRCS "index_html.c" "plantstore.c" "plantfi.c" "configuration_mode_server.c" "peripherals/sensors.c" "peripherals/adc.c" "update.c" "captive_plant_dns.c" "main.c"
    INCLUDE_DIRS "."
)

target_compile_definitions(${COMPONENT_LIB} PRIVATE FIRMWARE_VERSION=${CURRENT_TIME_MS})
