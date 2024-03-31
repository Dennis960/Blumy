#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_log.h"
#include "nvs_flash.h"
#include "esp_sleep.h"
#include "esp_timer.h"

#include "esp_http_client.h"
#include <sys/socket.h>
#include <netinet/in.h>
#include <string.h>

#include "peripherals/sensors.h"
#include "secret.c"
#include "plantfi.h"
#include "configuration_mode_server.h"
#include "plantstore.h"
#include "defaults.h"

// TODO use udp or mqtt
void sendSensorData(sensors_full_data_t *sensors_data, int8_t rssi)
{
    int sensorAddress = 13;
    char data[400];

    sprintf(data, "{\"sensorAddress\":%d,\"light\":%2.2f,\"voltage\":%.2f,\"temperature\":%.2f,\"humidity\":%.2f,\"isUsbConnected\":%s,\"moisture\":%d,\"moistureStabilizationTime\":%lu,\"isMoistureMeasurementSuccessful\":%s,\"humidityRaw\":%lu,\"temperatureRaw\":%lu,\"rssi\":%d}",
            sensorAddress,
            sensors_data->light,
            sensors_data->voltage,
            sensors_data->temperature,
            sensors_data->humidity,
            sensors_data->is_usb_connected ? "true" : "false",
            sensors_data->moisture_measurement,
            sensors_data->moisture_stabilization_time,
            sensors_data->moisture_measurement_successful ? "true" : "false",
            sensors_data->humidity_raw,
            sensors_data->temperature_raw,
            rssi);

    esp_http_client_config_t config = {
        .url = SECRET_API_URL,
        .method = HTTP_METHOD_POST,
    };

    esp_http_client_handle_t client = esp_http_client_init(&config);
    esp_http_client_set_post_field(client, data, strlen(data));
    esp_http_client_set_header(client, "Content-Type", "application/json");
    ESP_ERROR_CHECK(esp_http_client_perform(client));

    esp_http_client_cleanup(client);

    ESP_LOGI("Data", "%s", data);
    int status_code = esp_http_client_get_status_code(client);
    ESP_LOGI("HTTP", "Status Code: %d", status_code);
}

void start_deep_sleep()
{
    uint64_t sleepTime = DEFAULT_SENSOR_TIMEOUT_SLEEP_MS;
    plantstore_getSensorTimeoutSleepMs(&sleepTime);
    sleepTime *= 1000;
    ESP_LOGI("DeepSleep", "Going to sleep for %llu ms", sleepTime);
    esp_deep_sleep(sleepTime);
}

void configuration_mode(bool isConfigured)
{
    bool userConnectedToAp = false;
    uint64_t start_time = esp_timer_get_time();
    uint64_t current_time = start_time;
    int32_t timeoutMs = DEFAULT_CONFIGURATION_MODE_TIMEOUT_MS;
    plantstore_getConfigurationModeTimeoutMs(&timeoutMs);
    ESP_LOGI("MODE", "Starting configuration mode%s", isConfigured ? " (sensor is configured)" : "");
    plantfi_initAp("Blumy", "", 4, &userConnectedToAp);
    httpd_handle_t webserver = webserver = start_webserver();
    while (1)
    {
        if (isConfigured && !userConnectedToAp)
        {
            current_time = esp_timer_get_time();
            if (current_time - start_time > timeoutMs * 1000)
            {
                ESP_LOGI("MODE", "Timeout reached, going to sleep");
                break;
            }
        }
        vTaskDelay(100 / portTICK_PERIOD_MS);
    }
    stop_webserver(webserver);
    start_deep_sleep();
}

void sensor_mode()
{
    ESP_LOGI("MODE", "Starting sensor mode");
    plantfi_initSavedSta();
    sensors_initSensors();
    sensors_full_data_t sensors_data;
    sensors_full_read(&sensors_data);
    EventBits_t bits;
    ESP_ERROR_CHECK(plantfi_waitForStaConnection(&bits));
    if (bits & PLANTFI_CONNECTED_BIT)
    {
        int8_t rssi = plantfi_getRssi();
        sendSensorData(&sensors_data, rssi);
    }
    else
    {
        ESP_LOGE("WIFI", "Failed to connect to wifi");
    }
    sensors_deinitSensors(); // optional
    start_deep_sleep();
}

void app_main()
{
    bool isConfigured = plantstore_isConfigured();
    bool isManualReset = (esp_reset_reason() == ESP_RST_POWERON ||
                          esp_reset_reason() == ESP_RST_JTAG ||
                          esp_reset_reason() == ESP_RST_SDIO ||
                          esp_reset_reason() == ESP_RST_USB);

    if (isManualReset || !isConfigured)
    {
        configuration_mode(isConfigured);
    }
    else
    {
        sensor_mode(); // Never returns
    }
}
