#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_log.h"
#include <string.h>
#include "freertos/event_groups.h"
#include "esp_system.h"
#include "esp_wifi.h"
#include "esp_event.h"
#include "nvs_flash.h"
#include "esp_log.h"

#include "lwip/err.h"
#include "lwip/sys.h"

#include "peripherals/sensors.c"
#include "secret.c"
#include "wifi.c"

#define WIFI_MAX_RETRY 1

void app_main()
{
    // Initialize NVS
    esp_err_t ret = nvs_flash_init();
    if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND)
    {
        ESP_ERROR_CHECK(nvs_flash_erase());
        ret = nvs_flash_init();
    }
    ESP_ERROR_CHECK(ret);

    wifi_config_t wifi_config = {
        .sta = {
            .ssid = SECRET_ESP_WIFI_SSID,
            .password = SECRET_ESP_WIFI_PASS,
        },
    };

    wifi_init_sta(&wifi_config, WIFI_MAX_RETRY);
    sensors_initSensors();

    while (1)
    {
        float light_sensor_percentage = sensors_readLightPercentage() * 100;
        float voltage_measurement_value = sensors_readVoltage();
        sensors_aht_data_t aht_data;
        sensors_aht_read_data(&aht_data);
        bool usb_connected = sensors_isUsbConnected();
        sensors_moisture_sensor_output_t output;
        bool measurement_successful = sensors_read_moisture(&output);
        sensors_setRedLedBrightness(0.1);
        sensors_setGreenLedBrightness(0.1);

        // ESP_LOGI("Sensors", "USB: %d, Light: %2.2f, Voltage: %.0f, Temp: %2.2f, Humidity: %2.2f, Moisture: %4d, Humidty_raw: %lu, Temp_raw: %lu",
        //          usb_connected, light_sensor_percentage, voltage_measurement_value, aht_data.temperature, aht_data.humidity, output.measurement, aht_data.humidity_raw, aht_data.temperature_raw);

        printf("%d %2.2f %.0f %2.2f %2.2f %4d %lu %lu\n",
               usb_connected, light_sensor_percentage, voltage_measurement_value, aht_data.temperature, aht_data.humidity, output.measurement, aht_data.humidity_raw, aht_data.temperature_raw);

        vTaskDelay(100 / portTICK_PERIOD_MS);
    }

    sensors_deinitSensors();
}
