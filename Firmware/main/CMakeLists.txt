if(DEFINED ENV{FIRMWARE_VERSION})
    set(FIRMWARE_VERSION $ENV{FIRMWARE_VERSION})
else()
    set(FIRMWARE_VERSION 0)
endif()

idf_component_register(
    SRCS "plantmqtt.c" "index_html.c" "plantstore.c" "plantfi.c" "configuration_mode_server.c" "peripherals/sensors.c" "peripherals/adc.c" "update.c" "main.c"
    INCLUDE_DIRS "."
)

target_compile_definitions(${COMPONENT_LIB} PRIVATE FIRMWARE_VERSION=${FIRMWARE_VERSION})
