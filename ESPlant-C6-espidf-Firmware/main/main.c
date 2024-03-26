#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_log.h"
#include "esp_timer.h"

#include "driver/gpio.h"
#include "driver/ledc.h"

#include "adc.c"
#include "aht.c"

// ANALOG INPUT
#define ADC_MOISTURE_SENSOR GPIO_NUM_0
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
    ESP_ERROR_CHECK(ledc_timer_config(&ledc_timer));

    ledc_channel_config_t ledc_channel = {
        .gpio_num = BUZZER,
        .speed_mode = LEDC_LOW_SPEED_MODE,
        .channel = LEDC_CHANNEL_0,
        .intr_type = LEDC_INTR_DISABLE,
        .timer_sel = LEDC_TIMER_0,
        .duty = (1 << LEDC_TIMER_13_BIT) * 50 / 100,
        .hpoint = 0};
    ESP_ERROR_CHECK(ledc_channel_config(&ledc_channel));

    vTaskDelay(duration_ms / portTICK_PERIOD_MS);

    // Stop LEDC
    ESP_ERROR_CHECK(ledc_stop(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_0, 0));
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
        .timer_num = LEDC_TIMER_0};
    ESP_ERROR_CHECK(ledc_timer_config(&ledc_timer));

    ledc_channel_config_t ledc_channel = {
        .gpio_num = LED_RED,
        .speed_mode = LEDC_LOW_SPEED_MODE,
        .channel = LEDC_CHANNEL_1,
        .intr_type = LEDC_INTR_DISABLE,
        .timer_sel = LEDC_TIMER_0,
        .duty = (1 << LEDC_TIMER_13_BIT) * brightness,
        .hpoint = 0};
    ESP_ERROR_CHECK(ledc_channel_config(&ledc_channel));
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
        .timer_num = LEDC_TIMER_0};
    ESP_ERROR_CHECK(ledc_timer_config(&ledc_timer));

    ledc_channel_config_t ledc_channel = {
        .gpio_num = LED_GREEN,
        .speed_mode = LEDC_LOW_SPEED_MODE,
        .channel = LEDC_CHANNEL_2,
        .intr_type = LEDC_INTR_DISABLE,
        .timer_sel = LEDC_TIMER_0,
        .duty = (1 << LEDC_TIMER_13_BIT) * brightness,
        .hpoint = 0};
    ESP_ERROR_CHECK(ledc_channel_config(&ledc_channel));
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

const unsigned long maxStabilizationTime = 500;
const int stabilizationDifference = 5;
unsigned long stabilization_time;
int output;

unsigned long millis()
{
    return esp_timer_get_time() / 1000;
}

void setupMoistureSensor(long frequency, int dutyCycle)
{
    ledc_timer_bit_t duty_resolution = LEDC_TIMER_13_BIT;
    if (frequency < 1000)
    {
        duty_resolution = LEDC_TIMER_10_BIT;
    }
    else if (frequency < 10000)
    {
        duty_resolution = LEDC_TIMER_9_BIT;
    }
    else if (frequency < 100000)
    {
        duty_resolution = LEDC_TIMER_7_BIT;
    }
    else if (frequency < 1000000)
    {
        duty_resolution = LEDC_TIMER_5_BIT;
    }
    else
    {
        duty_resolution = LEDC_TIMER_3_BIT;
    }
    // Configure LEDC peripheral
    ledc_timer_config_t ledc_timer = {
        .duty_resolution = duty_resolution,
        .freq_hz = frequency,
        .speed_mode = LEDC_LOW_SPEED_MODE,
        .timer_num = LEDC_TIMER_0};
    ESP_ERROR_CHECK(ledc_timer_config(&ledc_timer));

    ledc_channel_config_t ledc_channel = {
        .gpio_num = MOISTURE_SQUARE_WAVE_SIGNAL,
        .speed_mode = LEDC_LOW_SPEED_MODE,
        .channel = LEDC_CHANNEL_3,
        .intr_type = LEDC_INTR_DISABLE,
        .timer_sel = LEDC_TIMER_0,
        .duty = (1 << duty_resolution) * (dutyCycle / (float)255),
        .hpoint = 0};
    ESP_ERROR_CHECK(ledc_channel_config(&ledc_channel));
}

void resetToZero()
{
    int strength = 1;
    int analogValue = analogReadVoltage(ADC_MOISTURE_SENSOR_CHANNEL);
    ledc_stop(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_3, 0);
    while (analogValue > 0 && strength <= 256)
    {
        ESP_ERROR_CHECK(gpio_set_direction(ADC_MOISTURE_SENSOR, GPIO_MODE_OUTPUT));
        ESP_ERROR_CHECK(gpio_set_level(ADC_MOISTURE_SENSOR, 0));

        vTaskDelay(strength / portTICK_PERIOD_MS);
        strength *= 2;
        ESP_ERROR_CHECK(gpio_set_direction(ADC_MOISTURE_SENSOR, GPIO_MODE_INPUT));

        // wait until the output is 0 again
        analogValue = analogReadVoltage(ADC_MOISTURE_SENSOR_CHANNEL);
    }
}

void stopMoistureSensor()
{
    ledc_stop(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_3, 0);
}

int measure(int numberOfMeasurements, int numberOfThrowaway)
{
    int measurementsTemp[numberOfMeasurements];
    for (int i = 0; i < numberOfMeasurements; i++)
    {
        int measurement = analogReadVoltage(ADC_MOISTURE_SENSOR_CHANNEL);
        ESP_LOGI("Moisture", "Mini-Measurement: %d", measurement);
        // insert sorted
        int j = i;
        while (j > 0 && measurementsTemp[j - 1] > measurement)
        {
            measurementsTemp[j] = measurementsTemp[j - 1];
            j--;
        }
        measurementsTemp[j] = measurement;
    }
    // calculate the mean of median measurements
    long measurement = 0;
    for (int i = numberOfThrowaway; i < numberOfMeasurements - numberOfThrowaway; i++)
    {
        measurement += measurementsTemp[i];
    }
    measurement /= numberOfMeasurements - 2 * numberOfThrowaway;
    return measurement;
}

bool measureStabilizedOutput()
{
    const int numberOfMeasurements = 5;
    unsigned long measurementStartTime = millis();
    while (true)
    {
        int min = 4096;
        int max = 0;
        int sum = 0;
        for (int i = 0; i < numberOfMeasurements; i++)
        {
            int measurement = measure(100, 10);
            ESP_LOGI("Moisture", "Measurement: %d", measurement);
            if (measurement < min)
            {
                min = measurement;
            }
            if (measurement > max)
            {
                max = measurement;
            }
            sum += measurement;
        }
        int mean = sum / numberOfMeasurements;
        int difference = max - min;
        if (difference < stabilizationDifference)
        {
            stabilization_time = millis() - measurementStartTime;
            output = mean;
            return true;
        }
        if (millis() - measurementStartTime > maxStabilizationTime)
        {
            output = mean;
            stabilization_time = maxStabilizationTime;
            return false;
        }
        vTaskDelay(1);
    }
}

int readMoisture()
{
    // resetToZero();
    setupMoistureSensor(12800, 6);
    if (measureStabilizedOutput())
    {
        return output;
    }
    return -1;
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
        int moisture = readMoisture();
        ESP_LOGI("Moisture", "Value: %d", moisture);

        // setRedLedBrightness(0.1);
        // setGreenLedBrightness(0.1);
        // vTaskDelay(1000 / portTICK_PERIOD_MS);
        // setRedLedBrightness(0.5);
        // setGreenLedBrightness(0.5);
        // vTaskDelay(1000 / portTICK_PERIOD_MS);
        // setRedLedBrightness(0);
        // setGreenLedBrightness(0);

        // int frequency = 1000;
        // int duration_ms = 100;
        // playTone(frequency, duration_ms);

        vTaskDelay(1000 / portTICK_PERIOD_MS);
    }

    deinitAdc();
    deinitAht();
}
