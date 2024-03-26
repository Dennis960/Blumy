#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_log.h"

#include "driver/gpio.h"
#include "driver/ledc.h"

#include "adc.c"
#include "aht.c"

// ANALOG INPUT
#define ADC_MOISTURE_SENSOR_CHANNEL ADC_CHANNEL_0     // GPIO 0, LP
#define ADC_LIGHT_SENSOR_CHANNEL ADC_CHANNEL_3        // GPIO 3, LP
#define ADC_VOLTAGE_MEASUREMENT_CHANNEL ADC_CHANNEL_6 // GPIO 6, LP

// DIGITAL INPUT
#define POWER_USB_VIN GPIO_NUM_15

// DIGITAL OUTPUT
#define LIGHT_SENSOR_IN GPIO_NUM_2             // LP
#define LED_RED GPIO_NUM_4                     // LP
#define LED_GREEN GPIO_NUM_5                   // LP
#define MOISTURE_SQUARE_WAVE_SIGNAL GPIO_NUM_7 // LP
#define BUZZER GPIO_NUM_21

// DIGITAL INPUT/OUTPUT
#define LIGHT_SENSOR_SELECT GPIO_NUM_1 // LP
#define VOLTAGE_MEASUREMENT_SELECT GPIO_NUM_14

// I2C
#define TEMPERATURE_SENSOR_SDA GPIO_NUM_22
#define TEMPERATURE_SENSOR_SCL GPIO_NUM_23

// USED FOR PROGRAMMING
// #define USB_DM GPIO_NUM_12
// #define USB_DP GPIO_NUM_13
// #define TXD GPIO_NUM_?
// #define RXD GPIO_NUM_?

void playTone(int frequency, int duration_ms)
{
    // Configure LEDC peripheral
    ledc_timer_config_t ledc_timer = {
        .duty_resolution = LEDC_TIMER_13_BIT,
        .freq_hz = frequency,
        .speed_mode = LEDC_LOW_SPEED_MODE,
        .timer_num = LEDC_TIMER_0};
    ledc_timer_config(&ledc_timer);

    ledc_channel_config_t ledc_channel = {
        .gpio_num = BUZZER,
        .speed_mode = LEDC_LOW_SPEED_MODE,
        .channel = LEDC_CHANNEL_0,
        .intr_type = LEDC_INTR_DISABLE,
        .timer_sel = LEDC_TIMER_0,
        .duty = (1 << LEDC_TIMER_13_BIT) * 50 / 100,
        .hpoint = 0};
    ledc_channel_config(&ledc_channel);

    vTaskDelay(duration_ms / portTICK_PERIOD_MS);

    // Stop LEDC
    ledc_stop(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_0, 0);
}

void setRedLedBrightness(float brightness)
{
    brightness = brightness * brightness;
    if (brightness <= 0)
    {
        ledc_stop(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_1, 0);
        return;
    }
    // Configure LEDC peripheral
    ledc_timer_config_t ledc_timer = {
        .duty_resolution = LEDC_TIMER_13_BIT,
        .freq_hz = 5000,
        .speed_mode = LEDC_LOW_SPEED_MODE,
        .timer_num = LEDC_TIMER_1};
    ledc_timer_config(&ledc_timer);

    ledc_channel_config_t ledc_channel = {
        .gpio_num = LED_RED,
        .speed_mode = LEDC_LOW_SPEED_MODE,
        .channel = LEDC_CHANNEL_1,
        .intr_type = LEDC_INTR_DISABLE,
        .timer_sel = LEDC_TIMER_1,
        .duty = (1 << LEDC_TIMER_13_BIT) * brightness,
        .hpoint = 0};
    ledc_channel_config(&ledc_channel);
}

void setGreenLedBrightness(float brightness)
{
    brightness = brightness * brightness;
    if (brightness <= 0)
    {
        ledc_stop(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_2, 0);
        return;
    }
    // Configure LEDC peripheral
    ledc_timer_config_t ledc_timer = {
        .duty_resolution = LEDC_TIMER_13_BIT,
        .freq_hz = 5000,
        .speed_mode = LEDC_LOW_SPEED_MODE,
        .timer_num = LEDC_TIMER_2};
    ledc_timer_config(&ledc_timer);

    ledc_channel_config_t ledc_channel = {
        .gpio_num = LED_GREEN,
        .speed_mode = LEDC_LOW_SPEED_MODE,
        .channel = LEDC_CHANNEL_2,
        .intr_type = LEDC_INTR_DISABLE,
        .timer_sel = LEDC_TIMER_2,
        .duty = (1 << LEDC_TIMER_13_BIT) * brightness,
        .hpoint = 0};
    ledc_channel_config(&ledc_channel);
}

void enableLightSensor()
{
    gpio_set_level(LIGHT_SENSOR_IN, 1);
    gpio_set_level(LIGHT_SENSOR_SELECT, 0);
}

void disableLightSensor()
{
    gpio_set_level(LIGHT_SENSOR_IN, 0);
    gpio_set_level(LIGHT_SENSOR_SELECT, 0);
}

float readLightPercentage()
{
    enableLightSensor();
    vTaskDelay(20 / portTICK_PERIOD_MS); // Wait for the sensor to stabilize (statistically >10ms is enough)
    int light_sensor_value = analogReadVoltage(ADC_LIGHT_SENSOR_CHANNEL);
    disableLightSensor();
    const int max_value = 3300;
    ESP_LOGI("Light Sensor", "Value: %d", light_sensor_value);
    return light_sensor_value / (float)max_value;
}

void enableVoltageMeasurement()
{
    gpio_set_level(VOLTAGE_MEASUREMENT_SELECT, 0);
}

void disableVoltageMeasurement()
{
    gpio_set_level(VOLTAGE_MEASUREMENT_SELECT, 1);
}

float readVoltage()
{
    enableVoltageMeasurement();
    int voltage = analogReadVoltage(ADC_VOLTAGE_MEASUREMENT_CHANNEL);
    disableVoltageMeasurement();
    const int r1 = 5100;
    const int r2 = 2000;
    return voltage * (r1 + r2) / r2;
}

bool isUsbConnected()
{
    return gpio_get_level(POWER_USB_VIN);
}

void app_main()
{
    // Set digital output pins
    gpio_config_t io_conf = {
        .mode = GPIO_MODE_OUTPUT,
        .intr_type = GPIO_INTR_DISABLE,
        .pin_bit_mask = (1ULL << LIGHT_SENSOR_IN) |
                        (1ULL << LIGHT_SENSOR_SELECT) |
                        (1ULL << VOLTAGE_MEASUREMENT_SELECT) |
                        (1ULL << LED_RED) |
                        (1ULL << LED_GREEN) |
                        (1ULL << MOISTURE_SQUARE_WAVE_SIGNAL) |
                        (1ULL << BUZZER)};
    ESP_ERROR_CHECK(gpio_config(&io_conf));
    disableVoltageMeasurement();

    // Set digital input pins
    io_conf.mode = GPIO_MODE_INPUT;
    io_conf.pull_up_en = GPIO_PULLUP_ENABLE;
    io_conf.pin_bit_mask = (1ULL << POWER_USB_VIN);
    ESP_ERROR_CHECK(gpio_config(&io_conf));

    initAdc();
    initAht(TEMPERATURE_SENSOR_SDA, TEMPERATURE_SENSOR_SCL);

    while (1)
    {
        float light_sensor_percentage = readLightPercentage();
        ESP_LOGI("Light Sensor", "Percentage: %.2f%%", 100 * light_sensor_percentage);
        float voltage_measurement_value = readVoltage();
        ESP_LOGI("Voltage Measurement", "Value: %.2f", voltage_measurement_value);
        aht_data_t data;
        aht_read_data(&data);
        ESP_LOGI("Temperature", "Value: %.2f", data.temperature);
        ESP_LOGI("Humidity", "Value: %.2f", data.humidity);
        bool usb_connected = isUsbConnected();
        ESP_LOGI("USB", "Connected: %s", usb_connected ? "true" : "false");

        setRedLedBrightness(0.1);
        setGreenLedBrightness(0.1);
        vTaskDelay(1000 / portTICK_PERIOD_MS);
        setRedLedBrightness(0.5);
        setGreenLedBrightness(0.5);
        vTaskDelay(1000 / portTICK_PERIOD_MS);
        setRedLedBrightness(0);
        setGreenLedBrightness(0);
        // int frequency = 1000;
        // int duration_ms = 100;
        // playTone(frequency, duration_ms);

        vTaskDelay(1000 / portTICK_PERIOD_MS);
    }

    deinitAdc();
    deinitAht();
}
