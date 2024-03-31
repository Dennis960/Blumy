#pragma once

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/event_groups.h"

#define PLANTFI_CONNECTED_BIT BIT0
#define PLANTFI_FAIL_BIT BIT1
#define PLANTFI_PASSWORD_WRONG_BIT BIT2

typedef enum
{
    PLANTFI_MODE_UNINITIALIZED,
    PLANTFI_MODE_ENABLED,
    PLANTFI_MODE_DISABLED
} plantfi_mode_t;

typedef enum
{
    PLANTFI_STA_STATUS_CONNECTED,
    PLANTFI_STA_STATUS_DISCONNECTED,
    PLANTIF_STA_STATUS_UNINITIALIZED,
    PLANTFI_STA_STATUS_FAIL,
    PLANTFI_STA_STATUS_PASSWORD_WRONG,
    PLANTFI_STA_STATUS_PENDING
} plantfi_sta_status_t;

void plantfi_initAp(const char *ssid, const char *password, int max_connection, bool *userConnectedToAp);

void plantfi_initSta(const char *ssid, const char *password, int max_retry, bool credentialsChanged);

/**
 * @return true if wifi credentials were found
 */
bool plantfi_initSavedSta();

/**
 * @param bits pointer to store the event bits that triggered the return, can be NULL
 */
esp_err_t plantfi_waitForStaConnection(EventBits_t *bits);

int8_t plantfi_getRssi();

typedef struct
{
    int8_t rssi;
    char ssid[32];
    uint8_t secure;
} plantfi_ap_record_t;

/**
 * @brief Scan for available wifi networks
 *
 * @param ap_records array of wifi_ap_record_t to store the scan results
 * @param num_ap_records number of elements in ap_records. Will be updated with the number of elements actually stored in ap_records
 *
 * @note The scan results are sorted by rssi in descending order.
 */
void plantfi_scan_networks(plantfi_ap_record_t *ap_records, int *num_ap_records);

plantfi_sta_status_t plantfi_get_sta_status();