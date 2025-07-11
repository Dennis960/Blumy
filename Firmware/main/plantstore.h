#pragma once

#include "nvs_flash.h"
#include "esp_log.h"
#include "defaults.h"

#define CREDENTIALS_SSID_KEY "cred_ssid"
#define CREDENTIALS_PASSWORD_KEY "cred_password"
#define HTTP_SENSORID_KEY "http_sensorid"
#define HTTP_URL_KEY "http_url"
#define HTTP_AUTH_KEY "http_auth"
#define MQTT_SENSORID_KEY "mqtt_sensorid"
#define MQTT_SERVER_KEY "mqtt_server"
#define MQTT_PORT_KEY "mqtt_port"
#define MQTT_USERNAME_KEY "mqtt_username"
#define MQTT_PASSWORD_KEY "mqtt_password"
#define MQTT_TOPIC_KEY "mqtt_topic"
#define MQTT_CLIENTID_KEY "mqtt_clientid"
#define BLUMY_TOKEN_KEY "blumy_token"
#define BLUMY_URL_KEY "blumy_url"
#define SENSOR_TIMEOUT_SLEEP_KEY "timeout_sleep"
#define SENSOR_TIMEOUT_CONFIG_KEY "timeout_config"
#define WATCHDOG_TIMEOUT_KEY "timeout_wdt"
#define MQTT_MESSAGE_TIMEOUT_KEY "timeout_mqtt_msg"
#define FIRMWARE_UPDATE_URL_KEY "update_url"
#define LED_BRIGHTNESS_KEY "led_brightness"

bool plantstore_getWifiCredentials(char *ssid, char *password, size_t ssid_size, size_t password_size);
void plantstore_setWifiCredentials(char *ssid, char *password);
bool plantstore_getCloudConfigurationHttp(char *sensorId, char *url, char *auth, size_t sensorId_size, size_t url_size, size_t auth_size);
void plantstore_setCloudConfigurationHttp(char *sensorId, char *url, char *auth);
void plantstore_resetCloudConfigurationHttp();
bool plantstore_getCloudConfigurationMqtt(char *sensorId, char *server, uint32_t *port, char *username, char *password, char *topic, char *clientId, size_t sensorId_size, size_t server_size, size_t username_size, size_t password_size, size_t topic_size, size_t clientId_size);
void plantstore_setCloudConfigurationMqtt(char *sensorId, char *server, uint32_t port, char *username, char *password, char *topic, char *clientId);
void plantstore_resetCloudConfigurationMqtt();
bool plantstore_getCloudConfigurationBlumy(char *token, char *url, size_t token_size, size_t url_size);
void plantstore_setCloudConfigurationBlumy(char *token, char *url);
void plantstore_resetCloudConfigurationBlumy();
bool plantstore_getSensorTimeoutSleepMs(uint64_t *timeoutMs);
void plantstore_setSensorTimeoutSleepMs(uint64_t timeoutMs);
bool plantstore_getConfigurationModeTimeoutMs(int32_t *timeoutMs);
void plantstore_setConfigurationModeTimeoutMs(int32_t timeoutMs);
bool plantstore_getWatchdogTimeoutMs(uint64_t *timeoutMs);
void plantstore_setWatchdogTimeoutMs(uint64_t timeoutMs);
bool plantstore_getMqttMessageTimeoutMs(uint64_t *timeoutMs);
void plantstore_setMqttMessageTimeoutMs(uint64_t timeoutMs);
void plantstore_setFirmwareUpdateUrl(char *url);
bool plantstore_getFirmwareUpdateUrl(char *url, size_t url_size);
bool plantstore_getLedBrightness(uint8_t *brightness);
void plantstore_setLedBrightness(uint8_t brightness);
/**
 * @brief Check if the plantstore is configured
 * The plantstore is marked as configured, if the wifi credentials are set and at least one of the cloud configurations is set.
 */
bool plantstore_isConfigured();
void plantstore_factoryReset();
