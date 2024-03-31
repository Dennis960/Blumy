#pragma once

#include "esp_adc/adc_oneshot.h"

void adc_initAdc();
/**
 * @return Raw ADC value in mV
 */
int adc_analogReadVoltage(adc_channel_t channel);
int adc_analogReadRaw(adc_channel_t channel);
/**
 * @brief Read the average analog value of an adc channel over a number of measurements
 * @param adcChannel The ADC channel
 * @param numberOfMeasurements The number of measurements to take in total
 * @param numberOfThrowaway The number of smallest and largest measurements to throw away
 *
 * @return The average voltage in mV
 */
int adc_analogReadAverageVoltage(adc_channel_t adcChannel, int numberOfMeasurements, int numberOfThrowaway);
/**
 * @brief Read the average analog value of an adc channel over a number of measurements
 * @param adcChannel The ADC channel
 * @param numberOfMeasurements The number of measurements to take in total
 * @param numberOfThrowaway The number of smallest and largest measurements to throw away
 *
 * @return The average raw value
 */
int adc_analogReadAverageRaw(adc_channel_t adcChannel, int numberOfMeasurements, int numberOfThrowaway);
void adc_deinitAdc();