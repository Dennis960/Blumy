#include "plantmqtt.h"

#include "plantstore.h"
#include "defaults.h"
#include "peripherals/sensors.h"
#include "esp_log.h"
#include "esp_timer.h"

#include <mqtt_client.h>
#include <stdio.h>

typedef enum
{
    SENSOR_LIGHT,
    SENSOR_VOLTAGE,
    SENSOR_TEMPERATURE,
    SENSOR_HUMIDITY,
    SENSOR_USB_CONNECTED,
    SENSOR_SOIL_MOISTURE,
    SENSOR_RSSI,
    SENSOR_DURATION,
    SENSOR_TYPE_COUNT
} sensor_type_t;

typedef struct
{
    const char *id;
    const char *unit;
    const char *device_class;
    const char *name;
} sensor_info_t;

static const sensor_info_t sensor_info[SENSOR_TYPE_COUNT] = {
    {"light", "lx", "illuminance", "Light"},
    {"voltage", "V", "voltage", "Voltage"},
    {"temperature", "°C", "temperature", "Temperature"},
    {"humidity", "%", "humidity", "Humidity"},
    {"isUsbConnected", "", "power", "USB Connected"},
    {"moisture", "", "moisture", "Soil Moisture"},
    {"rssi", "dBm", "signal_strength", "RSSI"},
    {"duration", "us", "duration", "Duration"}};

static int mqtt_queued_messages = 0;

static void mqtt_event_handler_cb(void *handler_args, esp_event_base_t base, int32_t event_id, void *event_data)
{
    esp_mqtt_event_handle_t event = event_data;
    switch (event->event_id)
    {
    case MQTT_EVENT_CONNECTED:
        ESP_LOGI("Plantmqtt", "MQTT_EVENT_CONNECTED");
        break;
    case MQTT_EVENT_PUBLISHED:
        ESP_LOGI("Plantmqtt", "MQTT_EVENT_PUBLISHED, msg_id=%d", event->msg_id);
        mqtt_queued_messages--;
        break;
    default:
        break;
    }
}

int plantmqtt_mqtt_client_publish(esp_mqtt_client_handle_t client, const char *topic, const char *data, int len, int qos, int retain)
{
    mqtt_queued_messages++;
    return esp_mqtt_client_publish(client, topic, data, len, qos, retain);
}

static bool plantmqtt_wait_for_publish()
{
    if (mqtt_queued_messages == 0)
    {
        ESP_LOGI("Plantmqtt", "No MQTT messages to wait for");
        return true;
    }
    ESP_LOGI("Plantmqtt", "Waiting for MQTT messages to be published, remaining: %d", mqtt_queued_messages);
    uint64_t timeout_ms = DEFAULT_MQTT_MESSAGE_TIMEOUT_MS;
    plantstore_getMqttMessageTimeoutMs(&timeout_ms);
    int waited_ms = 0;
    while (mqtt_queued_messages > 0 && waited_ms < timeout_ms)
    {
        vTaskDelay(10 / portTICK_PERIOD_MS);
        waited_ms += 10;
    }
    if (mqtt_queued_messages > 0)
    {
        ESP_LOGW("Plantmqtt", "Timeout reached while waiting for MQTT messages to be published, remaining: %d", mqtt_queued_messages);
    }
    else
    {
        ESP_LOGI("Plantmqtt", "All MQTT messages published successfully");
    }
    return mqtt_queued_messages == 0;
}

static void publish_sensor_config(esp_mqtt_client_handle_t mqtt_client, const char *sensorId, const sensor_type_t type)
{
    char config_topic[128];
    char payload[512];
    const bool is_binary_sensor = type == SENSOR_USB_CONNECTED;
    if (is_binary_sensor)
    {
        snprintf(payload, sizeof(payload),
                 "{"
                 "\"name\":\"%s\","
                 "\"state_topic\":\"blumy_%s_state\","
                 "\"device_class\":\"%s\","
                 "\"value_template\":\"{{ value_json.%s }}\","
                 "\"unique_id\":\"blumy_%s_%s\","
                 "\"payload_on\":true,"
                 "\"payload_off\":false,"
                 "\"device\":{"
                 "\"identifiers\":[\"blumy_%s\"],"
                 "\"name\":\"Blumy %s\","
                 "\"manufacturer\":\"Blumy\","
                 "\"model\":\"Blumy Bellis\""
                 "}"
                 "}",
                 sensor_info[type].name,
                 sensorId,
                 sensor_info[type].device_class,
                 sensor_info[type].id,
                 sensorId,
                 sensor_info[type].id,
                 sensorId,
                 sensorId);
        snprintf(config_topic, sizeof(config_topic),
                 "homeassistant/binary_sensor/blumy_%s_%s/config", sensorId, sensor_info[type].id);
    }
    else
    {
        snprintf(payload, sizeof(payload),
                 "{"
                 "\"name\":\"%s\","
                 "\"state_topic\":\"blumy_%s_state\"," // TODO use the configured topic with a templating mechanism
                 "\"unit_of_measurement\":\"%s\","
                 "\"device_class\":\"%s\","
                 "\"value_template\":\"{{ value_json.%s }}\","
                 "\"unique_id\":\"blumy_%s_%s\","
                 "\"device\":{"
                 "\"identifiers\":[\"blumy_%s\"],"
                 "\"name\":\"Blumy %s\","
                 "\"manufacturer\":\"Blumy\","
                 "\"model\":\"Blumy Bellis\""
                 "}"
                 "}",
                 sensor_info[type].name,
                 sensorId,
                 sensor_info[type].unit,
                 sensor_info[type].device_class,
                 sensor_info[type].id,
                 sensorId,
                 sensor_info[type].id,
                 sensorId,
                 sensorId);
        snprintf(config_topic, sizeof(config_topic),
                 "homeassistant/sensor/blumy_%s_%s/config", sensorId, sensor_info[type].id);
    }

    ESP_LOGI("Plantmqtt", "Publishing sensor config for type: %s, topic: %s", sensor_info[type].name, config_topic);
    ESP_LOGD("Plantmqtt", "Payload: %s", payload);

    int msg_id = plantmqtt_mqtt_client_publish(
        mqtt_client,
        config_topic,
        payload,
        0,
        1,
        false);

    if (msg_id == -1)
    {
        ESP_LOGE("Plantmqtt", "Failed to publish sensor config for type: %s", sensor_info[type].name);
    }
    else
    {
        ESP_LOGI("Plantmqtt", "Published sensor config for type: %s, msg_id: %d", sensor_info[type].name, msg_id);
    }
}

esp_mqtt_client_handle_t plantmqtt_mqtt_init(char *sensorId, size_t sensorId_size, const char *server, uint32_t port, const char *username, const char *password, const char *clientId)
{
    const esp_mqtt_client_config_t mqtt_cfg = {
        .broker.address.uri = server,
        .broker.address.port = port,
        .credentials.username = username,
        .credentials.authentication.password = password,
        .credentials.client_id = clientId,
    };

    ESP_LOGI("Plantmqtt", "Initializing MQTT client");
    ESP_LOGI("Plantmqtt", "MQTT Server: %s:%lu", server, port);

    esp_mqtt_client_handle_t mqtt_client = esp_mqtt_client_init(&mqtt_cfg);
    if (mqtt_client == NULL)
    {
        ESP_LOGE("Plantmqtt", "Failed to initialize MQTT client");
        return NULL;
    }

    esp_mqtt_client_register_event(mqtt_client, ESP_EVENT_ANY_ID, (esp_event_handler_t)mqtt_event_handler_cb, NULL);

    mqtt_queued_messages = 0;
    esp_err_t err = esp_mqtt_client_start(mqtt_client);
    if (err != ESP_OK)
    {
        ESP_LOGE("Plantmqtt", "Failed to start MQTT client: %s", esp_err_to_name(err));
        esp_mqtt_client_destroy(mqtt_client);
        return NULL;
    }

    return mqtt_client;
}

esp_mqtt_client_handle_t plantmqtt_mqtt_init_from_plantstore(char *sensorId, size_t sensorId_size)
{
    ESP_LOGI("Plantmqtt", "Initializing Plantmqtt MQTT");
    char server[100];
    uint32_t port;
    char username[100];
    char password[100];
    char clientId[100];
    if (!plantstore_getCloudConfigurationMqtt(sensorId, server, &port, username, password, NULL, clientId, sensorId_size, sizeof(server), sizeof(username), sizeof(password), 0, sizeof(clientId)))
    {
        ESP_LOGI("Plantmqtt", "No MQTT configuration found");
        return NULL;
    }
    return plantmqtt_mqtt_init(sensorId, sensorId_size, server, port, username, password, clientId);
}

void plantmqtt_homeassistant_create_sensor(void)
{
    char sensorId[100];
    esp_mqtt_client_handle_t mqtt_client = plantmqtt_mqtt_init_from_plantstore(sensorId, 100);
    if (mqtt_client == NULL)
    {
        ESP_LOGE("Plantmqtt", "MQTT client not initialized, cannot create sensor");
        return;
    }
    for (int i = 0; i < SENSOR_TYPE_COUNT; i++)
    {
        publish_sensor_config(mqtt_client, sensorId, (sensor_type_t)i);
    }
    plantmqtt_wait_for_publish();
    esp_mqtt_client_stop(mqtt_client);
    esp_mqtt_client_destroy(mqtt_client);
    ESP_LOGI("Plantmqtt", "MQTT client initialized");
}

void plantmqtt_homeassistant_publish_sensor_data(const sensors_full_data_t *sensors_data, int16_t rssi)
{
    char sensorId[100];
    esp_mqtt_client_handle_t mqtt_client = plantmqtt_mqtt_init_from_plantstore(sensorId, 100);
    if (mqtt_client == NULL)
    {
        ESP_LOGE("Plantmqtt", "MQTT client not initialized, cannot publish sensor data");
        return;
    }

    char topic[128];
    snprintf(topic, sizeof(topic), "blumy_%s_state", sensorId);

    char data[400];
    sprintf(data, "{\"light\":%2.2f,\"voltage\":%.2f,\"temperature\":%.2f,\"humidity\":%.2f,\"isUsbConnected\":%s,\"moisture\":%d,\"rssi\":%d,\"duration\":%lld}",
            sensors_data->light,
            sensors_data->voltage,
            sensors_data->temperature,
            sensors_data->humidity,
            sensors_data->is_usb_connected ? "true" : "false",
            sensors_data->moisture_measurement,
            rssi,
            esp_timer_get_time());

    ESP_LOGI("Plantmqtt", "Publishing sensor data to topic: %s", topic);
    ESP_LOGD("Plantmqtt", "Data: %s", data);

    int msg_id = plantmqtt_mqtt_client_publish(mqtt_client, topic, data, 0, 1, false);
    if (msg_id == -1)
    {
        ESP_LOGE("Plantmqtt", "Failed to publish sensor data");
    }
    else
    {
        ESP_LOGI("Plantmqtt", "Published sensor data with msg_id: %d", msg_id);
    }
}

bool plantmqtt_test_connection(char *sensorId, char *server, uint32_t port, char *username, char *password, char *topic, char *clientId)
{
    ESP_LOGI("Plantmqtt", "Testing MQTT connection");
    esp_mqtt_client_handle_t mqtt_client = plantmqtt_mqtt_init(sensorId, 100, server, port, username, password, clientId);
    if (mqtt_client == NULL)
    {
        ESP_LOGE("Plantmqtt", "MQTT client not initialized");
        return false;
    }

    if (topic == NULL || strlen(topic) == 0)
    {
        ESP_LOGI("Plantmqtt", "No topic provided, using default topic");
        snprintf(topic, 100, "test/blumy/%s", sensorId);
    }

    int msg_id = plantmqtt_mqtt_client_publish(mqtt_client, topic, "Hello from your Blumy!", 0, 1, 0);
    if (msg_id == -1)
    {
        ESP_LOGE("Plantmqtt", "Failed to publish test message");
        esp_mqtt_client_destroy(mqtt_client);
        return false;
    }

    plantmqtt_wait_for_publish();
    esp_mqtt_client_stop(mqtt_client);
    esp_mqtt_client_destroy(mqtt_client);

    return mqtt_queued_messages == 0;
}
