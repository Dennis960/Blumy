#pragma once

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_event.h"
#include "peripherals/sensors.h"
#include "esp_netif.h"

#define PLANTFI_CONNECTED_BIT BIT0
#define PLANTFI_FAIL_BIT BIT1
#define PLANTFI_PASSWORD_WRONG_BIT BIT2

typedef enum
{
    PLANTFI_STA_STATUS_CONNECTED,
    PLANTFI_STA_STATUS_DISCONNECTED,
    PLANTFI_STA_STATUS_UNINITIALIZED,
    PLANTFI_STA_STATUS_FAIL,
    PLANTFI_STA_STATUS_PASSWORD_WRONG, // Cannot be determined by the ESP32
    PLANTFI_STA_STATUS_PENDING
} plantfi_sta_status_t;

typedef struct
{
    int8_t rssi;
    char ssid[32];
    uint8_t secure;
} plantfi_ap_record_t;

void plantfi_event_handler(void *arg, esp_event_base_t event_base,
                           int32_t event_id, void *event_data);
void plantfi_initWifiApSta();
void plantfi_initWifiStaOnly();
void plantfi_configureAp(const char *ssid, const char *password, int max_connection);
void plantfi_configureSta(const char *ssid, const char *password, int max_retry, bool credentialsChanged);
void plantfi_setEnableNatAndDnsOnConnect(bool enableNatAndDnsOnConnect);
/**
 * @return true if wifi credentials were found
 */
bool plantfi_configureStaFromPlantstore();
/**
 * @param bits pointer to store the event bits that triggered the return, can be NULL
 */
esp_err_t plantfi_waitForStaConnection(EventBits_t *bits);
int8_t plantfi_getRssi();
/**
 * @brief Scan for available wifi networks
 *
 * @param ap_records array of wifi_ap_record_t to store the scan results
 * @param num_ap_records number of elements in ap_records. Will be updated with the number of elements actually stored in ap_records
 *
 * @note The scan results are sorted by rssi in descending order. Should only be called when AP is already enabled
 */
void plantfi_scan_networks(plantfi_ap_record_t *ap_records, int *num_ap_records);
plantfi_sta_status_t plantfi_get_sta_status();
bool plantfi_is_sta_connected();
bool plantfi_is_user_connected_to_ap();
bool plantfi_is_sta_connecting();
/**
 * Returns the status code of the http request
 */
int plantfi_send_sensor_data_blumy(sensors_full_data_t *sensors_data, int8_t rssi);
bool plantfi_test_blumy_connection(char *token, char *url);
void plantfi_send_sensor_data_http(sensors_full_data_t *sensors_data, int8_t rssi);
bool plantfi_test_http_connection(char *sensorId, char *url, char *auth);
void plantfi_send_sensor_data_mqtt(sensors_full_data_t *sensors_data, int8_t rssi);
bool plantfi_test_mqtt_connection(char *sensorId, char *server, int16_t port, char *username, char *password, char *topic, char *clientId);
esp_netif_t *plantfi_get_ap_netif();
esp_netif_t *plantfi_get_sta_netif();