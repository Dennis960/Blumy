#include "nvs_flash.h"
#include "esp_log.h"

void plantstore_init()
{
    ESP_ERROR_CHECK(nvs_flash_init());
}

typedef struct
{
    char *ssid;
    char *password;
} plantstore_wifi_credentials_t;

typedef struct
{
    char *url;
    char *auth;
} plantstore_cloud_configuration_http_t;

typedef struct
{
    char *server;
    int16_t port;
    char *username;
    char *password;
    char *topic;
    char *clientId;
} plantstore_cloud_configuration_mqtt_t;

typedef struct
{
    char *token;
} plantstore_cloud_configuration_blumy_t;

nvs_handle_t plantstore_openNvsReadOnly()
{
    nvs_handle_t nvs_handle;
    ESP_ERROR_CHECK(nvs_open("plantstore", NVS_READONLY, &nvs_handle));
    return nvs_handle;
}

nvs_handle_t plantstore_openNvsReadWrite()
{
    nvs_handle_t nvs_handle;
    ESP_ERROR_CHECK(nvs_open("plantstore", NVS_READWRITE, &nvs_handle));
    return nvs_handle;
}

bool plantstore_getWifiCredentials(plantstore_wifi_credentials_t *credentials)
{
    nvs_handle_t nvs_handle = plantstore_openNvsReadOnly();
    char ssid[33];
    char password[65];
    size_t ssid_size = sizeof(ssid);
    size_t password_size = sizeof(password);

    esp_err_t ssid_err = nvs_get_str(nvs_handle, "credentials_ssid", ssid, &ssid_size);
    esp_err_t password_err = nvs_get_str(nvs_handle, "credentials_password", password, &password_size);

    nvs_close(nvs_handle);

    if (ssid_err == ESP_OK && password_err == ESP_OK) {
        credentials->ssid = ssid;
        credentials->password = password;
        return true;
    } else {
        return false;
    }
}

void plantstore_setWifiCredentials(char *ssid, char *password)
{
    nvs_handle_t nvs_handle = plantstore_openNvsReadWrite();
    ESP_ERROR_CHECK(nvs_set_str(nvs_handle, "credentials_ssid", ssid));
    ESP_ERROR_CHECK(nvs_set_str(nvs_handle, "credentials_password", password));
    ESP_ERROR_CHECK(nvs_commit(nvs_handle));
    nvs_close(nvs_handle);
}

bool plantstore_getCloudConfigurationHttp(plantstore_cloud_configuration_http_t *configuration)
{
    nvs_handle_t nvs_handle = plantstore_openNvsReadOnly();
    char url[65];
    char auth[65];
    size_t url_size = sizeof(url);
    size_t auth_size = sizeof(auth);

    esp_err_t url_err = nvs_get_str(nvs_handle, "http_url", url, &url_size);
    esp_err_t auth_err = nvs_get_str(nvs_handle, "http_auth", auth, &auth_size);

    nvs_close(nvs_handle);

    if (url_err == ESP_OK && auth_err == ESP_OK) {
        configuration->url = url;
        configuration->auth = auth;
        return true;
    } else {
        return false;
    }
}

void plantstore_setCloudConfigurationHttp(char *url, char *auth)
{
    nvs_handle_t nvs_handle = plantstore_openNvsReadWrite();
    ESP_ERROR_CHECK(nvs_set_str(nvs_handle, "http_url", url));
    ESP_ERROR_CHECK(nvs_set_str(nvs_handle, "http_auth", auth));
    ESP_ERROR_CHECK(nvs_commit(nvs_handle));
    nvs_close(nvs_handle);
}

bool plantstore_getCloudConfigurationMqtt(plantstore_cloud_configuration_mqtt_t *configuration)
{
    nvs_handle_t nvs_handle = plantstore_openNvsReadOnly();
    char server[65]; // TODO adjust sizes
    int16_t port;
    char username[65];
    char password[65];
    char topic[65];
    char clientId[65];
    size_t server_size = sizeof(server);
    size_t username_size = sizeof(username);
    size_t password_size = sizeof(password);
    size_t topic_size = sizeof(topic);
    size_t clientId_size = sizeof(clientId);

    esp_err_t server_err = nvs_get_str(nvs_handle, "mqtt_server", server, &server_size);
    esp_err_t port_err = nvs_get_i16(nvs_handle, "mqtt_port", &port);
    esp_err_t username_err = nvs_get_str(nvs_handle, "mqtt_username", username, &username_size);
    esp_err_t password_err = nvs_get_str(nvs_handle, "mqtt_password", password, &password_size);
    esp_err_t topic_err = nvs_get_str(nvs_handle, "mqtt_topic", topic, &topic_size);
    esp_err_t clientId_err = nvs_get_str(nvs_handle, "mqtt_clientId", clientId, &clientId_size);

    nvs_close(nvs_handle);

    if (server_err == ESP_OK && port_err == ESP_OK && username_err == ESP_OK && 
        password_err == ESP_OK && topic_err == ESP_OK && clientId_err == ESP_OK) {
        configuration->server = server;
        configuration->port = port;
        configuration->username = username;
        configuration->password = password;
        configuration->topic = topic;
        configuration->clientId = clientId;
        return true;
    } else {
        return false;
    }
}

void plantstore_setCloudConfigurationMqtt(char *server, int16_t *port, char *username, char *password, char *topic, char *clientId)
{
    nvs_handle_t nvs_handle = plantstore_openNvsReadWrite();
    ESP_ERROR_CHECK(nvs_set_str(nvs_handle, "mqtt_server", server));
    ESP_ERROR_CHECK(nvs_set_i16(nvs_handle, "mqtt_port", port));
    ESP_ERROR_CHECK(nvs_set_str(nvs_handle, "mqtt_username", username));
    ESP_ERROR_CHECK(nvs_set_str(nvs_handle, "mqtt_password", password));
    ESP_ERROR_CHECK(nvs_set_str(nvs_handle, "mqtt_topic", topic));
    ESP_ERROR_CHECK(nvs_set_str(nvs_handle, "mqtt_clientId", clientId));
    ESP_ERROR_CHECK(nvs_commit(nvs_handle));
    nvs_close(nvs_handle);
}

bool plantstore_getCloudConfigurationBlumy(plantstore_cloud_configuration_blumy_t *configuration)
{
    nvs_handle_t nvs_handle = plantstore_openNvsReadOnly();
    char token[65];
    size_t token_size = sizeof(token);

    esp_err_t token_err = nvs_get_str(nvs_handle, "blumy_token", token, &token_size);

    nvs_close(nvs_handle);

    if (token_err == ESP_OK) {
        configuration->token = token;
        return true;
    } else {
        return false;
    }
}

void plantstore_setCloudConfigurationBlumy(char *token)
{
    nvs_handle_t nvs_handle = plantstore_openNvsReadWrite();
    ESP_ERROR_CHECK(nvs_set_str(nvs_handle, "blumy_token", token));
    ESP_ERROR_CHECK(nvs_commit(nvs_handle));
    nvs_close(nvs_handle);
}

bool plantstore_getSensorId(int *sensorId)
{
    nvs_handle_t nvs_handle = plantstore_openNvsReadOnly();
    esp_err_t sensorId_err = nvs_get_i32(nvs_handle, "sensor_id", sensorId);
    nvs_close(nvs_handle);

    if (sensorId_err == ESP_OK) {
        return true;
    } else {
        return false;
    }
}

void plantstore_setSensorId(int sensorId)
{
    nvs_handle_t nvs_handle = plantstore_openNvsReadWrite();
    ESP_ERROR_CHECK(nvs_set_i32(nvs_handle, "sensor_id", sensorId));
    ESP_ERROR_CHECK(nvs_commit(nvs_handle));
    nvs_close(nvs_handle);
}