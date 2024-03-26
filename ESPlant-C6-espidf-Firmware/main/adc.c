// Taken from https://github.com/espressif/esp-idf/blob/master/examples/peripherals/adc/oneshot_read/main/oneshot_read_main.c
#pragma once
#include "esp_log.h"
#include "esp_adc/adc_oneshot.h"

#include "config.c"

static int adc_raw[2][10];
static int voltage[2][10];
const static char *TAG = "ADC";
static adc_oneshot_unit_handle_t adc1_handle;
static adc_cali_handle_t adc1_cali_handle = NULL;
static adc_cali_handle_t adc1_cali_handle2 = NULL;

static void adc_calibration_init(adc_unit_t unit, adc_atten_t atten, adc_cali_handle_t *out_handle)
{
    adc_cali_handle_t handle = NULL;

    ESP_LOGI(TAG, "calibration scheme version is %s", "Curve Fitting");
    adc_cali_curve_fitting_config_t cali_config = {
        .unit_id = unit,
        .atten = atten,
        .bitwidth = ADC_BITWIDTH_DEFAULT,
    };
    ESP_ERROR_CHECK(adc_cali_create_scheme_curve_fitting(&cali_config, &handle));

    *out_handle = handle;
}

static void adc_calibration_deinit(adc_cali_handle_t handle)
{
    ESP_LOGI(TAG, "deregister %s calibration scheme", "Curve Fitting");
    ESP_ERROR_CHECK(adc_cali_delete_scheme_curve_fitting(handle));
}

void initAdc()
{
    //-------------ADC1 Init---------------//
    adc_oneshot_unit_init_cfg_t init_config1 = {
        .unit_id = ADC_UNIT_1,
    };
    ESP_ERROR_CHECK(adc_oneshot_new_unit(&init_config1, &adc1_handle));

    //-------------ADC1 Config---------------//
    adc_oneshot_chan_cfg_t config = {
        .bitwidth = ADC_BITWIDTH_DEFAULT,
        .atten = ADC_ATTEN_DB_12,
    };

    adc_oneshot_chan_cfg_t config2 = {
        .bitwidth = ADC_BITWIDTH_DEFAULT,
        .atten = ADC_ATTEN_DB_0,
    };
    ESP_ERROR_CHECK(adc_oneshot_config_channel(adc1_handle, ADC_LIGHT_SENSOR_CHANNEL, &config2));
    ESP_ERROR_CHECK(adc_oneshot_config_channel(adc1_handle, ADC_MOISTURE_SENSOR_CHANNEL, &config));
    ESP_ERROR_CHECK(adc_oneshot_config_channel(adc1_handle, ADC_VOLTAGE_MEASUREMENT_CHANNEL, &config));

    //-------------ADC1 Calibration Init---------------//
    // FOR ESP32-S2
    // ADC_ATTEN_DB_0 100 mV ~ 950 mV
    // ADC_ATTEN_DB_2_5 100 mV ~ 1250 mV
    // ADC_ATTEN_DB_6 150 mV ~ 1750 mV
    // ADC_ATTEN_DB_12 150 mV ~ 2450 mV
    adc_calibration_init(ADC_UNIT_1, ADC_ATTEN_DB_12, &adc1_cali_handle);
    adc_calibration_init(ADC_UNIT_1, ADC_ATTEN_DB_0, &adc1_cali_handle2);
}

static void analogRead(adc_channel_t channel)
{
    adc_unit_t unit = ADC_UNIT_1;
    ESP_ERROR_CHECK(adc_oneshot_read(adc1_handle, channel, &adc_raw[unit][channel]));
    ESP_LOGD(TAG, "ADC%d Channel[%d] Raw Data: %d", unit + 1, channel, adc_raw[unit][channel]);
    if (channel == ADC_LIGHT_SENSOR_CHANNEL)
    {
        ESP_ERROR_CHECK(adc_cali_raw_to_voltage(adc1_cali_handle2, adc_raw[unit][channel], &voltage[unit][channel]));
    }
    else
    {
        ESP_ERROR_CHECK(adc_cali_raw_to_voltage(adc1_cali_handle, adc_raw[unit][channel], &voltage[unit][channel]));
    }
    ESP_LOGD(TAG, "ADC%d Channel[%d] Cali Voltage: %d mV", unit + 1, channel, voltage[unit][channel]);
}

/**
 * @return Raw ADC value in mV
 */
int analogReadVoltage(adc_channel_t channel)
{
    analogRead(channel);
    return voltage[ADC_UNIT_1][channel];
}

int analogReadRaw(adc_channel_t channel)
{
    analogRead(channel);
    return adc_raw[ADC_UNIT_1][channel];
}

static int analogReadAverage(adc_channel_t adcChannel, int numberOfMeasurements, int numberOfThrowaway, int (*readFunction)(adc_channel_t, int, int))
{
    int measurementsTemp[numberOfMeasurements];
    for (int i = 0; i < numberOfMeasurements; i++)
    {
        int measurement = readFunction(adcChannel, 0, 0);
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

/**
 * @brief Read the average analog value of an adc channel over a number of measurements
 * @param adcChannel The ADC channel
 * @param numberOfMeasurements The number of measurements to take in total
 * @param numberOfThrowaway The number of smallest and largest measurements to throw away
 *
 * @return The average voltage in mV
 */
int analogReadAverageVoltage(adc_channel_t adcChannel, int numberOfMeasurements, int numberOfThrowaway)
{
    return analogReadAverage(adcChannel, numberOfMeasurements, numberOfThrowaway, analogReadVoltage);
}

/**
 * @brief Read the average analog value of an adc channel over a number of measurements
 * @param adcChannel The ADC channel
 * @param numberOfMeasurements The number of measurements to take in total
 * @param numberOfThrowaway The number of smallest and largest measurements to throw away
 *
 * @return The average raw value
 */
int analogReadAverageRaw(adc_channel_t adcChannel, int numberOfMeasurements, int numberOfThrowaway)
{
    return analogReadAverage(adcChannel, numberOfMeasurements, numberOfThrowaway, analogReadRaw);
}

void deinitAdc()
{
    ESP_ERROR_CHECK(adc_oneshot_del_unit(adc1_handle));
    adc_calibration_deinit(adc1_cali_handle);
}