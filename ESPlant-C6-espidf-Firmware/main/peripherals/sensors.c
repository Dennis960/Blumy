#pragma once

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/gpio.h"
#include "driver/ledc.h"
#include "esp_timer.h"
#include "driver/i2c.h"
#include "aht20.h"

#include "adc.c"
#include "config.c"

const static unsigned long maxStabilizationTime = 500;
const static int stabilizationDifference = 5;

typedef struct
{
    unsigned long stabilization_time;
    int measurement;
} sensors_moisture_sensor_output_t;

typedef struct
{
    uint32_t temperature_raw;
    uint32_t humidity_raw;
    float temperature;
    float humidity;
} sensors_aht_data_t;

typedef struct
{
    float light;
    float voltage;
    float temperature;
    float humidity;
    bool is_usb_connected;
    int moisture_measurement;
    unsigned long moisture_stabilization_time;
    bool moisture_measurement_successful;
    unsigned long humidity_raw;
    unsigned long temperature_raw;
} sensors_full_data_t;

static unsigned long millis()
{
    return esp_timer_get_time() / 1000;
}

static bool ledc_initialized[LEDC_CHANNEL_MAX] = {false};

/**
 * @param duty_cycle Duty cycle in percentage (0.0 to 1.0)
 */
static void analogWrite(int gpio, int frequency, float duty_cycle, ledc_channel_t channel)
{
    if (duty_cycle <= 0)
    {
        if (ledc_initialized[channel])
        {
            ledc_stop(LEDC_LOW_SPEED_MODE, channel, 0);
        }
        return;
    }
    else if (!ledc_initialized[channel])
    {
        ledc_initialized[channel] = true;
    }
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
    ledc_timer_config_t ledc_timer = {
        .duty_resolution = duty_resolution,
        .freq_hz = frequency,
        .speed_mode = LEDC_LOW_SPEED_MODE,
        .timer_num = LEDC_TIMER_0};
    ESP_ERROR_CHECK(ledc_timer_config(&ledc_timer));

    ledc_channel_config_t ledc_channel = {
        .gpio_num = gpio,
        .speed_mode = LEDC_LOW_SPEED_MODE,
        .channel = channel,
        .intr_type = LEDC_INTR_DISABLE,
        .timer_sel = LEDC_TIMER_0,
        .duty = (1 << duty_resolution) * duty_cycle,
        .hpoint = 0};
    ESP_ERROR_CHECK(ledc_channel_config(&ledc_channel));
}

static TimerHandle_t toneTimer;
static void buzzerOffCallback(TimerHandle_t xTimer)
{
    analogWrite(BUZZER, 0, 0, BUZZER_CHANNEL);
}
void sensors_playToneAsync(int frequency, int duration_ms)
{
    analogWrite(BUZZER, frequency, 0.5, BUZZER_CHANNEL);

    if (toneTimer == NULL)
    {
        toneTimer = xTimerCreate("ToneTimer", pdMS_TO_TICKS(duration_ms), pdFALSE, NULL, buzzerOffCallback);
    }
    else
    {
        xTimerChangePeriod(toneTimer, pdMS_TO_TICKS(duration_ms), 0);
    }
    xTimerStart(toneTimer, 0);
}
void sensors_playToneSync(int frequency, int duration_ms)
{
    analogWrite(BUZZER, frequency, 0.5, BUZZER_CHANNEL);
    vTaskDelay(duration_ms / portTICK_PERIOD_MS);
    analogWrite(BUZZER, 0, 0, BUZZER_CHANNEL);
}

void sensors_setRedLedBrightness(float brightness)
{
    analogWrite(LED_RED, 5000, brightness * brightness, LED_RED_CHANNEL);
}

void sensors_setGreenLedBrightness(float brightness)
{
    analogWrite(LED_GREEN, 5000, brightness * brightness, LED_GREEN_CHANNEL);
}

static void enableLightSensor()
{
    gpio_set_level(LIGHT_SENSOR_IN, 1);
}

static void disableLightSensor()
{
    gpio_set_level(LIGHT_SENSOR_IN, 0);
}

/**
 * @return Light percentage (0.0 to 1.0)
 */
float sensors_readLightPercentage()
{
    enableLightSensor();
    vTaskDelay(20 / portTICK_PERIOD_MS); // Wait for the sensor to stabilize (statistically >10ms is enough)
    int light_sensor_value = adc_analogReadAverageRaw(ADC_LIGHT_SENSOR_CHANNEL, 20, 5);
    disableLightSensor();
    const int max_value = 4095;
    return light_sensor_value / (float)max_value;
}

static void enableVoltageMeasurement()
{
    gpio_set_level(VOLTAGE_MEASUREMENT_SELECT, 0);
}

static void disableVoltageMeasurement()
{
    gpio_set_level(VOLTAGE_MEASUREMENT_SELECT, 1);
}

float sensors_readVoltage()
{
    enableVoltageMeasurement();
    int voltage = adc_analogReadAverageVoltage(ADC_VOLTAGE_MEASUREMENT_CHANNEL, 10, 3);
    disableVoltageMeasurement();
    const int r1 = 5100;
    const int r2 = 2000;
    return voltage * (r1 + r2) / (float)r2 / (float)1000;
}

bool sensors_isUsbConnected()
{
    return gpio_get_level(POWER_USB_VIN);
}

static aht20_dev_handle_t aht_handle = NULL;

static void configureI2cBus(int sda, int scl)
{
    i2c_config_t conf = {
        .mode = I2C_MODE_MASTER,
        .sda_io_num = sda,
        .sda_pullup_en = GPIO_PULLUP_ENABLE,
        .scl_io_num = scl,
        .scl_pullup_en = GPIO_PULLUP_ENABLE,
        .master.clk_speed = 100000,
        .clk_flags = 0,
    };
    ESP_ERROR_CHECK(i2c_param_config(I2C_NUM_0, &conf));
    ESP_ERROR_CHECK(i2c_driver_install(I2C_NUM_0, conf.mode, 0, 0, 0));
}

static void initAht(int sda, int scl)
{
    configureI2cBus(sda, scl);
    aht20_i2c_config_t i2c_config = {
        .i2c_addr = AHT20_ADDRRES_0,
        .i2c_port = I2C_NUM_0,
    };
    ESP_ERROR_CHECK(aht20_new_sensor(&i2c_config, &aht_handle));
}

void sensors_aht_read_data(sensors_aht_data_t *data)
{
    uint32_t temperature_raw, humidity_raw;
    float temperature, humidity;
    ESP_ERROR_CHECK(aht20_read_temperature_humidity(aht_handle, &temperature_raw, &temperature, &humidity_raw, &humidity));
    data->temperature_raw = temperature_raw;
    data->humidity_raw = humidity_raw;
    data->temperature = temperature;
    data->humidity = humidity;
}

static void deinitAht()
{
    ESP_ERROR_CHECK(aht20_del_sensor(aht_handle));
    ESP_ERROR_CHECK(i2c_driver_delete(I2C_NUM_0));
}

// Moisture sensor
static bool measure_stabilized_output(sensors_moisture_sensor_output_t *output)
{
    const int numberOfMeasurements = 5;
    unsigned long measurementStartTime = millis();
    unsigned long stabilization_time;
    while (true)
    {
        int min = 10000;
        int max = 0;
        int sum = 0;
        for (int i = 0; i < numberOfMeasurements; i++)
        {
            int measurement = adc_analogReadAverageRaw(ADC_MOISTURE_SENSOR_CHANNEL, 100, 10);
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

/**
 * @param dutyCycle Duty cycle (0 to 255)
 */
static void setupMoistureSensor(long frequency, int dutyCycle)
{
    analogWrite(MOISTURE_SQUARE_WAVE_SIGNAL, frequency, dutyCycle / 255.0, MOISTURE_SQUARE_WAVE_SIGNAL_CHANNEL);
}

static void resetToZero()
{
    int strength = 1;
    int analogValue = adc_analogReadVoltage(ADC_MOISTURE_SENSOR_CHANNEL);
    analogWrite(MOISTURE_SQUARE_WAVE_SIGNAL, 0, 0, MOISTURE_SQUARE_WAVE_SIGNAL_CHANNEL);
    while (analogValue > 0 && strength <= 256)
    {
        ESP_ERROR_CHECK(gpio_set_direction(ADC_MOISTURE_SENSOR, GPIO_MODE_OUTPUT));
        ESP_ERROR_CHECK(gpio_set_level(ADC_MOISTURE_SENSOR, 0));

        vTaskDelay(strength / portTICK_PERIOD_MS);
        strength *= 2;
        ESP_ERROR_CHECK(gpio_set_direction(ADC_MOISTURE_SENSOR, GPIO_MODE_INPUT));

        // wait until the output is 0 again
        analogValue = adc_analogReadVoltage(ADC_MOISTURE_SENSOR_CHANNEL);
    }
}

static void stopMoistureSensor()
{
    ledc_stop(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_3, 0);
}

bool sensors_read_moisture(sensors_moisture_sensor_output_t *output)
{
    resetToZero();
    setupMoistureSensor(12800, 2);
    bool success = measure_stabilized_output(output);
    stopMoistureSensor();
    return success;
}

// End moisture sensor

void sensors_initSensors()
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
    gpio_set_level(LIGHT_SENSOR_SELECT, 0);
    disableVoltageMeasurement();

    // Set digital input pins
    io_conf.mode = GPIO_MODE_INPUT;
    io_conf.pull_up_en = GPIO_PULLUP_DISABLE;
    io_conf.pin_bit_mask = (1ULL << POWER_USB_VIN);
    ESP_ERROR_CHECK(gpio_config(&io_conf));

    adc_initAdc();
    initAht(TEMPERATURE_SENSOR_SDA, TEMPERATURE_SENSOR_SCL);
}

void sensors_deinitSensors()
{
    adc_deinitAdc();
    deinitAht();
    stopMoistureSensor();
    if (toneTimer != NULL)
    {
        xTimerDelete(toneTimer, 0);
    }
}

void sensors_full_read(sensors_full_data_t *data)
{
    data->light = sensors_readLightPercentage();
    data->voltage = sensors_readVoltage();
    sensors_aht_data_t aht_data;
    sensors_aht_read_data(&aht_data); // For performance, this could be done in parallel as it does a delay of 100 ms
    data->temperature = aht_data.temperature;
    data->humidity = aht_data.humidity;
    data->temperature_raw = aht_data.temperature_raw;
    data->humidity_raw = aht_data.humidity_raw;
    data->is_usb_connected = sensors_isUsbConnected();
    sensors_moisture_sensor_output_t moisture_sensor_output;
    data->moisture_measurement_successful = sensors_read_moisture(&moisture_sensor_output);
    data->moisture_measurement = moisture_sensor_output.measurement;
    data->moisture_stabilization_time = moisture_sensor_output.stabilization_time;
}
