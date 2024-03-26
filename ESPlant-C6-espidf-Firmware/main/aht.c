#include "aht20.h"
#include "driver/i2c.h"

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

typedef struct
{
    float temperature;
    float humidity;
} aht_data_t;

void initAht(int sda, int scl)
{
    configureI2cBus(sda, scl);
    aht20_i2c_config_t i2c_config = {
        .i2c_addr = AHT20_ADDRRES_0,
        .i2c_port = I2C_NUM_0,
    };
    ESP_ERROR_CHECK(aht20_new_sensor(&i2c_config, &aht_handle));
}

void aht_read_data(aht_data_t *data)
{
    uint32_t temperature_raw, humidity_raw;
    float temperature, humidity;
    ESP_ERROR_CHECK(aht20_read_temperature_humidity(aht_handle, &temperature_raw, &temperature, &humidity_raw, &humidity));
    data->temperature = temperature;
    data->humidity = humidity;
}

void deinitAht()
{
    ESP_ERROR_CHECK(aht20_del_sensor(aht_handle));
    ESP_ERROR_CHECK(i2c_driver_delete(I2C_NUM_0));
}