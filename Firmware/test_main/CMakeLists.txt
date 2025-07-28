idf_component_register(
    SRCS "test_main.c" "test_stubs.c"
    INCLUDE_DIRS "."
    REQUIRES unity nvs_flash esp_wifi esp_http_server
)