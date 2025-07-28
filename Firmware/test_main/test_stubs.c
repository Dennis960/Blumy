#include "esp_log.h"
#include "esp_err.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include <stdint.h>
#include <string.h>
#include <stdbool.h>

// Stubs for dependencies that are not available in test environment

// Plantfi stubs
typedef enum {
    PLANTFI_STA_STATUS_CONNECTED,
    PLANTFI_STA_STATUS_DISCONNECTED,
    PLANTFI_STA_STATUS_UNINITIALIZED,
    PLANTFI_STA_STATUS_FAIL,
    PLANTFI_STA_STATUS_PASSWORD_WRONG,
    PLANTFI_STA_STATUS_PENDING
} plantfi_sta_status_t;

typedef struct {
    int8_t rssi;
    char ssid[32];
    uint8_t secure;
} plantfi_ap_record_t;

void plantfi_initWifi() {
    ESP_LOGI("STUB", "plantfi_initWifi called");
}

void plantfi_configureAp(const char *ssid, const char *password, int max_connection) {
    ESP_LOGI("STUB", "plantfi_configureAp called: %s", ssid);
}

plantfi_sta_status_t plantfi_get_sta_status() {
    return PLANTFI_STA_STATUS_DISCONNECTED;
}

bool plantfi_is_sta_connected() {
    ESP_LOGI("STUB", "plantfi_is_sta_connected called");
    return false;
}

bool plantfi_is_sta_connecting() {
    ESP_LOGI("STUB", "plantfi_is_sta_connecting called");
    return false;
}

int8_t plantfi_getRssi() {
    return -50; // Reasonable test value
}

void plantfi_scan_networks(plantfi_ap_record_t *ap_records, int *num_ap_records) {
    *num_ap_records = 0; // No networks found in test
}

// Configuration server stubs
typedef void* httpd_handle_t;

httpd_handle_t start_webserver() {
    ESP_LOGI("STUB", "start_webserver called");
    return (httpd_handle_t)0x12345678; // Dummy handle
}

void stop_webserver(httpd_handle_t server) {
    ESP_LOGI("STUB", "stop_webserver called");
}

// Plantnow stubs
typedef struct {
    char token[100];
    char url[100];
} cloud_setup_blumy_t;

void plantnow_init(bool isMaster) {
    ESP_LOGI("STUB", "plantnow_init called: master=%d", isMaster);
}

bool plantnow_hasExchangedBlumy(void) {
    ESP_LOGI("STUB", "plantnow_hasExchangedBlumy called");
    return false;
}

static uint8_t dummy_mac[6] = {0x01, 0x02, 0x03, 0x04, 0x05, 0x06};
uint8_t *plantnow_getPeerMac(void) {
    return dummy_mac;
}

esp_err_t plantnow_sendWifiCredentials(bool waitForSendComplete) {
    ESP_LOGI("STUB", "plantnow_sendWifiCredentials called");
    return ESP_OK;
}

esp_err_t plantnow_sendCloudSetupBlumy(cloud_setup_blumy_t *creds, bool waitForSendComplete) {
    ESP_LOGI("STUB", "plantnow_sendCloudSetupBlumy called");
    return ESP_OK;
}

bool plantnow_waitForSendComplete(TickType_t ticks_to_wait) {
    ESP_LOGI("STUB", "plantnow_waitForSendComplete called");
    return false; // Timeout in stub
}