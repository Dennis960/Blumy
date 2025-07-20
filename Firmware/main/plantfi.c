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
#include "lwip/lwip_napt.h"

#include "plantstore.h"
#include "defaults.h"
#include "update.h"
#include "plantmqtt.h"
#include <esp_http_client.h>
#include "esp_timer.h"
#include <dhcpserver/dhcpserver.h>
#include <mqtt_client.h>

EventGroupHandle_t plantfi_sta_event_group;

const char *PLANTFI_TAG = "PLANTFI";

int plantfi_retry_num = 0;

int plantfi_max_retry;

plantfi_sta_status_t plantfi_sta_status = PLANTFI_STA_STATUS_UNINITIALIZED;

char plantfi_ssid[DEFAULT_SSID_MAX_LENGTH];
char plantfi_password[DEFAULT_PASSWORD_MAX_LENGTH];

bool _credentialsChanged = false;
bool _enableNatAndDnsOnConnect = false;
bool _isUserConnectedToAp = NULL;
bool _isStaConnected = false;
bool _isStaConnecting = false;
bool _is_manual_disconnect = false;

esp_netif_t *ap_netif;
esp_netif_t *sta_netif;

void plantfi_start_nat();

void plantfi_wifi_event_handler(int32_t event_id)
{
    if (event_id == WIFI_EVENT_STA_DISCONNECTED)
    {
        _isStaConnected = false;
        if (_is_manual_disconnect)
        {
            _is_manual_disconnect = false;
        }
        else
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
                _isStaConnecting = false;
            }
            ESP_LOGI(PLANTFI_TAG, "connect to the AP fail");
        }
    }
    else if (event_id == WIFI_EVENT_STA_CONNECTED)
    {
        _isStaConnected = true;
        _isStaConnecting = false;
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
        _isUserConnectedToAp = true;
        ESP_LOGI(PLANTFI_TAG, "User connected to AP");
    }
    else if (event_id == WIFI_EVENT_AP_STADISCONNECTED)
    {
        _isUserConnectedToAp = false;
        ESP_LOGI(PLANTFI_TAG, "User disconnected from AP");
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
        if (_enableNatAndDnsOnConnect)
        {
            ESP_ERROR_CHECK_WITHOUT_ABORT(esp_netif_napt_enable(ap_netif));
        }
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

void plantfi_initWifi()
{
    ESP_ERROR_CHECK(esp_netif_init());
    ESP_ERROR_CHECK(esp_event_loop_create_default());
    esp_event_handler_instance_t instance_any_wifi_event;
    esp_event_handler_instance_t instance_any_ip_event;
    ESP_ERROR_CHECK(esp_event_handler_register(WIFI_EVENT, ESP_EVENT_ANY_ID, &plantfi_event_handler, &instance_any_wifi_event)); // TODO unregister event handlers on deinit
    ESP_ERROR_CHECK(esp_event_handler_register(IP_EVENT, ESP_EVENT_ANY_ID, &plantfi_event_handler, &instance_any_ip_event));

    ap_netif = esp_netif_create_default_wifi_ap();
    sta_netif = esp_netif_create_default_wifi_sta();

    // esp_wifi_set_max_tx_power(84); :D

    wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
    ESP_ERROR_CHECK(esp_wifi_init(&cfg));
    esp_wifi_set_mode(WIFI_MODE_STA); // Always have STA mode enabled, so espnow works
    ESP_ERROR_CHECK(esp_wifi_start());

    plantfi_sta_event_group = xEventGroupCreate();
    plantfi_sta_status = PLANTFI_STA_STATUS_DISCONNECTED;
    plantfi_start_nat();
}

void plantfi_configureAp(const char *ssid, const char *password, int max_connection)
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
}

void plantfi_configureSta(const char *ssid, const char *password, int max_retry, bool credentialsChanged)
{
    wifi_mode_t mode;
    ESP_ERROR_CHECK(esp_wifi_get_mode(&mode));
    if (mode == WIFI_MODE_AP)
    {
        ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_APSTA));
    }
    _isStaConnecting = true;
    _credentialsChanged = credentialsChanged;
    if (plantfi_sta_status == PLANTFI_STA_STATUS_CONNECTED)
    {
        ESP_LOGI(PLANTFI_TAG, "STA already enabled, disconnecting");
        _is_manual_disconnect = true;
        esp_wifi_disconnect();
    }
    plantfi_sta_status = PLANTFI_STA_STATUS_PENDING;
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

void plantfi_setEnableNatAndDnsOnConnect(bool enableNatAndDnsOnConnect)
{
    _enableNatAndDnsOnConnect = enableNatAndDnsOnConnect;
}

void plantfi_start_nat()
{
    esp_netif_dns_info_t dnsserver;
    dnsserver.ip.u_addr.ip4.addr = ipaddr_addr("8.8.8.8");
    dnsserver.ip.type = ESP_IPADDR_TYPE_V4;
    esp_netif_set_dns_info(sta_netif, ESP_NETIF_DNS_MAIN, &dnsserver);

    // 2. Configure AP DHCP to offer DNS
    dhcps_offer_t dhcps_dns_value = OFFER_DNS;
    esp_netif_dhcps_stop(ap_netif);
    esp_netif_dhcps_option(ap_netif, ESP_NETIF_OP_SET, ESP_NETIF_DOMAIN_NAME_SERVER, &dhcps_dns_value, sizeof(dhcps_dns_value));
    esp_netif_dhcps_start(ap_netif);

    // 3. Copy the known-good DNS to the AP netif so DHCP uses it
    esp_netif_set_dns_info(ap_netif, ESP_NETIF_DNS_MAIN, &dnsserver);
    ESP_LOGI(PLANTFI_TAG, "Set AP DNS to: " IPSTR, IP2STR(&(dnsserver.ip.u_addr.ip4)));
    ESP_LOGI(PLANTFI_TAG, "Starting NAT");
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

    // Remove duplicate SSIDs, keep the one with the strongest RSSI
    int unique_count = 0;
    for (int i = 0; i < ap_num; i++)
    {
        bool duplicate = false;
        for (int j = 0; j < unique_count; j++)
        {
            if (strcmp((char *)ap_list[i].ssid, (char *)ap_list[j].ssid) == 0)
            {
                duplicate = true;
                break;
            }
        }
        if (!duplicate)
        {
            // Move unique record to the front
            if (unique_count != i)
            {
                ap_list[unique_count] = ap_list[i];
            }
            unique_count++;
        }
    }

    if (unique_count > *num_ap_records)
    {
        unique_count = *num_ap_records;
    }

    for (int i = 0; i < unique_count; i++)
    {
        ap_records[i].rssi = ap_list[i].rssi;
        strcpy(ap_records[i].ssid, (char *)ap_list[i].ssid);
        ap_records[i].secure = ap_list[i].authmode;
    }

    free(ap_list);
    *num_ap_records = unique_count;
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

bool plantfi_is_sta_connected()
{
    return _isStaConnected;
}

bool plantfi_is_user_connected_to_ap()
{
    return _isUserConnectedToAp;
}

bool plantfi_is_sta_connecting()
{
    return _isStaConnecting;
}

/**
 * Optionally pass a sensorId or NULL
 */
void plantfi_create_sensor_data_json(char *data, sensors_full_data_t *sensors_data, int8_t rssi, const char *sensorId)
{
    const uint64_t firmware_version = FIRMWARE_VERSION;
    if (sensorId != NULL)
    {
        sprintf(data, "{\"firmwareVersion\":\"%llu\",\"sensorId\":\"%s\",\"light\":%2.2f,\"voltage\":%.2f,\"temperature\":%.2f,\"humidity\":%.2f,\"moisture\":%d,\"moistureStabilizationTime\":%lu,\"isMoistureMeasurementSuccessful\":%s,\"humidityRaw\":%lu,\"temperatureRaw\":%lu,\"rssi\":%d,\"duration\":%lld}",
                firmware_version,
                sensorId,
                sensors_data->light,
                sensors_data->voltage,
                sensors_data->temperature,
                sensors_data->humidity,
                sensors_data->moisture_measurement,
                sensors_data->moisture_stabilization_time,
                sensors_data->moisture_measurement_successful ? "true" : "false",
                sensors_data->humidity_raw,
                sensors_data->temperature_raw,
                rssi,
                esp_timer_get_time());
    }
    else
    {
        sprintf(data, "{\"firmwareVersion\":\"%llu\",\"light\":%2.2f,\"voltage\":%.2f,\"temperature\":%.2f,\"humidity\":%.2f,\"moisture\":%d,\"moistureStabilizationTime\":%lu,\"isMoistureMeasurementSuccessful\":%s,\"humidityRaw\":%lu,\"temperatureRaw\":%lu,\"rssi\":%d,\"duration\":%lld}",
                firmware_version,
                sensors_data->light,
                sensors_data->voltage,
                sensors_data->temperature,
                sensors_data->humidity,
                sensors_data->moisture_measurement,
                sensors_data->moisture_stabilization_time,
                sensors_data->moisture_measurement_successful ? "true" : "false",
                sensors_data->humidity_raw,
                sensors_data->temperature_raw,
                rssi,
                esp_timer_get_time());
    }
}

/**
 * Returns the status code
 */
int plantfi_post_http(const char *url, const char *data, const char *authHeader)
{
    esp_http_client_config_t config = {
        .url = url,
        .method = HTTP_METHOD_POST,
    };

    esp_http_client_handle_t client = esp_http_client_init(&config);
    if (client == NULL)
    {
        ESP_LOGE("HTTP", "Failed to initialize HTTP client");
        return 0;
    }
    ESP_ERROR_CHECK(esp_http_client_set_post_field(client, data, strlen(data)));
    ESP_ERROR_CHECK(esp_http_client_set_header(client, "Content-Type", "application/json"));
    ESP_ERROR_CHECK(esp_http_client_set_header(client, "Authorization", authHeader));
    ESP_ERROR_CHECK(esp_http_client_perform(client));

    ESP_LOGI("Data", "%s", data);
    int status_code = esp_http_client_get_status_code(client);
    ESP_LOGI("HTTP", "Status Code: %d", status_code);
    ESP_ERROR_CHECK(esp_http_client_cleanup(client));
    return status_code;
}

int plantfi_get_http(char *url, char *authHeader)
{
    esp_http_client_config_t config = {
        .url = url,
        .method = HTTP_METHOD_GET,
    };

    esp_http_client_handle_t client = esp_http_client_init(&config);
    if (client == NULL)
    {
        ESP_LOGE("HTTP", "Failed to initialize HTTP client");
        return 500;
    }
    ESP_ERROR_CHECK(esp_http_client_set_header(client, "Authorization", authHeader));
    esp_err_t err = esp_http_client_perform(client);
    if (err != ESP_OK)
    {
        ESP_LOGE("HTTP", "Failed to perform HTTP request (%s)", esp_err_to_name(err));
        ESP_ERROR_CHECK_WITHOUT_ABORT(esp_http_client_cleanup(client));
        return 500;
    }

    int status_code = esp_http_client_get_status_code(client);
    ESP_LOGI("HTTP", "Status Code: %d", status_code);
    ESP_ERROR_CHECK(esp_http_client_cleanup(client));
    return status_code;
}

esp_mqtt_client_handle_t plantfi_init_mqtt_client()
{
    char server[100];
    uint32_t port;
    char username[100];
    char password[100];
    char clientId[100];
    if (!plantstore_getCloudConfigurationMqtt(NULL, server, &port, username, password, NULL, clientId, 0, sizeof(server), sizeof(username), sizeof(password), 0, sizeof(clientId)))
    {
        ESP_LOGE(PLANTFI_TAG, "No MQTT configuration found");
        return NULL;
    }

    const esp_mqtt_client_config_t mqtt_cfg = {
        .broker.address.uri = server,
        .broker.address.port = port,
        .credentials.username = username,
        .credentials.authentication.password = password,
        .credentials.client_id = clientId,
    };

    esp_mqtt_client_handle_t client = esp_mqtt_client_init(&mqtt_cfg);
    return client;
}

int plantfi_send_sensor_data_blumy(sensors_full_data_t *sensors_data, int8_t rssi)
{
    char token[50];
    char url[100];
    if (!plantstore_getCloudConfigurationBlumy(token, url, sizeof(token), sizeof(url)))
    {
        ESP_LOGE(PLANTFI_TAG, "No Blumy configuration found");
        return 0;
    }
    char authHeader[60];
    sprintf(authHeader, "Bearer %s", token);

    char data[400];
    plantfi_create_sensor_data_json(data, sensors_data, rssi, NULL);

    return plantfi_post_http(url, data, authHeader);
}

bool plantfi_test_blumy_connection(char *token, char *url)
{
    char bearer[60];
    sprintf(bearer, "Bearer %s", token);
    int status_code = plantfi_get_http(url, bearer);
    return status_code == 200;
}

void plantfi_send_sensor_data_http(sensors_full_data_t *sensors_data, int8_t rssi)
{
    char sensorId[100];
    char url[100];
    char auth[60];
    if (!plantstore_getCloudConfigurationHttp(sensorId, url, auth, sizeof(sensorId), sizeof(url), sizeof(auth)))
    {
        ESP_LOGE(PLANTFI_TAG, "No HTTP configuration found");
        return;
    }

    char data[400];
    plantfi_create_sensor_data_json(data, sensors_data, rssi, sensorId);

    plantfi_post_http(url, data, auth);
}

bool plantfi_test_http_connection(char *sensorId, char *url, char *auth)
{
    int status_code = plantfi_get_http(url, auth);
    return status_code == 200;
}

void plantfi_send_sensor_data_mqtt(sensors_full_data_t *sensors_data, int8_t rssi)
{
    plantmqtt_homeassistant_publish_sensor_data(sensors_data, rssi);
}

bool plantfi_test_mqtt_connection(char *sensorId, char *server, uint32_t port, char *username, char *password, char *topic, char *clientId)
{
    return plantmqtt_test_connection(sensorId, server, port, username, password, topic, clientId);
}

bool plantfi_found_blumy_network()
{
    ESP_LOGI(PLANTFI_TAG, "Searching for Blumy network");
    if (plantfi_sta_status == PLANTFI_STA_STATUS_UNINITIALIZED)
    {
        ESP_LOGE(PLANTFI_TAG, "STA not initialized");
        return false;
    }
    if (plantfi_sta_status == PLANTFI_STA_STATUS_PENDING)
    {
        plantfi_waitForStaConnection(NULL);
    }
    wifi_scan_config_t scan_config = {
        .ssid = (uint8_t *)DEFAULT_SSID_BLUMY,
        .bssid = NULL,
        .channel = 1, // Scan only channel 1, which is the default channel for Blumy
        .scan_type = WIFI_SCAN_TYPE_ACTIVE,
        .scan_time = {
            .active = {
                .min = 10,
                .max = 200,
            },
        },
    };
    ESP_ERROR_CHECK(esp_wifi_scan_start(&scan_config, true));
    uint16_t ap_num = 0;
    ESP_ERROR_CHECK(esp_wifi_scan_get_ap_num(&ap_num));
    if (ap_num == 0)
    {
        ESP_LOGI(PLANTFI_TAG, "No Blumy network found");
        return false;
    }
    ESP_LOGI(PLANTFI_TAG, "Blumy network found");
    return true;
}
