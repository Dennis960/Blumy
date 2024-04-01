#include "configuration_mode_server.h"

#include "esp_log.h"
#include "esp_http_server.h"
#include "esp_littlefs.h"
#include "cJSON.h"

#include "plantfi.h"
#include "plantstore.h"
#include "peripherals/sensors.h"
#include "defaults.h"

#define LITTLE_FS_PARTITION_LABEL "littlefs"

void initLittleFs()
{
    esp_vfs_littlefs_conf_t conf = {
        .base_path = "",
        .partition_label = LITTLE_FS_PARTITION_LABEL,
        .format_if_mount_failed = true,
        .dont_mount = false,
    };
    ESP_ERROR_CHECK(esp_vfs_littlefs_register(&conf));
    size_t total = 0, used = 0;
    esp_err_t ret = esp_littlefs_info(conf.partition_label, &total, &used);
    if (ret != ESP_OK)
    {
        ESP_LOGE("LITTLE_FS", "Failed to get LittleFS partition information (%s)", esp_err_to_name(ret));
    }
    else
    {
        ESP_LOGI("LITTLE_FS", "Partition size: total: %d, used: %d", total, used);
    }
}

void deinitLittleFs()
{
    ESP_ERROR_CHECK(esp_vfs_littlefs_unregister(LITTLE_FS_PARTITION_LABEL));
}

// Returns the requested file from the LittleFS
esp_err_t get_handler(httpd_req_t *req)
{
    char path[600];
    for (int i = 0; i < 600; i++)
    {
        if (req->uri[i] == '?' || req->uri[i] == '#' || req->uri[i] == '\0')
        {
            path[i] = '\0';
            break;
        }
        path[i] = req->uri[i];
    }
    // If path is empty, return index.html
    if (strlen(path) == 0)
    {
        strcpy(path, "/index.html");
    }
    ESP_LOGI("HTTP", "GET %s", path);
    FILE *file = fopen(path, "r");
    if (file == NULL)
    {
        httpd_resp_send_404(req);
        return ESP_FAIL;
    }
    // If javascript file, set content type to javascript
    if (strstr(path, ".js") != NULL)
    {
        httpd_resp_set_type(req, "application/javascript");
    }
    // If css file, set content type to css
    if (strstr(path, ".css") != NULL)
    {
        httpd_resp_set_type(req, "text/css");
    }
    // If html file, set content type to html
    if (strstr(path, ".html") != NULL)
    {
        httpd_resp_set_type(req, "text/html");
    }

    char line[256];
    while (fgets(line, sizeof(line), file))
    {
        httpd_resp_sendstr_chunk(req, line);
    }
    fclose(file);
    httpd_resp_send_chunk(req, NULL, 0);
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

    plantfi_initSta(ssid, password, 5, true);
    return ESP_OK;
}

esp_err_t post_api_reset_handler(httpd_req_t *req)
{
    char resetFlag[2];
    if (!get_single_value(req, resetFlag))
    {
        return ESP_FAIL;
    }

    const char resp[] = "OK";
    httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);

    // TODO 0: reset to sensor mode, 1: reset to configuration mode
    if (resetFlag[0] == '1')
    {
        esp_restart();
    }
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
    char server[100];
    char portString[10];
    char username[100];
    char password[100];
    char topic[100];
    char clientId[100];
    char *keys[] = {"server", "port", "username", "password", "topic", "clientId"};
    char *values[] = {server, portString, username, password, topic, clientId};
    if (!get_values(req, keys, values, 6) || !is_number(portString))
    {
        return ESP_FAIL;
    }

    int16_t port = atoi(portString);

    plantstore_setCloudConfigurationMqtt(server, port, username, password, topic, clientId);

    const char resp[] = "OK";
    httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);
    return ESP_OK;
}

esp_err_t post_api_cloudSetup_http_handler(httpd_req_t *req)
{
    char url[100];
    char auth[100];
    char *keys[] = {"url", "auth"};
    char *values[] = {url, auth};
    if (!get_values(req, keys, values, 2))
    {
        return ESP_FAIL;
    }

    plantstore_setCloudConfigurationHttp(url, auth);

    const char resp[] = "OK";
    httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);
    return ESP_OK;
}

esp_err_t post_api_cloudSetup_blumy_handler(httpd_req_t *req)
{
    char token[100];
    char *keys[] = {"token"};
    char *values[] = {token};
    if (!get_values(req, keys, values, 1))
    {
        return ESP_FAIL;
    }

    plantstore_setCloudConfigurationBlumy(token);

    const char resp[] = "OK";
    httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);
    return ESP_OK;
}

esp_err_t get_api_cloudSetup_mqtt_handler(httpd_req_t *req)
{
    char server[100];
    int16_t port;
    char username[100];
    char password[100];
    char topic[100];
    char clientId[100];

    if (!plantstore_getCloudConfigurationMqtt(server, &port, username, password, topic, clientId, sizeof(server), sizeof(username), sizeof(password), sizeof(topic), sizeof(clientId)))
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
    char url[100];
    char auth[100];

    if (!plantstore_getCloudConfigurationHttp(url, auth, sizeof(url), sizeof(auth)))
    {
        httpd_resp_send_404(req);
        return ESP_FAIL;
    }

    cJSON *root = cJSON_CreateObject();
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
    char token[100];

    if (!plantstore_getCloudConfigurationBlumy(token, sizeof(token)))
    {
        httpd_resp_send_404(req);
        return ESP_FAIL;
    }

    cJSON *root = cJSON_CreateObject();
    cJSON_AddStringToObject(root, "token", token);

    char *resp = cJSON_Print(root);
    cJSON_Delete(root);

    httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);
    free(resp);
    return ESP_OK;
}

esp_err_t post_api_sensorId_handler(httpd_req_t *req)
{
    char sensorId[10];
    if (!get_single_value(req, sensorId) || !is_number(sensorId))
    {
        return ESP_FAIL;
    }

    plantstore_setSensorId(atoi(sensorId));

    const char resp[] = "OK";
    httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);
    return ESP_OK;
}

esp_err_t get_api_sensorId_handler(httpd_req_t *req)
{
    int32_t sensorId;
    if (!plantstore_getSensorId(&sensorId))
    {
        httpd_resp_send_404(req);
        return ESP_FAIL;
    }

    char resp[10];
    sprintf(resp, "%ld", sensorId);
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
    int32_t timeout = DEFAULT_SENSOR_TIMEOUT_SLEEP_MS;
    plantstore_getSensorTimeoutSleepMs(&timeout);

    char resp[15];
    sprintf(resp, "%lu", timeout);
    httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);
    return ESP_OK;
}

esp_err_t get_api_timeouts_configurationMode_handler(httpd_req_t *req)
{
    int32_t timeout = DEFAULT_CONFIGURATION_MODE_TIMEOUT_MS;
    plantstore_getConfigurationModeTimeoutMs(&timeout);

    char resp[15];
    sprintf(resp, "%lu", timeout);
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

esp_err_t get_api_update_percentage_handler(httpd_req_t *req)
{
    const char resp[] = "Not Implemented";
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

    httpd_resp_send(req, ssid, HTTPD_RESP_USE_STRLEN);
    return ESP_OK;
}

esp_err_t get_api_sensor_value_handler(httpd_req_t *req)
{
    sensors_moisture_sensor_output_t moisture_output;
    sensors_read_moisture(&moisture_output);

    int moisture = moisture_output.measurement;
    char resp[10];
    sprintf(resp, "%d", moisture);
    httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);
    return ESP_OK;
}

httpd_uri_t get = {
    .uri = "/*",
    .method = HTTP_GET,
    .handler = get_handler,
    .user_ctx = NULL};

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

httpd_uri_t post_api_sensorId = {
    .uri = "/api/sensorId",
    .method = HTTP_POST,
    .handler = post_api_sensorId_handler,
    .user_ctx = NULL};

httpd_uri_t get_api_sensorId = {
    .uri = "/api/sensorId",
    .method = HTTP_GET,
    .handler = get_api_sensorId_handler,
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

httpd_uri_t get_api_sensorValue = {
    .uri = "/api/sensor/value",
    .method = HTTP_GET,
    .handler = get_api_sensor_value_handler,
    .user_ctx = NULL};

/* Function for starting the webserver */
httpd_handle_t start_webserver(void)
{
    initLittleFs();
    /* Generate default configuration */
    httpd_config_t config = HTTPD_DEFAULT_CONFIG();
    config.uri_match_fn = httpd_uri_match_wildcard;
    config.max_uri_handlers = 50;

    /* Empty handle to esp_http_server */
    httpd_handle_t server = NULL;

    /* Start the httpd server */
    if (httpd_start(&server, &config) == ESP_OK)
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
        httpd_register_uri_handler(server, &post_api_sensorId);
        httpd_register_uri_handler(server, &get_api_sensorId);
        httpd_register_uri_handler(server, &post_api_timeouts_sleep);
        httpd_register_uri_handler(server, &get_api_timeouts_sleep);
        httpd_register_uri_handler(server, &get_api_update_percentage);
        httpd_register_uri_handler(server, &get_api_connectedNetwork);
        httpd_register_uri_handler(server, &get_api_sensorValue);
        httpd_register_uri_handler(server, &get);
    }
    /* If server failed to start, handle will be NULL */
    return server;
}

/* Function for stopping the webserver */
void stop_webserver(httpd_handle_t server)
{
    deinitLittleFs();
    if (server)
    {
        /* Stop the httpd server */
        httpd_stop(server);
    }
}