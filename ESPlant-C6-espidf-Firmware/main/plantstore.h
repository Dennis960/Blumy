#pragma once

#include "nvs_flash.h"
#include "esp_log.h"

#define CREDENTIALS_SSID_KEY "cred_ssid"
#define CREDENTIALS_PASSWORD_KEY "cred_password"
#define HTTP_URL_KEY "http_url"
#define HTTP_AUTH_KEY "http_auth"
#define MQTT_SERVER_KEY "mqtt_server"
#define MQTT_PORT_KEY "mqtt_port"
#define MQTT_USERNAME_KEY "mqtt_username"
#define MQTT_PASSWORD_KEY "mqtt_password"
#define MQTT_TOPIC_KEY "mqtt_topic"
#define MQTT_CLIENTID_KEY "mqtt_clientid"
#define BLUMY_TOKEN_KEY "blumy_token"
#define SENSOR_ID_KEY "sensor_id"
#define SENSOR_TIMEOUT_SLEEP_KEY "timeout_sleep"
#define SENSOR_TIMEOUT_CONFIG_KEY "timeout_config"

bool plantstore_getWifiCredentials(char *ssid, char *password, size_t ssid_size, size_t password_size);
void plantstore_setWifiCredentials(char *ssid, char *password);
bool plantstore_getCloudConfigurationHttp(char *url, char *auth, size_t url_size, size_t auth_size);
void plantstore_setCloudConfigurationHttp(char *url, char *auth);
bool plantstore_getCloudConfigurationMqtt(char *server, int16_t *port, char *username, char *password, char *topic, char *clientId, size_t server_size, size_t username_size, size_t password_size, size_t topic_size, size_t clientId_size);
void plantstore_setCloudConfigurationMqtt(char *server, int16_t port, char *username, char *password, char *topic, char *clientId);
bool plantstore_getCloudConfigurationBlumy(char *token, size_t token_size);
void plantstore_setCloudConfigurationBlumy(char *token);
bool plantstore_getSensorId(int32_t *sensorId);
void plantstore_setSensorId(int32_t sensorId);
bool plantstore_getSensorTimeoutSleepMs(uint64_t *timeoutMs);
void plantstore_setSensorTimeoutSleepMs(uint64_t timeoutMs);
bool plantstore_getConfigurationModeTimeoutMs(int32_t *timeoutMs);
void plantstore_setConfigurationModeTimeoutMs(int32_t timeoutMs);
/**
 * @brief Check if the plantstore is configured
 * The plantstore is marked as configured, if the wifi credentials are set and at least one of the cloud configurations is set.
 */
bool plantstore_isConfigured();
void plantstore_hardReset();