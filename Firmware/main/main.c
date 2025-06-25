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

void wait_until_boot_button_released()
{
    ESP_LOGI("BOOT", "Waiting for boot button to be released");
    while (sensors_isBootButtonPressed())
    {
        vTaskDelay(10 / portTICK_PERIOD_MS); // Reset watchdog
    }
    ESP_LOGI("BOOT", "Boot button released");
}

void start_deep_sleep()
{
    uint64_t sleepTime = DEFAULT_SENSOR_TIMEOUT_SLEEP_MS;
    plantstore_getSensorTimeoutSleepMs(&sleepTime);
    sleepTime *= 1000;
    ESP_LOGI("DeepSleep", "Going to sleep for %llu us", sleepTime);
    wait_until_boot_button_released(); // Having the button pressed during deep sleep can cause issues on wakeup
    esp_deep_sleep(sleepTime);
}

bool isStaConnectionFresh = true;
bool isStaConnectingFresh = true;
uint8_t ledBrightness = DEFAULT_LED_BRIGHTNESS;
void handleLedsForWifiEvents()
{
    bool staConnected = plantfi_is_sta_connected() && isStaConnectionFresh;
    bool staDisconnected = !plantfi_is_sta_connected() && !isStaConnectionFresh;
    bool staStartedConnecting = plantfi_is_sta_connecting() && isStaConnectingFresh;
    bool staStoppedConnecting = !plantfi_is_sta_connecting() && !isStaConnectingFresh;

    if (staStartedConnecting)
    {
        isStaConnectingFresh = false;
        sensors_blinkLedYellowAsync(0, 500, ledBrightness);
    }
    if (staStoppedConnecting)
    {
        isStaConnectingFresh = true;
        if (!plantfi_is_sta_connected())
        {
            sensors_setLedRedBrightness(ledBrightness);
        }
    }
    if (staConnected)
    {
        isStaConnectionFresh = false;
        sensors_setLedGreenBrightness(ledBrightness);
    }
    if (staDisconnected)
    {
        isStaConnectionFresh = true;
    }
}

void configuration_mode()
{
    bool isConfigured = plantstore_isConfigured();
    ESP_LOGI("MODE", "Starting configuration mode%s", isConfigured ? " (sensor is configured)" : " (no config)");
    sensors_initSensors();
    plantstore_getLedBrightness(&ledBrightness);
    sensors_setLedRedBrightness(ledBrightness);
    sensors_playStartupSound();
    plantfi_setEnableNatAndDnsOnConnect(true);
    plantfi_initWifiApSta();
    uint64_t start_time = esp_timer_get_time();
    uint64_t current_time = start_time;
    int32_t timeoutMs = DEFAULT_CONFIGURATION_MODE_TIMEOUT_MS;
    plantstore_getConfigurationModeTimeoutMs(&timeoutMs);
    plantfi_configureAp("Blumy", "", 4);

    ESP_LOGI("MODE", "Starting webserver");
    httpd_handle_t webserver = start_webserver();
    plantfi_configureStaFromPlantstore();
    sensors_blinkLedGreenAsync(0, 500, ledBrightness);

    while (1)
    {
        if (isConfigured && !plantfi_is_user_connected_to_ap())
        {
            current_time = esp_timer_get_time();
            if (current_time - start_time > timeoutMs * 1000)
            {
                ESP_LOGI("MODE", "Timeout reached, going to sleep");
                break;
            }
        }
        if (sensors_isBootButtonPressed())
        {
            ESP_LOGI("MODE", "Boot button pressed, going to sleep");
            break;
        }
        handleLedsForWifiEvents();
        vTaskDelay(10 / portTICK_PERIOD_MS); // Reset watchdog
    }
    stop_webserver(webserver);
    sensors_playShutdownSound();
    sensors_blinkLedGreenAsync(0, 0, ledBrightness);
    sensors_blinkLedYellowAsync(0, 0, ledBrightness);
    sensors_setLedGreenBrightness(0.0);
    sensors_blinkLedRed(3, 100, ledBrightness);
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
    // Reset button and inserting batteries is both ESP_RST_POWERON
    bool isManualReset = (esp_reset_reason() == ESP_RST_POWERON ||
                          esp_reset_reason() == ESP_RST_JTAG ||
                          esp_reset_reason() == ESP_RST_SDIO ||
                          esp_reset_reason() == ESP_RST_USB);

    if (isManualReset)
    {
        configuration_mode();
    }
    else
    {
        sensor_mode(); // Never returns
    }
}
