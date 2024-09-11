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
#include "plantfi.h"
#include "configuration_mode_server.h"
#include "plantstore.h"
#include "defaults.h"

void start_deep_sleep()
{
    uint64_t sleepTime = DEFAULT_SENSOR_TIMEOUT_SLEEP_MS;
    plantstore_getSensorTimeoutSleepMs(&sleepTime);
    sleepTime *= 1000;
    ESP_LOGI("DeepSleep", "Going to sleep for %llu us", sleepTime);
    esp_deep_sleep(sleepTime);
}

void configuration_mode(bool isConfigured, bool resetReasonOta)
{
    sensors_playStartupSound();
    plantfi_setEnableNatAndDnsOnConnect(true);
    plantfi_initWifiApSta();
    uint64_t start_time = esp_timer_get_time();
    uint64_t current_time = start_time;
    int32_t timeoutMs = DEFAULT_CONFIGURATION_MODE_TIMEOUT_MS;
    plantstore_getConfigurationModeTimeoutMs(&timeoutMs);
    ESP_LOGI("MODE", "Starting configuration mode%s", isConfigured ? " (sensor is configured)" : " (no config)");
    bool userConnectedToAp = false;
    plantfi_configureAp("Blumy", "", 4, &userConnectedToAp);

    ESP_LOGI("MODE", "Starting webserver");
    httpd_handle_t webserver = start_webserver(resetReasonOta);
    plantfi_configureStaFromPlantstore();

    bool wasBootButtonPressed = false;
    sensors_attach_boot_button_interrupt(&wasBootButtonPressed);
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
        if (wasBootButtonPressed)
        {
            ESP_LOGI("MODE", "Boot button pressed, going to sleep");
            break;
        }
        vTaskDelay(10 / portTICK_PERIOD_MS); // Reset watchdog
    }
    stop_webserver(webserver);
    sensors_detach_boot_button_interrupt();
    sensors_playShutdownSound();
    start_deep_sleep();
}

void watchdog_callback(void *arg)
{
    ESP_LOGE("Watchdog", "Watchdog timeout reached, going to sleep");
    start_deep_sleep();
}

esp_timer_handle_t init_watchdog()
{
    esp_timer_create_args_t watchdog_args = {
        .callback = &watchdog_callback,
        .name = "watchdog",
    };
    esp_timer_handle_t watchdog_timer;
    ESP_ERROR_CHECK(esp_timer_create(&watchdog_args, &watchdog_timer));
    uint64_t watchdog_timeout = DEFAULT_WATCHDOG_TIMEOUT_MS;
    plantstore_getWatchdogTimeoutMs(&watchdog_timeout);

    ESP_LOGI("Watchdog", "Starting watchdog with timeout %llu ms", watchdog_timeout);
    ESP_ERROR_CHECK(esp_timer_start_once(watchdog_timer, watchdog_timeout * 1000));

    return watchdog_timer;
}

void sensor_mode()
{
    ESP_LOGI("MODE", "Starting sensor mode");
    esp_timer_handle_t watchdog_timer = init_watchdog();
    plantfi_initWifiStaOnly();
    plantfi_configureStaFromPlantstore();
    sensors_initSensors();
    sensors_full_data_t sensors_data;
    sensors_full_read(&sensors_data);
    EventBits_t bits;
    ESP_ERROR_CHECK(plantfi_waitForStaConnection(&bits));
    if (bits & PLANTFI_CONNECTED_BIT)
    {
        int8_t rssi = plantfi_getRssi();
        plantfi_send_sensor_data_blumy(&sensors_data, rssi);
        plantfi_send_sensor_data_http(&sensors_data, rssi);
        plantfi_send_sensor_data_mqtt(&sensors_data, rssi);
    }
    else
    {
        ESP_LOGE("WIFI", "Failed to connect to wifi");
    }
    sensors_deinitSensors(); // optional
    ESP_ERROR_CHECK(esp_timer_stop(watchdog_timer));
    start_deep_sleep();
}

void app_main()
{
    bool isConfigured = plantstore_isConfigured();
    bool resetReasonOta = false;
    plantstore_getResetReasonOta(&resetReasonOta);
    if (resetReasonOta)
    {
        plantstore_setResetReasonOta(false);
    }
    bool isManualReset = (esp_reset_reason() == ESP_RST_POWERON ||
                          esp_reset_reason() == ESP_RST_JTAG ||
                          esp_reset_reason() == ESP_RST_SDIO ||
                          esp_reset_reason() == ESP_RST_USB ||
                          resetReasonOta);

    if (isManualReset || !isConfigured)
    {
        configuration_mode(isConfigured, resetReasonOta);
    }
    else
    {
        sensor_mode(); // Never returns
    }
}
