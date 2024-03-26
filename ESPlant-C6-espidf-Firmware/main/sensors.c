#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/gpio.h"
#include "driver/ledc.h"
#include "esp_timer.h"

#include "adc.c"
#include "config.c"

const static unsigned long maxStabilizationTime = 500;
const static int stabilizationDifference = 5;

typedef struct
{
    unsigned long stabilization_time;
    int measurement;
} moisture_sensor_output_t;

unsigned long millis()
{
    return esp_timer_get_time() / 1000;
}

static bool measure_stabilized_output(moisture_sensor_output_t *output)
{
    const int numberOfMeasurements = 5;
    unsigned long measurementStartTime = millis();
    unsigned long stabilization_time;
    while (true)
    {
        int min = 4096; // TODO figure out what the max value is, it is not 4096
        int max = 0;
        int sum = 0;
        for (int i = 0; i < numberOfMeasurements; i++)
        {
            int measurement = analogReadAverageVoltage(ADC_MOISTURE_SENSOR_CHANNEL, 100, 10);
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
            output->stabilization_time = stabilization_time;
            output->measurement = mean;
            return true;
        }
        if (millis() - measurementStartTime > maxStabilizationTime)
        {
            output->stabilization_time = maxStabilizationTime;
            output->measurement = mean;
            return false;
        }
        vTaskDelay(1);
    }
}

static void setupMoistureSensor(long frequency, int dutyCycle)
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

static void resetToZero()
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

static void stopMoistureSensor()
{
    ledc_stop(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_3, 0);
}

bool read_moisture(moisture_sensor_output_t *output)
{
    resetToZero();
    setupMoistureSensor(12800, 6);
    if (measure_stabilized_output(output))
    {
        return true;
    }
    return -1;
}