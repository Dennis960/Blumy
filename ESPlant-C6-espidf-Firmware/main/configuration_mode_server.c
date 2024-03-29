#include "esp_log.h"
#include "esp_http_server.h"
#include "esp_littlefs.h"
#include "cJSON.h"

#include "wifi.c"

void initLittleFs()
{
    esp_vfs_littlefs_conf_t conf = {
        .base_path = "",
        .partition_label = "littlefs",
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
    ESP_ERROR_CHECK(esp_vfs_littlefs_unregister("/littlefs"));
}

// Returns the requested file from the LittleFS
esp_err_t get_handler(httpd_req_t *req)
{
    char path[600];
    sprintf(path, "%s", req->uri);
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

esp_err_t post_api_connect_handler(httpd_req_t *req)
{
    char content[100];

    /* Truncate if content length larger than the buffer */
    size_t recv_size = MIN(req->content_len, sizeof(content));

    int ret = httpd_req_recv(req, content, recv_size);
    if (ret <= 0)
    {
        if (ret == HTTPD_SOCK_ERR_TIMEOUT)
        {
            httpd_resp_send_408(req);
        }
        return ESP_FAIL;
    }

    /* Extract ssid and password from request, they are separated by newline */
    char ssid[33];
    char password[100];
    sscanf(content, "%[^\n]\n%[^\n]", ssid, password);

    ESP_LOGI("HTTP", "SSID: %s, Password: %s", ssid, password);

    const char resp[] = "OK";
    httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);

    // TODO
    // if (wifi_connect(ssid, password))
    // {
    //     save_wifi_credentials(ssid, password);
    // }
    return ESP_OK;
}

esp_err_t post_api_reset_handler(httpd_req_t *req)
{
    char content[1];

    /* Truncate if content length larger than the buffer */
    size_t recv_size = MIN(req->content_len, sizeof(content));

    int ret = httpd_req_recv(req, content, recv_size);
    if (ret <= 0)
    {
        if (ret == HTTPD_SOCK_ERR_TIMEOUT)
        {
            httpd_resp_send_408(req);
        }
        return ESP_FAIL;
    }

    const char resp[] = "OK";
    httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);

    if (strcmp(content, "1") == 0)
    {
        // TODO
        // reset();
    }
    return ESP_OK;
}

esp_err_t get_api_networks_handler(httpd_req_t *req)
{
    my_wifi_ap_record_t ap_records[20];
    int num_ap_records = 20;
    wifi_scan_networks(ap_records, &num_ap_records);

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
    bool status = wifi_get_status();
    char s = status ? '1' : '0';
    const char resp[] = {s, '\0'};
    httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);
    return ESP_OK;
}

esp_err_t post_api_mqttSetup_handler(httpd_req_t *req)
{
    char content[100];

    /* Truncate if content length larger than the buffer */
    size_t recv_size = MIN(req->content_len, sizeof(content));

    int ret = httpd_req_recv(req, content, recv_size);
    if (ret <= 0)
    {
        if (ret == HTTPD_SOCK_ERR_TIMEOUT)
        {
            httpd_resp_send_408(req);
        }
        return ESP_FAIL;
    }

    /* Send a simple response */
    const char resp[] = "Not Implemented";
    httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);
    return ESP_OK;
}

esp_err_t post_api_sensorId_handler(httpd_req_t *req)
{
    char content[100];

    /* Truncate if content length larger than the buffer */
    size_t recv_size = MIN(req->content_len, sizeof(content));

    int ret = httpd_req_recv(req, content, recv_size);
    if (ret <= 0)
    {
        if (ret == HTTPD_SOCK_ERR_TIMEOUT)
        {
            httpd_resp_send_408(req);
        }
        return ESP_FAIL;
    }

    /* Send a simple response */
    const char resp[] = "Not Implemented";
    httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);
    return ESP_OK;
}

esp_err_t get_api_sensorId_handler(httpd_req_t *req)
{
    const char resp[] = "Not Implemented";
    httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);
    return ESP_OK;
}

esp_err_t post_api_timeouts_sleep_handler(httpd_req_t *req)
{
    char content[100];

    /* Truncate if content length larger than the buffer */
    size_t recv_size = MIN(req->content_len, sizeof(content));

    int ret = httpd_req_recv(req, content, recv_size);
    if (ret <= 0)
    {
        if (ret == HTTPD_SOCK_ERR_TIMEOUT)
        {
            httpd_resp_send_408(req);
        }
        return ESP_FAIL;
    }

    /* Send a simple response */
    const char resp[] = "Not Implemented";
    httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);
    return ESP_OK;
}

esp_err_t get_api_timeouts_sleep_handler(httpd_req_t *req)
{
    const char resp[] = "Not Implemented";
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
    const char resp[] = "Not Implemented";
    httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);
    return ESP_OK;
}

esp_err_t get_api_sensor_value_handler(httpd_req_t *req)
{
    const char resp[] = "Not Implemented";
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

httpd_uri_t post_api_mqttSetup = {
    .uri = "/api/mqttSetup",
    .method = HTTP_POST,
    .handler = post_api_mqttSetup_handler,
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
        httpd_register_uri_handler(server, &post_api_mqttSetup);
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
    if (server)
    {
        /* Stop the httpd server */
        httpd_stop(server);
    }
}