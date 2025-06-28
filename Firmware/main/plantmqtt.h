#pragma once

#include "freertos/FreeRTOS.h"
#include "peripherals/sensors.h"

void plantmqtt_homeassistant_create_sensor(void);
void plantmqtt_homeassistant_publish_sensor_data(const sensors_full_data_t *sensors_data, int16_t rssi);
bool plantmqtt_test_connection(char *sensorId, char *server, uint32_t port, char *username, char *password, char *topic, char *clientId);
void plantmqtt_destroy(void);