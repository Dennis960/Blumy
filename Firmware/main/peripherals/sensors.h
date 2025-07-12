#pragma once

#include "freertos/FreeRTOS.h"

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
    int moisture_measurement;
    unsigned long moisture_stabilization_time;
    bool moisture_measurement_successful;
    unsigned long humidity_raw;
    unsigned long temperature_raw;
} sensors_full_data_t;

void sensors_playToneAsync(int frequency, int duration_ms);
void sensors_playToneSync(int frequency, int duration_ms);
void sensors_setLedRedBrightness(uint8_t brightness);
void sensors_setLedGreenBrightness(uint8_t brightness);
void sensors_setLedYellowBrightness(uint8_t brightness);
/**
 * Blink the red LED synchronously
 * @param times Number of times to blink. If times is 0, it will blink indefinitely.
 * @param duration_ms Duration of each blink in milliseconds and duration between blinks.
 * @param brightness Brightness of the LED (0.0 to 1.0)
 */
void sensors_blinkLedRed(int times, int duration_ms, uint8_t brightness);
/** * Blink the green LED synchronously
 * @param times Number of times to blink. If times is 0, it will blink indefinitely.
 * @param duration_ms Duration of each blink in milliseconds and duration between blinks.
 * @param brightness Brightness of the LED (0.0 to 1.0)
 */
void sensors_blinkLedGreen(int times, int duration_ms, uint8_t brightness);
/**
 * Blink the red LED asynchronously
 * @param times Number of times to blink. If times is 0, it will blink indefinitely until stopped.
 * @param duration_ms Duration of each blink in milliseconds and duration between blinks. If 0, blinking will stop and the LED will be turned off.
 * @param brightness Brightness of the LED (0.0 to 1.0)
 */
void sensors_blinkLedRedAsync(int times, int duration_ms, uint8_t brightness);
/**
 * Blink the green LED asynchronously
 * @param times Number of times to blink. If times is 0, it will blink indefinitely until stopped.
 * @param duration_ms Duration of each blink in milliseconds and duration between blinks. If 0, blinking will stop and the LED will be turned off.
 * @param brightness Brightness of the LED (0.0 to 1.0)
 */
void sensors_blinkLedGreenAsync(int times, int duration_ms, uint8_t brightness);
/**
 * Blink the red and green LEDs asynchronously
 * @param times Number of times to blink. If times is 0, it will blink indefinitely until stopped.
 * @param duration_ms Duration of each blink in milliseconds and duration between blinks. If 0, blinking will stop and the LEDs will be turned off.
 * @param brightness Brightness of the LED (0.0 to 1.0)
 */
void sensors_blinkLedYellowAsync(int times, int duration_ms, uint8_t brightness);
/**
 * @return Light percentage (0.0 to 1.0)
 */
float sensors_readLightPercentage();
float sensors_readVoltage();
void sensors_aht_read_data(sensors_aht_data_t *data);
bool sensors_read_moisture(sensors_moisture_sensor_output_t *output);
/**
 * Calculate the moisture percentage based on the raw measurement.
 * 
 * @param measurement The raw measurement from the moisture sensor.
 * @return Moisture percentage (0.0 to 100.0, dry = 0%, wet = 100%)
 */
float sensors_convert_moisture_measurement_to_percentage(int measurement);
void sensors_initSensors();
void sensors_deinitSensors();
void sensors_full_read(sensors_full_data_t *data);
void sensors_playStartupSound();
void sensors_playShutdownSound();
bool sensors_isBootButtonPressed();
