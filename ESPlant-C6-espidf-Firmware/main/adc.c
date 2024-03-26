// Taken from https://github.com/espressif/esp-idf/blob/master/examples/peripherals/adc/oneshot_read/main/oneshot_read_main.c

#include "esp_log.h"
#include "esp_adc/adc_oneshot.h"

static int adc_raw[2][10];
static int voltage[2][10];
const static char *TAG = "ADC";
static adc_oneshot_unit_handle_t adc1_handle;
static adc_cali_handle_t adc1_cali_handle = NULL;

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
    ESP_ERROR_CHECK(adc_oneshot_config_channel(adc1_handle, ADC_CHANNEL_3, &config));
    ESP_ERROR_CHECK(adc_oneshot_config_channel(adc1_handle, ADC_CHANNEL_0, &config));
    ESP_ERROR_CHECK(adc_oneshot_config_channel(adc1_handle, ADC_CHANNEL_6, &config));

    //-------------ADC1 Calibration Init---------------//
    // FOR ESP32-S2
    // ADC_ATTEN_DB_0 100 mV ~ 950 mV
    // ADC_ATTEN_DB_2_5 100 mV ~ 1250 mV
    // ADC_ATTEN_DB_6 150 mV ~ 1750 mV
    // ADC_ATTEN_DB_12 150 mV ~ 2450 mV
    adc_calibration_init(ADC_UNIT_1, ADC_ATTEN_DB_12, &adc1_cali_handle);
}

static void analogRead(adc_channel_t channel)
{
    adc_unit_t unit = ADC_UNIT_1;
    ESP_ERROR_CHECK(adc_oneshot_read(adc1_handle, channel, &adc_raw[unit][channel]));
    ESP_LOGD(TAG, "ADC%d Channel[%d] Raw Data: %d", unit + 1, channel, adc_raw[unit][channel]);
    ESP_ERROR_CHECK(adc_cali_raw_to_voltage(adc1_cali_handle, adc_raw[unit][channel], &voltage[unit][channel]));
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

void deinitAdc()
{
    ESP_ERROR_CHECK(adc_oneshot_del_unit(adc1_handle));
    adc_calibration_deinit(adc1_cali_handle);
}