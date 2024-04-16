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

plantfi_sta_status_t plantfi_sta_status = PLANTFI_STA_STATUS_UNINITIALIZED;

char plantfi_ssid[DEFAULT_SSID_MAX_LENGTH];
char plantfi_password[DEFAULT_PASSWORD_MAX_LENGTH];

bool _credentialsChanged = false;
bool *_userConnectedToAp = NULL;

void plantfi_wifi_event_handler(int32_t event_id)
{
    if (event_id == WIFI_EVENT_STA_DISCONNECTED)
    {
        if (plantfi_retry_num < plantfi_max_retry)
        {
            esp_wifi_connect();
            plantfi_retry_num++;
            ESP_LOGI(PLANTFI_TAG, "retry to connect to the AP");
        }
        else
        {
            xEventGroupSetBits(plantfi_sta_event_group, PLANTFI_FAIL_BIT);
            plantfi_sta_status = PLANTFI_STA_STATUS_DISCONNECTED;
        }
        ESP_LOGI(PLANTFI_TAG, "connect to the AP fail");
    }
    else if (event_id == WIFI_EVENT_STA_CONNECTED)
    {
        ESP_LOGI(PLANTFI_TAG, "connect to the AP success");
        if (_credentialsChanged)
        {
            _credentialsChanged = false;
            plantstore_setWifiCredentials(plantfi_ssid, plantfi_password);
        }
        plantfi_sta_status = PLANTFI_STA_STATUS_CONNECTED;
    }
    else if (event_id == WIFI_EVENT_AP_STACONNECTED)
    {
        if (_userConnectedToAp != NULL)
        {
            *_userConnectedToAp = true;
        }
        ESP_LOGI(PLANTFI_TAG, "User connected to AP");
    }
    else
    {
        ESP_LOGI(PLANTFI_TAG, "No handler for event_id %ld", event_id);
    }
}

void plantfi_ip_event_handler(int32_t event_id, void *event_data)
{
    if (event_id == IP_EVENT_STA_GOT_IP)
    {
        ip_event_got_ip_t *event = (ip_event_got_ip_t *)event_data;
        ESP_LOGI(PLANTFI_TAG, "got ip:" IPSTR, IP2STR(&event->ip_info.ip));
        plantfi_retry_num = 0;
        xEventGroupSetBits(plantfi_sta_event_group, PLANTFI_CONNECTED_BIT);
    }
    else
    {
        ESP_LOGI(PLANTFI_TAG, "No handler for event_id %ld", event_id);
    }
}

void plantfi_event_handler(void *arg, esp_event_base_t event_base,
                           int32_t event_id, void *event_data)
{
    ESP_LOGI(PLANTFI_TAG, "Event dispatched from event loop base=%s, event_id=%ld", event_base, event_id);
    if (event_base == WIFI_EVENT)
    {
        plantfi_wifi_event_handler(event_id);
    }
    else if (event_base == IP_EVENT)
    {
        plantfi_ip_event_handler(event_id, event_data);
    }
}

void plantfi_initWifi(bool staOnly)
{
    ESP_ERROR_CHECK(esp_netif_init());
    ESP_ERROR_CHECK(esp_event_loop_create_default());
    esp_event_handler_instance_t instance_any_wifi_event;
    esp_event_handler_instance_t instance_any_ip_event;
    ESP_ERROR_CHECK(esp_event_handler_register(WIFI_EVENT, ESP_EVENT_ANY_ID, &plantfi_event_handler, &instance_any_wifi_event)); // TODO unregister event handlers on deinit
    ESP_ERROR_CHECK(esp_event_handler_register(IP_EVENT, ESP_EVENT_ANY_ID, &plantfi_event_handler, &instance_any_ip_event));

    esp_netif_create_default_wifi_sta();
    if (!staOnly)
    {
        esp_netif_create_default_wifi_ap();
    }

    // esp_wifi_set_max_tx_power(84); :D

    wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
    ESP_ERROR_CHECK(esp_wifi_init(&cfg));
    if (staOnly)
    {
        ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA));
    }
    else
    {
        ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_APSTA));
    }
    ESP_ERROR_CHECK(esp_wifi_start());

    plantfi_sta_event_group = xEventGroupCreate();
    plantfi_sta_status = PLANTFI_STA_STATUS_DISCONNECTED;
}

void plantfi_initWifiApSta()
{
    plantfi_initWifi(false);
}

void plantfi_initWifiStaOnly()
{
    plantfi_initWifi(true);
}

void plantfi_configureAp(const char *ssid, const char *password, int max_connection, bool *userConnectedToAp)
{
    ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_APSTA));
    wifi_config_t wifi_ap_config = {
        .ap = {
            .ssid = "",
            .password = "",
            .max_connection = max_connection,
        },
    };
    strcpy((char *)wifi_ap_config.ap.ssid, ssid);
    strcpy((char *)wifi_ap_config.ap.password, password);
    ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_AP, &wifi_ap_config));

    _userConnectedToAp = userConnectedToAp;
}

void plantfi_configureSta(const char *ssid, const char *password, int max_retry, bool credentialsChanged)
{
    _credentialsChanged = credentialsChanged;
    if (plantfi_sta_status == PLANTFI_STA_STATUS_CONNECTED)
    {
        ESP_LOGI(PLANTFI_TAG, "STA already enabled, disconnecting");
        esp_wifi_disconnect();
    }
    plantfi_sta_status = PLANTFI_STA_STATUS_PENDING;
    ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_APSTA));
    plantfi_max_retry = max_retry;
    xEventGroupClearBits(plantfi_sta_event_group, PLANTFI_CONNECTED_BIT | PLANTFI_FAIL_BIT | PLANTFI_PASSWORD_WRONG_BIT);

    wifi_config_t wifi_sta_config = {
        .sta = {
            .ssid = "",
            .password = "",
        },
    };
    if (ssid != NULL && password != NULL)
    {
        strcpy((char *)wifi_sta_config.sta.ssid, ssid);
        strcpy((char *)wifi_sta_config.sta.password, password);
        strcpy(plantfi_ssid, ssid);
        strcpy(plantfi_password, password);
    }
    ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_STA, &wifi_sta_config));
    if (ssid != NULL && password != NULL)
    {
        esp_wifi_connect();
    }
}

/**
 * @return true if wifi credentials were found
 */
bool plantfi_configureStaFromPlantstore()
{
    char ssid[DEFAULT_SSID_MAX_LENGTH];
    char password[DEFAULT_PASSWORD_MAX_LENGTH];
    if (plantstore_getWifiCredentials(ssid, password, sizeof(ssid), sizeof(password)))
    {
        ESP_LOGI(PLANTFI_TAG, "Wifi credentials found for %s", ssid);
        plantfi_configureSta(ssid, password, 3, false);
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
    if (plantfi_sta_status == PLANTFI_STA_STATUS_UNINITIALIZED)
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
    if (plantfi_sta_status != PLANTFI_STA_STATUS_CONNECTED)
    {
        ESP_LOGE(PLANTFI_TAG, "STA not connected");
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
 * @note The scan results are sorted by rssi in descending order. Should only be called when AP is already enabled
 */
void plantfi_scan_networks(plantfi_ap_record_t *ap_records, int *num_ap_records)
{
    if (plantfi_sta_status == PLANTFI_STA_STATUS_UNINITIALIZED)
    {
        ESP_LOGE(PLANTFI_TAG, "STA not initialized");
        return;
    }
    if (plantfi_sta_status == PLANTFI_STA_STATUS_PENDING)
    {
        plantfi_waitForStaConnection(NULL);
    }
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
    if (plantfi_sta_status == PLANTFI_STA_STATUS_UNINITIALIZED)
    {
        ESP_LOGE(PLANTFI_TAG, "STA not initialized");
        return PLANTFI_STA_STATUS_UNINITIALIZED;
    }
    if (plantfi_sta_status == PLANTFI_STA_STATUS_CONNECTED)
    {
        wifi_ap_record_t ap_info;
        esp_err_t err = esp_wifi_sta_get_ap_info(&ap_info);
        if (err != ESP_OK)
        {
            ESP_LOGE(PLANTFI_TAG, "Failed to get ap info");
            return PLANTFI_STA_STATUS_FAIL;
        }
    }
    return plantfi_sta_status;
}
