#pragma once

#include "freertos/FreeRTOS.h"
#include "driver/gpio.h"
#include "driver/ledc.h"
#include "esp_adc/adc_oneshot.h"

typedef enum
{
    SENSOR_TYPE_ACONTIUM = 0,
    SENSOR_TYPE_BELLIS = 1,
} blumy_type_t;

typedef struct
{
    // ANALOG INPUT
    gpio_num_t ADC_MOISTURE_SENSOR;
    adc_channel_t ADC_MOISTURE_SENSOR_CHANNEL;
    adc_channel_t ADC_LIGHT_SENSOR_CHANNEL;
    adc_channel_t ADC_VOLTAGE_MEASUREMENT_CHANNEL;

    // DIGITAL OUTPUT
    gpio_num_t LIGHT_SENSOR_IN;
    gpio_num_t LED_RED;
    gpio_num_t LED_GREEN;
    gpio_num_t MOISTURE_SQUARE_WAVE_SIGNAL;
    gpio_num_t BUZZER;

    // BOOT BUTTON
    gpio_num_t BOOT_BUTTON;

    // LEDC CHANNELS
    ledc_channel_t BUZZER_CHANNEL;
    ledc_channel_t LED_RED_CHANNEL;
    ledc_channel_t LED_GREEN_CHANNEL;
    ledc_channel_t MOISTURE_SQUARE_WAVE_SIGNAL_CHANNEL;

    // DIGITAL INPUT/OUTPUT
    gpio_num_t LIGHT_SENSOR_SELECT;
    gpio_num_t VOLTAGE_MEASUREMENT_SELECT;

    // I2C
    gpio_num_t TEMPERATURE_SENSOR_SDA;
    gpio_num_t TEMPERATURE_SENSOR_SCL;
} config_t;

extern const config_t CONFIG_ACONTIUM;

extern const config_t CONFIG_BELLIS;

extern config_t blumy_config;

/**
 * @brief Set the configuration based on the sensor type
 * @param sensor_type The type of sensor
 */
void set_config(blumy_type_t sensor_type);
