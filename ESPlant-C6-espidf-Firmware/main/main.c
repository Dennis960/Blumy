#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_log.h"

#include "peripherals/sensors.c"

void app_main()
{
    sensors_initSensors();

    while (1)
    {
        float light_sensor_percentage = sensors_readLightPercentage();
        ESP_LOGI("Light Sensor", "Percentage: %.2f%%", 100 * light_sensor_percentage);
        float voltage_measurement_value = sensors_readVoltage();
        ESP_LOGI("Voltage Measurement", "Value: %.2f", voltage_measurement_value);
        sensors_aht_data_t data;
        sensors_aht_read_data(&data);
        ESP_LOGI("Temperature", "Value: %.2f", data.temperature);
        ESP_LOGI("Humidity", "Value: %.2f", data.humidity);
        bool usb_connected = sensors_isUsbConnected();
        ESP_LOGI("USB", "Connected: %s", usb_connected ? "true" : "false");
        sensors_moisture_sensor_output_t output;
        bool measurement_successful = sensors_read_moisture(&output);
        ESP_LOGI("Moisture", "Measurement successful: %s", measurement_successful ? "true" : "false");
        ESP_LOGI("Moisture", "Value: %4d", output.measurement);
        ESP_LOGI("Moisture", "Stabilization time: %lu", output.stabilization_time);

        sensors_setRedLedBrightness(0.1);
        sensors_setGreenLedBrightness(0.1);
        vTaskDelay(1000 / portTICK_PERIOD_MS);
        sensors_setRedLedBrightness(0.5);
        sensors_setGreenLedBrightness(0.5);
        vTaskDelay(1000 / portTICK_PERIOD_MS);
        sensors_setRedLedBrightness(0);
        sensors_setGreenLedBrightness(0);

        // int frequency = 1000;
        // int duration_ms = 100;
        // sensors_playToneAsync(frequency, duration_ms);

        vTaskDelay(100 / portTICK_PERIOD_MS);
    }

    sensors_deinitSensors();
}
