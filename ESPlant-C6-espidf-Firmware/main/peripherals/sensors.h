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
    bool is_usb_connected;
    int moisture_measurement;
    unsigned long moisture_stabilization_time;
    bool moisture_measurement_successful;
    unsigned long humidity_raw;
    unsigned long temperature_raw;
} sensors_full_data_t;

void sensors_playToneAsync(int frequency, int duration_ms);
void sensors_playToneSync(int frequency, int duration_ms);
void sensors_setRedLedBrightness(float brightness);
void sensors_setGreenLedBrightness(float brightness);
/**
 * @return Light percentage (0.0 to 1.0)
 */
float sensors_readLightPercentage();
float sensors_readVoltage();
bool sensors_isUsbConnected();
void sensors_aht_read_data(sensors_aht_data_t *data);
bool sensors_read_moisture(sensors_moisture_sensor_output_t *output);
void sensors_initSensors();
void sensors_deinitSensors();
void sensors_full_read(sensors_full_data_t *data);