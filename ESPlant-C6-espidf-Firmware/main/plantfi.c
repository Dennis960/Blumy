#include "plantfi.h"

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_log.h"
#include <string.h>
#include "freertos/event_groups.h"
#include "esp_system.h"
#include "esp_wifi.h"
#include "esp_event.h"
#include "nvs_flash.h"

#include "lwip/err.h"
#include "lwip/sys.h"

#include "plantstore.h"
#include "defaults.h"

EventGroupHandle_t plantfi_sta_event_group;

const char *PLANTFI_TAG = "PLANTFI";

int plantfi_retry_num = 0;

int plantfi_max_retry;

plantfi_mode_t plantfi_ap = PLANTFI_MODE_UNINITIALIZED;
plantfi_mode_t plantfi_sta = PLANTFI_MODE_UNINITIALIZED;

char plantfi_ssid[DEFAULT_SSID_MAX_LENGTH];
char plantfi_password[DEFAULT_PASSWORD_MAX_LENGTH];

bool _credentialsChanged = false;
bool *_userConnectedToAp = NULL;

void plantfi_event_handler(void *arg, esp_event_base_t event_base,
                           int32_t event_id, void *event_data)
{
    if (event_base == WIFI_EVENT && event_id == WIFI_EVENT_STA_START)
    {
        esp_wifi_connect();
    }
    else if (event_base == WIFI_EVENT && event_id == WIFI_EVENT_STA_DISCONNECTED)
    {
        wifi_event_sta_disconnected_t *event = (wifi_event_sta_disconnected_t *)event_data;
        if (event->reason == WIFI_REASON_AUTH_FAIL)
        {
            ESP_LOGI(PLANTFI_TAG, "Password is wrong");
            xEventGroupSetBits(plantfi_sta_event_group, PLANTFI_PASSWORD_WRONG_BIT);
            plantfi_sta = PLANTFI_MODE_DISABLED;
            return;
        }
        else if (plantfi_retry_num < plantfi_max_retry)
        {
            esp_wifi_connect();
            plantfi_retry_num++;
            ESP_LOGI(PLANTFI_TAG, "retry to connect to the AP");
        }
        else
        {
            xEventGroupSetBits(plantfi_sta_event_group, PLANTFI_FAIL_BIT);
            plantfi_sta = PLANTFI_MODE_DISABLED;
        }
        ESP_LOGI(PLANTFI_TAG, "connect to the AP fail");
    }
    else if (event_base == IP_EVENT && event_id == IP_EVENT_STA_GOT_IP)
    {
        ip_event_got_ip_t *event = (ip_event_got_ip_t *)event_data;
        ESP_LOGI(PLANTFI_TAG, "got ip:" IPSTR, IP2STR(&event->ip_info.ip));
        plantfi_retry_num = 0;
        xEventGroupSetBits(plantfi_sta_event_group, PLANTFI_CONNECTED_BIT);
        if (_credentialsChanged)
        {
            _credentialsChanged = false;
            plantstore_setWifiCredentials(plantfi_ssid, plantfi_password);
        }
    }
    if (event_base == WIFI_EVENT && event_id == WIFI_EVENT_AP_STACONNECTED)
    {
        if (_userConnectedToAp != NULL)
        {
            *_userConnectedToAp = true;
        }
        ESP_LOGI(PLANTFI_TAG, "User connected to AP");
    }
}

void plantfi_initWifiIfNecessary()
{
    if (plantfi_sta != PLANTFI_MODE_UNINITIALIZED || plantfi_ap != PLANTFI_MODE_UNINITIALIZED)
    {
        ESP_LOGI(PLANTFI_TAG, "Wifi already initialized");
        return;
    }
    ESP_ERROR_CHECK(esp_netif_init());
    ESP_ERROR_CHECK(esp_event_loop_create_default());
    esp_event_handler_instance_t instance_any_id;
    esp_event_handler_instance_t instance_got_ip;
    ESP_ERROR_CHECK(esp_event_handler_register(WIFI_EVENT, ESP_EVENT_ANY_ID, &plantfi_event_handler, &instance_any_id)); // TODO unregister event handlers on deinit
    ESP_ERROR_CHECK(esp_event_handler_register(IP_EVENT, IP_EVENT_STA_GOT_IP, &plantfi_event_handler, &instance_got_ip));

    wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
    ESP_ERROR_CHECK(esp_wifi_init(&cfg));
}

void plantfi_initAp(const char *ssid, const char *password, int max_connection, bool *userConnectedToAp)
{
    plantfi_initWifiIfNecessary();
    if (plantfi_ap == PLANTFI_MODE_ENABLED)
    {
        ESP_LOGE(PLANTFI_TAG, "AP already enabled");
        return;
    }
    if (plantfi_sta == PLANTFI_MODE_ENABLED)
    {
        ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_APSTA));
    }
    else
    {
        ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_AP));
    }
    wifi_config_t wifi_ap_config = {
        .ap = {
            .ssid = "",
            .password = "",
            .max_connection = max_connection,
        },
    };
    strcpy((char *)wifi_ap_config.ap.ssid, ssid);
    strcpy((char *)wifi_ap_config.ap.password, password);
    if (plantfi_ap == PLANTFI_MODE_UNINITIALIZED)
    {
        esp_netif_create_default_wifi_ap();
    }
    ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_AP, &wifi_ap_config));

    if (plantfi_ap == PLANTFI_MODE_UNINITIALIZED)
    {
        ESP_ERROR_CHECK(esp_wifi_start());
    }
    _userConnectedToAp = userConnectedToAp;
    plantfi_ap = PLANTFI_MODE_ENABLED;
}

void plantfi_initSta(const char *ssid, const char *password, int max_retry, bool credentialsChanged)
{
    _credentialsChanged = credentialsChanged;
    plantfi_initWifiIfNecessary();
    if (plantfi_sta == PLANTFI_MODE_ENABLED)
    {
        ESP_LOGI(PLANTFI_TAG, "STA already enabled, disconnecting");
        esp_wifi_disconnect();
        plantfi_sta = PLANTFI_MODE_DISABLED;
    }
    if (plantfi_ap == PLANTFI_MODE_ENABLED)
    {
        ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_APSTA));
    }
    else
    {
        ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA));
    }
    plantfi_max_retry = max_retry;
    if (plantfi_sta == PLANTFI_MODE_UNINITIALIZED)
    {
        plantfi_sta_event_group = xEventGroupCreate();
        esp_netif_create_default_wifi_sta();
    }
    else
    {
        xEventGroupClearBits(plantfi_sta_event_group, PLANTFI_CONNECTED_BIT | PLANTFI_FAIL_BIT | PLANTFI_PASSWORD_WRONG_BIT);
    }
    wifi_config_t wifi_sta_config = {
        .sta = {
            .ssid = "",
            .password = "",
        },
    };
    strcpy((char *)wifi_sta_config.sta.ssid, ssid);
    strcpy((char *)wifi_sta_config.sta.password, password);
    strcpy(plantfi_ssid, ssid);
    strcpy(plantfi_password, password);
    ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_STA, &wifi_sta_config));

    if (plantfi_sta == PLANTFI_MODE_UNINITIALIZED)
    {
        ESP_ERROR_CHECK(esp_wifi_start());
    }
    else
    {
        esp_wifi_connect();
    }
    plantfi_sta = PLANTFI_MODE_ENABLED;
}

/**
 * @return true if wifi credentials were found
 */
bool plantfi_initSavedSta()
{
    char ssid[DEFAULT_SSID_MAX_LENGTH];
    char password[DEFAULT_PASSWORD_MAX_LENGTH];
    if (plantstore_getWifiCredentials(ssid, password, sizeof(ssid), sizeof(password)))
    {
        plantfi_initSta(ssid, password, 5, false);
        ESP_LOGI(PLANTFI_TAG, "Wifi credentials found for %s", ssid);
        return true;
    }
    else
    {
        ESP_LOGI(PLANTFI_TAG, "No wifi credentials found");
    }
    return false;
}

/**
 * @param bits pointer to store the event bits that triggered the return, can be NULL
 */
esp_err_t plantfi_waitForStaConnection(EventBits_t *bits)
{
    if (plantfi_sta == PLANTFI_MODE_UNINITIALIZED)
    {
        ESP_LOGE(PLANTFI_TAG, "STA not initialized");
        return ESP_FAIL;
    }
    // TODO
    /* Waiting until either the connection is established (PLANTFI_CONNECTED_BIT) or connection failed for the maximum
     * number of re-tries (PLANTFI_FAIL_BIT). The bits are set by plantfi_event_handler() (see above) */
    EventBits_t _bits = xEventGroupWaitBits(plantfi_sta_event_group,
                                            PLANTFI_CONNECTED_BIT | PLANTFI_FAIL_BIT | PLANTFI_PASSWORD_WRONG_BIT,
                                            pdFALSE,
                                            pdFALSE,
                                            portMAX_DELAY);
    if (bits != NULL)
    {
        *bits = _bits;
    }
    return ESP_OK;
}

int8_t plantfi_getRssi()
{
    if (plantfi_sta == PLANTFI_MODE_UNINITIALIZED || plantfi_sta == PLANTFI_MODE_DISABLED)
    {
        ESP_LOGE(PLANTFI_TAG, "STA not initialized");
        return -1;
    }
    wifi_ap_record_t ap_info;
    esp_wifi_sta_get_ap_info(&ap_info);
    return ap_info.rssi;
}

int plantfi_compareWifiApRecords(const void *a, const void *b)
{
    return ((wifi_ap_record_t *)b)->rssi - ((wifi_ap_record_t *)a)->rssi;
}

/**
 * @brief Scan for available wifi networks
 *
 * @param ap_records array of wifi_ap_record_t to store the scan results
 * @param num_ap_records number of elements in ap_records. Will be updated with the number of elements actually stored in ap_records
 *
 * @note The scan results are sorted by rssi in descending order.
 */
void plantfi_scan_networks(plantfi_ap_record_t *ap_records, int *num_ap_records)
{
    wifi_scan_config_t scan_config = {
        .ssid = NULL,
        .bssid = NULL,
        .channel = 0,
    };
    ESP_ERROR_CHECK(esp_wifi_scan_start(&scan_config, true));
    uint16_t ap_num = 0;
    ESP_ERROR_CHECK(esp_wifi_scan_get_ap_num(&ap_num));
    wifi_ap_record_t *ap_list = (wifi_ap_record_t *)malloc(sizeof(wifi_ap_record_t) * ap_num);
    ESP_ERROR_CHECK(esp_wifi_scan_get_ap_records(&ap_num, ap_list));
    qsort(ap_list, ap_num, sizeof(wifi_ap_record_t), plantfi_compareWifiApRecords);

    if (ap_num > *num_ap_records)
    {
        ap_num = *num_ap_records;
    }

    for (int i = 0; i < ap_num; i++)
    {
        ap_records[i].rssi = ap_list[i].rssi;
        strcpy(ap_records[i].ssid, (char *)ap_list[i].ssid);
        ap_records[i].secure = ap_list[i].authmode;
    }

    free(ap_list);
    *num_ap_records = ap_num;
}

plantfi_sta_status_t plantfi_get_sta_status()
{
    if (plantfi_sta == PLANTFI_MODE_UNINITIALIZED)
    {
        ESP_LOGE(PLANTFI_TAG, "STA not initialized");
        return PLANTIF_STA_STATUS_UNINITIALIZED;
    }
    if (plantfi_sta == PLANTFI_MODE_DISABLED)
    {
        return PLANTFI_STA_STATUS_DISCONNECTED;
    }
    EventBits_t bits = xEventGroupGetBits(plantfi_sta_event_group);
    if (bits & PLANTFI_CONNECTED_BIT)
    {
        wifi_ap_record_t ap_info;
        esp_err_t err = esp_wifi_sta_get_ap_info(&ap_info);
        if (err != ESP_OK)
        {
            ESP_LOGE(PLANTFI_TAG, "Failed to get ap info");
            return PLANTFI_STA_STATUS_FAIL;
        }
        return PLANTFI_STA_STATUS_CONNECTED;
    }
    if (bits & PLANTFI_FAIL_BIT)
    {
        return PLANTFI_STA_STATUS_FAIL;
    }
    if (bits & PLANTFI_PASSWORD_WRONG_BIT)
    {
        return PLANTFI_STA_STATUS_PASSWORD_WRONG;
        return PLANTIF_STA_STATUS_UNINITIALIZED;
    }
    return PLANTFI_STA_STATUS_PENDING;
}
