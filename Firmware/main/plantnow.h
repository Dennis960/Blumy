#pragma once
#include "freertos/FreeRTOS.h"

void plantnow_init(bool isMaster);
esp_err_t plantnow_connectToMaster(void);
void plantnow_wait_for_exchange(TickType_t ticks_to_wait);
