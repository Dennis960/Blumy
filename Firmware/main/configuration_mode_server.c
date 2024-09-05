#include "configuration_mode_server.h"

#include "esp_log.h"
#include "esp_https_server.h"
#include "cJSON.h"

#include "plantfi.h"
#include "plantstore.h"
#include "peripherals/sensors.h"
#include "defaults.h"

#include "esp_https_ota.h"

#include "index_html.c"

float ota_update_percentage = -1;

// Returns the index_html from index_html.c
esp_err_t get_handler(httpd_req_t *req)
{
    httpd_resp_set_type(req, "text/html");
    httpd_resp_send(req, index_html, sizeof(index_html));
    return ESP_OK;
}

bool get_value(char *content, char *key, char *value)
{
    // Request bodies are in the form of key=value\nkey2=value2\n
    char *key_start = strstr(content, key);
    if (key_start == NULL)
    {
        return false;
    }
    key_start += strlen(key) + 1;
    char *key_end = strstr(key_start, "\n");
    if (key_end == NULL)
    {
        return false;
    }
    strncpy(value, key_start, key_end - key_start);
    value[key_end - key_start] = '\0';
    return true;
}

bool get_values(httpd_req_t *req, char *keys[], char *values[], int num_keys)
{
    char content[1000];
    size_t recv_size = MIN(req->content_len, sizeof(content));
    int ret = httpd_req_recv(req, content, recv_size);
    if (ret <= 0)
    {
        if (ret == HTTPD_SOCK_ERR_TIMEOUT)
        {
            httpd_resp_send_408(req);
        }
        return false;
    }
    for (int i = 0; i < num_keys; i++)
    {
        if (!get_value(content, keys[i], values[i]))
        {
            return false;
        }
    }
    return true;
}

bool get_single_value(httpd_req_t *req, char *value)
{
    // The entire request body is the value, there is no key and no newline
    size_t recv_size = MIN(req->content_len, 1000);
    int ret = httpd_req_recv(req, value, recv_size);
    if (ret <= 0)
    {
        if (ret == HTTPD_SOCK_ERR_TIMEOUT)
        {
            httpd_resp_send_408(req);
        }
        return false;
    }
    return true;
}

bool is_number(char *content)
{
    for (int i = 0; i < strlen(content); i++)
    {
        if (content[i] < '0' || content[i] > '9')
        {
            return false;
        }
    }
    return true;
}

esp_err_t post_api_connect_handler(httpd_req_t *req)
{
    char ssid[DEFAULT_SSID_MAX_LENGTH];
    char password[DEFAULT_PASSWORD_MAX_LENGTH];
    char *keys[] = {"ssid", "password"};
    char *values[] = {ssid, password};
    if (!get_values(req, keys, values, 2))
    {
        return ESP_FAIL;
    }

    const char resp[] = "OK";
    httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);

    plantfi_configureSta(ssid, password, 5, true);
    return ESP_OK;
}

esp_err_t post_api_reset_handler(httpd_req_t *req)
{
    const char resp[] = "OK";
    httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);

    sensors_playShutdownSound();
    esp_restart();
    return ESP_OK;
}

esp_err_t get_api_networks_handler(httpd_req_t *req)
{
    plantfi_ap_record_t ap_records[20];
    int num_ap_records = 20;
    plantfi_scan_networks(ap_records, &num_ap_records);

    cJSON *root = cJSON_CreateArray();
    for (int i = 0; i < num_ap_records; i++)
    {
        cJSON *ap = cJSON_CreateObject();
        cJSON_AddNumberToObject(ap, "rssi", ap_records[i].rssi);
        cJSON_AddStringToObject(ap, "ssid", ap_records[i].ssid);
        cJSON_AddNumberToObject(ap, "secure", ap_records[i].secure);
        cJSON_AddItemToArray(root, ap);
    }

    char *resp = cJSON_Print(root);
    cJSON_Delete(root);

    httpd_resp_set_type(req, "application/json");
    httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);
    free(resp);
    return ESP_OK;
}

esp_err_t get_api_isConnected_handler(httpd_req_t *req)
{
    plantfi_sta_status_t status = plantfi_get_sta_status();
    char resp[2];
    sprintf(resp, "%d", status);
    httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);
    return ESP_OK;
}

esp_err_t post_api_cloudSetup_mqtt_handler(httpd_req_t *req)
{
    char sensorId[100];
    char server[100];
    char portString[10];
    char username[100];
    char password[100];
    char topic[100];
    char clientId[100];
    char *keys[] = {"sensorId", "server", "port", "username", "password", "topic", "clientId"};
    char *values[] = {sensorId, server, portString, username, password, topic, clientId};
    if (!get_values(req, keys, values, 6) || !is_number(portString))
    {
        return ESP_FAIL;
    }

    int16_t port = atoi(portString);

    plantstore_setCloudConfigurationMqtt(sensorId, server, port, username, password, topic, clientId);

    const char resp[] = "OK";
    httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);
    return ESP_OK;
}

esp_err_t post_api_cloudSetup_http_handler(httpd_req_t *req)
{
    char sensorId[100];
    char url[100];
    char auth[100];
    char *keys[] = {"sensorId", "url", "auth"};
    char *values[] = {sensorId, url, auth};
    if (!get_values(req, keys, values, 2))
    {
        return ESP_FAIL;
    }

    plantstore_setCloudConfigurationHttp(sensorId, url, auth);

    const char resp[] = "OK";
    httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);
    return ESP_OK;
}

esp_err_t post_api_cloudSetup_blumy_handler(httpd_req_t *req)
{
    char token[100];
    char url[100];
    char *keys[] = {"token", "url"};
    char *values[] = {token, url};
    if (!get_values(req, keys, values, 2))
    {
        return ESP_FAIL;
    }

    plantstore_setCloudConfigurationBlumy(token, url);

    const char resp[] = "OK";
    httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
    httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);
    return ESP_OK;
}

esp_err_t get_api_cloudSetup_mqtt_handler(httpd_req_t *req)
{
    char sensorId[100];
    char server[100];
    int16_t port;
    char username[100];
    char password[100];
    char topic[100];
    char clientId[100];

    if (!plantstore_getCloudConfigurationMqtt(sensorId, server, &port, username, password, topic, clientId, sizeof(sensorId), sizeof(server), sizeof(username), sizeof(password), sizeof(topic), sizeof(clientId)))
    {
        httpd_resp_send_404(req);
        return ESP_FAIL;
    }

    cJSON *root = cJSON_CreateObject();
    cJSON_AddStringToObject(root, "server", server);
    cJSON_AddNumberToObject(root, "port", port);
    cJSON_AddStringToObject(root, "username", username);
    cJSON_AddStringToObject(root, "password", password);
    cJSON_AddStringToObject(root, "topic", topic);
    cJSON_AddStringToObject(root, "clientId", clientId);

    char *resp = cJSON_Print(root);
    cJSON_Delete(root);

    httpd_resp_set_type(req, "application/json");
    httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);
    free(resp);
    return ESP_OK;
}

esp_err_t get_api_cloudSetup_http_handler(httpd_req_t *req)
{
    char sensorId[100];
    char url[100];
    char auth[100];

    if (!plantstore_getCloudConfigurationHttp(sensorId, url, auth, sizeof(sensorId), sizeof(url), sizeof(auth)))
    {
        httpd_resp_send_404(req);
        return ESP_FAIL;
    }

    cJSON *root = cJSON_CreateObject();
    cJSON_AddStringToObject(root, "sensorId", sensorId);
    cJSON_AddStringToObject(root, "url", url);
    cJSON_AddStringToObject(root, "auth", auth);

    char *resp = cJSON_Print(root);
    cJSON_Delete(root);

    httpd_resp_set_type(req, "application/json");
    httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);
    free(resp);
    return ESP_OK;
}

esp_err_t get_api_cloudSetup_blumy_handler(httpd_req_t *req)
{
    char token[100] = "";
    char url[100] = DEFAULT_API_URL;

    plantstore_getCloudConfigurationBlumy(token, url, sizeof(token), sizeof(url));

    cJSON *root = cJSON_CreateObject();
    cJSON_AddStringToObject(root, "token", token);
    cJSON_AddStringToObject(root, "url", url);

    char *resp = cJSON_Print(root);
    cJSON_Delete(root);

    httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
    httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);
    free(resp);
    return ESP_OK;
}

esp_err_t post_api_cloudTest_mqtt_handler(httpd_req_t *req)
{
    // TODO implement this check
    const char resp[] = "false";
    httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);
    return ESP_OK;
}
esp_err_t post_api_cloudTest_http_handler(httpd_req_t *req)
{
    // TODO implement this check
    const char resp[] = "false";
    httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);
    return ESP_OK;
}
esp_err_t post_api_cloudTest_blumy_handler(httpd_req_t *req)
{
    char token[100];
    char url[100];
    char *keys[] = {"token", "url"};
    char *values[] = {token, url};
    if (!get_values(req, keys, values, 2))
    {
        return ESP_FAIL;
    }

    const bool connectionOk = plantfi_test_blumy_connection(token, url);
    char resp[6];
    sprintf(resp, "%s", connectionOk ? "true" : "false");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
    httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);
    return ESP_OK;
}

esp_err_t post_api_timeouts_sleep_handler(httpd_req_t *req)
{
    char timoutString[10];
    if (!get_single_value(req, timoutString) || !is_number(timoutString))
    {
        return ESP_FAIL;
    }

    int32_t timeout;
    sscanf(timoutString, "%ld", &timeout);

    plantstore_setSensorTimeoutSleepMs(timeout);

    const char resp[] = "OK";
    httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);
    return ESP_OK;
}

esp_err_t get_api_timeouts_sleep_handler(httpd_req_t *req)
{
    uint64_t timeout = DEFAULT_SENSOR_TIMEOUT_SLEEP_MS;
    plantstore_getSensorTimeoutSleepMs(&timeout);

    char resp[15];
    sprintf(resp, "%llu", timeout);
    httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);
    return ESP_OK;
}

esp_err_t get_api_timeouts_configurationMode_handler(httpd_req_t *req)
{
    int32_t timeout = DEFAULT_CONFIGURATION_MODE_TIMEOUT_MS;
    plantstore_getConfigurationModeTimeoutMs(&timeout);

    char resp[15];
    sprintf(resp, "%ld", timeout);
    httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);
    return ESP_OK;
}

esp_err_t post_api_timeouts_configurationMode_handler(httpd_req_t *req)
{
    char timoutString[10];
    if (!get_single_value(req, timoutString) || !is_number(timoutString))
    {
        return ESP_FAIL;
    }

    int32_t timeout;
    sscanf(timoutString, "%ld", &timeout);

    plantstore_setConfigurationModeTimeoutMs(timeout);

    const char resp[] = "OK";
    httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);
    return ESP_OK;
}

esp_err_t get_api_timeouts_wdt_handler(httpd_req_t *req)
{
    uint64_t timeout = DEFAULT_WATCHDOG_TIMEOUT_MS;
    plantstore_getWatchdogTimeoutMs(&timeout);

    char resp[15];
    sprintf(resp, "%llu", timeout);
    httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);
    return ESP_OK;
}

esp_err_t post_api_timeouts_wdt_handler(httpd_req_t *req)
{
    char timoutString[10];
    if (!get_single_value(req, timoutString) || !is_number(timoutString))
    {
        return ESP_FAIL;
    }

    uint64_t timeout;
    sscanf(timoutString, "%llu", &timeout);

    plantstore_setWatchdogTimeoutMs(timeout);

    const char resp[] = "OK";
    httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);
    return ESP_OK;
}

esp_err_t get_api_update_percentage_handler(httpd_req_t *req)
{
    char resp[10];
    sprintf(resp, "%.2f", ota_update_percentage);
    httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);
    return ESP_OK;
}

esp_err_t get_api_connectedNetwork_handler(httpd_req_t *req)
{
    char ssid[DEFAULT_SSID_MAX_LENGTH];
    char password[DEFAULT_PASSWORD_MAX_LENGTH];

    if (!plantstore_getWifiCredentials(ssid, password, sizeof(ssid), sizeof(password)))
    {
        httpd_resp_send_404(req);
        return ESP_FAIL;
    }
    plantfi_sta_status_t status = plantfi_get_sta_status();
    int8_t rssi = plantfi_getRssi();

    cJSON *root = cJSON_CreateObject();
    cJSON_AddStringToObject(root, "ssid", ssid);
    // cJSON_AddStringToObject(root, "password", password);
    cJSON_AddNumberToObject(root, "status", status);
    cJSON_AddNumberToObject(root, "rssi", rssi);

    char *resp = cJSON_Print(root);
    cJSON_Delete(root);

    httpd_resp_set_type(req, "application/json");
    httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);
    free(resp);
    return ESP_OK;
}

esp_err_t get_api_sensor_data_handler(httpd_req_t *req)
{
    sensors_full_data_t sensors_data;
    sensors_full_read(&sensors_data);

    cJSON *root = cJSON_CreateObject();
    cJSON_AddNumberToObject(root, "temperature", sensors_data.temperature);
    cJSON_AddNumberToObject(root, "humidity", sensors_data.humidity);
    cJSON_AddNumberToObject(root, "light", sensors_data.light);
    cJSON_AddNumberToObject(root, "moisture", sensors_data.moisture_measurement);
    cJSON_AddNumberToObject(root, "voltage", sensors_data.voltage);
    cJSON_AddBoolToObject(root, "usb", sensors_data.is_usb_connected);

    char *resp = cJSON_Print(root);
    cJSON_Delete(root);

    httpd_resp_set_type(req, "application/json");
    httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);
    free(resp);
    return ESP_OK;
}

esp_err_t post_api_factoryReset_handler(httpd_req_t *req)
{
    plantstore_factoryReset();

    const char resp[] = "OK";
    httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);

    esp_restart();
    return ESP_OK;
}

void ota_update_task(void *pvParameter)
{
    char url[100];
    if (!plantstore_getFirmwareUpdateUrl(url, 100))
    {
        ESP_LOGE("OTA", "No firmware update URL set");
        vTaskDelete(NULL);
        return;
    }

    esp_http_client_config_t config = {
        .url = url,
        .cert_pem = NULL,
        .timeout_ms = 10000,
    };
    esp_https_ota_config_t ota_config = {
        .http_config = &config,
        .http_client_init_cb = NULL,
    };
    esp_https_ota_handle_t handle = NULL;
    esp_err_t err = esp_https_ota_begin(&ota_config, &handle);
    if (err != ESP_OK)
    {
        ESP_LOGE("OTA", "Failed to start OTA (%s)", esp_err_to_name(err));
        vTaskDelete(NULL);
        return;
    }

    int otaImageSize = esp_https_ota_get_image_size(handle);
    if (otaImageSize < 0)
    {
        ESP_LOGE("OTA", "Failed to get image size (%d)", otaImageSize);
        esp_https_ota_abort(handle);
        vTaskDelete(NULL);
        return;
    }
    while (1)
    {
        err = esp_https_ota_perform(handle);
        int otaImageLenRead = esp_https_ota_get_image_len_read(handle);
        ota_update_percentage = (float)otaImageLenRead / otaImageSize * 100;
        if (err == ESP_ERR_HTTPS_OTA_IN_PROGRESS)
        {
            continue;
        }
        if (err == ESP_OK)
        {
            break;
        }
        else
        {
            ESP_LOGE("OTA", "Failed to perform OTA (%s)", esp_err_to_name(err));
            esp_https_ota_abort(handle);
            vTaskDelete(NULL);
            return;
        }
    }
    err = esp_https_ota_finish(handle);
    if (err != ESP_OK)
    {
        ESP_LOGE("OTA", "Failed to finish OTA (%s)", esp_err_to_name(err));
        vTaskDelete(NULL);
        return;
    }

    ESP_LOGI("OTA", "OTA finished, restarting");
    plantstore_setResetReasonOta(true);
    esp_restart();
    vTaskDelete(NULL);
}

esp_err_t post_api_update_firmware_handler(httpd_req_t *req)
{
    char url[100];
    char *keys[] = {"url"};
    char *values[] = {url};
    if (!get_values(req, keys, values, 1))
    {
        return ESP_FAIL;
    }

    plantstore_setFirmwareUpdateUrl(url);

    const char resp[] = "OK";
    httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);
    xTaskCreate(ota_update_task, "ota_update_task", 8192, NULL, 5, NULL);
    return ESP_OK;
}

esp_err_t get_api_update_firmware_handler(httpd_req_t *req)
{
    char url[100];
    if (!plantstore_getFirmwareUpdateUrl(url, sizeof(url)))
    {
        httpd_resp_send_404(req);
        return ESP_FAIL;
    }

    cJSON *root = cJSON_CreateObject();
    cJSON_AddStringToObject(root, "url", url);

    char *resp = cJSON_Print(root);
    cJSON_Delete(root);

    httpd_resp_set_type(req, "application/json");
    httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);
    free(resp);
    return ESP_OK;
}

esp_err_t post_api_update_check_handler(httpd_req_t *req)
{
    char url[100];
    char *keys[] = {"url"};
    char *values[] = {url};
    if (!get_values(req, keys, values, 1))
    {
        return ESP_FAIL;
    }

    esp_http_client_config_t config = {
        .url = url,
        .method = HTTP_METHOD_HEAD,
        .timeout_ms = 10000,
        .cert_pem = NULL,
    };
    esp_http_client_handle_t client = esp_http_client_init(&config);
    if (client == NULL)
    {
        ESP_LOGE("HTTP", "Failed to initialize HTTP client");
        return ESP_FAIL;
    }
    esp_err_t err = esp_http_client_perform(client);
    if (err != ESP_OK)
    {
        ESP_LOGE("HTTP", "Failed to perform HTTP request (%s)", esp_err_to_name(err));
        return err;
    }
    int status_code = esp_http_client_get_status_code(client);
    int content_length = esp_http_client_get_content_length(client);
    ESP_LOGI("HTTP", "Status code: %d, Content length: %d", status_code, content_length);

    char resp[6];
    sprintf(resp, "%s", status_code == 200 ? "true" : "false");
    httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);

    esp_http_client_cleanup(client);
    return ESP_OK;
}

httpd_uri_t post_api_connect = {
    .uri = "/api/connect",
    .method = HTTP_POST,
    .handler = post_api_connect_handler,
    .user_ctx = NULL};

httpd_uri_t post_api_reset = {
    .uri = "/api/reset",
    .method = HTTP_POST,
    .handler = post_api_reset_handler,
    .user_ctx = NULL};

httpd_uri_t get_api_networks = {
    .uri = "/api/networks",
    .method = HTTP_GET,
    .handler = get_api_networks_handler,
    .user_ctx = NULL};

httpd_uri_t get_api_isConnected = {
    .uri = "/api/isConnected",
    .method = HTTP_GET,
    .handler = get_api_isConnected_handler,
    .user_ctx = NULL};

httpd_uri_t post_api_cloudSetup_mqtt = {
    .uri = "/api/cloudSetup/mqtt",
    .method = HTTP_POST,
    .handler = post_api_cloudSetup_mqtt_handler,
    .user_ctx = NULL};
httpd_uri_t post_api_cloudSetup_http = {
    .uri = "/api/cloudSetup/http",
    .method = HTTP_POST,
    .handler = post_api_cloudSetup_http_handler,
    .user_ctx = NULL};
httpd_uri_t post_api_cloudSetup_blumy = {
    .uri = "/api/cloudSetup/blumy",
    .method = HTTP_POST,
    .handler = post_api_cloudSetup_blumy_handler,
    .user_ctx = NULL};

httpd_uri_t get_api_cloudSetup_mqtt = {
    .uri = "/api/cloudSetup/mqtt",
    .method = HTTP_GET,
    .handler = get_api_cloudSetup_mqtt_handler,
    .user_ctx = NULL};
httpd_uri_t get_api_cloudSetup_http = {
    .uri = "/api/cloudSetup/http",
    .method = HTTP_GET,
    .handler = get_api_cloudSetup_http_handler,
    .user_ctx = NULL};
httpd_uri_t get_api_cloudSetup_blumy = {
    .uri = "/api/cloudSetup/blumy",
    .method = HTTP_GET,
    .handler = get_api_cloudSetup_blumy_handler,
    .user_ctx = NULL};

httpd_uri_t post_api_cloudTest_mqtt = {
    .uri = "/api/cloudTest/mqtt",
    .method = HTTP_POST,
    .handler = post_api_cloudTest_mqtt_handler,
    .user_ctx = NULL};
httpd_uri_t post_api_cloudTest_http = {
    .uri = "/api/cloudTest/http",
    .method = HTTP_POST,
    .handler = post_api_cloudTest_http_handler,
    .user_ctx = NULL};
httpd_uri_t post_api_cloudTest_blumy = {
    .uri = "/api/cloudTest/blumy",
    .method = HTTP_POST,
    .handler = post_api_cloudTest_blumy_handler,
    .user_ctx = NULL};

httpd_uri_t post_api_timeouts_sleep = {
    .uri = "/api/timeouts/sleep",
    .method = HTTP_POST,
    .handler = post_api_timeouts_sleep_handler,
    .user_ctx = NULL};

httpd_uri_t get_api_timeouts_sleep = {
    .uri = "/api/timeouts/sleep",
    .method = HTTP_GET,
    .handler = get_api_timeouts_sleep_handler,
    .user_ctx = NULL};

httpd_uri_t get_api_update_percentage = {
    .uri = "/api/update/percentage",
    .method = HTTP_GET,
    .handler = get_api_update_percentage_handler,
    .user_ctx = NULL};

httpd_uri_t get_api_connectedNetwork = {
    .uri = "/api/connectedNetwork",
    .method = HTTP_GET,
    .handler = get_api_connectedNetwork_handler,
    .user_ctx = NULL};

httpd_uri_t get_api_sensorData = {
    .uri = "/api/sensor/data",
    .method = HTTP_GET,
    .handler = get_api_sensor_data_handler,
    .user_ctx = NULL};

httpd_uri_t post_api_factoryReset = {
    .uri = "/api/factoryReset",
    .method = HTTP_POST,
    .handler = post_api_factoryReset_handler,
    .user_ctx = NULL};

httpd_uri_t get_api_timeouts_configurationMode = {
    .uri = "/api/timeouts/configurationMode",
    .method = HTTP_GET,
    .handler = get_api_timeouts_configurationMode_handler,
    .user_ctx = NULL};

httpd_uri_t post_api_timeouts_configurationMode = {
    .uri = "/api/timeouts/configurationMode",
    .method = HTTP_POST,
    .handler = post_api_timeouts_configurationMode_handler,
    .user_ctx = NULL};

httpd_uri_t get_api_timeouts_wdt = {
    .uri = "/api/timeouts/wdt",
    .method = HTTP_GET,
    .handler = get_api_timeouts_wdt_handler,
    .user_ctx = NULL};

httpd_uri_t post_api_timeouts_wdt = {
    .uri = "/api/timeouts/wdt",
    .method = HTTP_POST,
    .handler = post_api_timeouts_wdt_handler,
    .user_ctx = NULL};

httpd_uri_t post_api_update_firmware = {
    .uri = "/api/update/firmware",
    .method = HTTP_POST,
    .handler = post_api_update_firmware_handler,
    .user_ctx = NULL};

httpd_uri_t get_api_update_firmware = {
    .uri = "/api/update/firmware",
    .method = HTTP_GET,
    .handler = get_api_update_firmware_handler,
    .user_ctx = NULL};

httpd_uri_t post_api_update_check = {
    .uri = "/api/update/check",
    .method = HTTP_POST,
    .handler = post_api_update_check_handler,
    .user_ctx = NULL};

httpd_uri_t get = {
    .uri = "*",
    .method = HTTP_GET,
    .handler = get_handler,
    .user_ctx = NULL};

void register_uri_handlers(httpd_handle_t server)
{
    httpd_register_uri_handler(server, &post_api_connect);
    httpd_register_uri_handler(server, &post_api_reset);
    httpd_register_uri_handler(server, &get_api_networks);
    httpd_register_uri_handler(server, &get_api_isConnected);
    httpd_register_uri_handler(server, &post_api_cloudSetup_mqtt);
    httpd_register_uri_handler(server, &post_api_cloudSetup_http);
    httpd_register_uri_handler(server, &post_api_cloudSetup_blumy);
    httpd_register_uri_handler(server, &get_api_cloudSetup_mqtt);
    httpd_register_uri_handler(server, &get_api_cloudSetup_http);
    httpd_register_uri_handler(server, &get_api_cloudSetup_blumy);
    httpd_register_uri_handler(server, &post_api_cloudTest_mqtt);
    httpd_register_uri_handler(server, &post_api_cloudTest_http);
    httpd_register_uri_handler(server, &post_api_cloudTest_blumy);
    httpd_register_uri_handler(server, &post_api_timeouts_sleep);
    httpd_register_uri_handler(server, &get_api_timeouts_sleep);
    httpd_register_uri_handler(server, &get_api_timeouts_configurationMode);
    httpd_register_uri_handler(server, &post_api_timeouts_configurationMode);
    httpd_register_uri_handler(server, &get_api_timeouts_wdt);
    httpd_register_uri_handler(server, &post_api_timeouts_wdt);
    httpd_register_uri_handler(server, &get_api_update_percentage);
    httpd_register_uri_handler(server, &get_api_connectedNetwork);
    httpd_register_uri_handler(server, &get_api_sensorData);
    httpd_register_uri_handler(server, &post_api_factoryReset);
    httpd_register_uri_handler(server, &post_api_update_firmware);
    httpd_register_uri_handler(server, &get_api_update_firmware);
    httpd_register_uri_handler(server, &post_api_update_check);

    // Every other get request returns index.html
    httpd_register_uri_handler(server, &get);
}

/* Function for starting the webserver */
httpd_handle_t start_https_webserver(void)
{
    ESP_LOGI("HTTP", "Starting HTTPS server");
    /* Empty handle to esp_http_server */
    httpd_handle_t server = NULL;

    /* Generate default configuration */
    httpd_ssl_config_t config = HTTPD_SSL_CONFIG_DEFAULT();
    config.httpd.uri_match_fn = httpd_uri_match_wildcard;
    config.httpd.max_uri_handlers = 50;

    extern const unsigned char servercert_start[] asm("_binary_servercert_pem_start");
    extern const unsigned char servercert_end[] asm("_binary_servercert_pem_end");
    config.servercert = servercert_start;
    config.servercert_len = servercert_end - servercert_start;

    extern const unsigned char prvtkey_pem_start[] asm("_binary_prvtkey_pem_start");
    extern const unsigned char prvtkey_pem_end[] asm("_binary_prvtkey_pem_end");
    config.prvtkey_pem = prvtkey_pem_start;
    config.prvtkey_len = prvtkey_pem_end - prvtkey_pem_start;

    /* Start the httpd server */
    ESP_ERROR_CHECK(httpd_ssl_start(&server, &config));
    register_uri_handlers(server);
    /* If server failed to start, handle will be NULL */
    return server;
}

httpd_handle_t start_webserver(void)
{
    ESP_LOGI("HTTP", "Starting HTTP server");
    /* Empty handle to esp_http_server */
    httpd_handle_t server = NULL;

    /* Generate default configuration */
    httpd_config_t config = HTTPD_DEFAULT_CONFIG();
    config.uri_match_fn = httpd_uri_match_wildcard;
    config.max_uri_handlers = 50;

    /* Start the httpd server */
    ESP_ERROR_CHECK(httpd_start(&server, &config));
    register_uri_handlers(server);
    /* If server failed to start, handle will be NULL */
    return server;
}

/* Function for stopping the webserver */
void stop_https_webserver(httpd_handle_t server)
{
    if (server)
    {
        /* Stop the httpd server */
        httpd_ssl_stop(server);
    }
}

/* Function for stopping the webserver */
void stop_webserver(httpd_handle_t server)
{
    if (server)
    {
        /* Stop the httpd server */
        httpd_stop(server);
    }
}