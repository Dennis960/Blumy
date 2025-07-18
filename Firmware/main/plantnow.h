#pragma once
#include "freertos/FreeRTOS.h"

void plantnow_init(bool isMaster);
void plantnow_wait_for_exchange(TickType_t ticks_to_wait);
uint8_t *plantnow_getPeerMac(void);
esp_err_t plantnow_sendWifiCredentials(bool waitForSendComplete);
bool plantnow_waitForSendComplete(TickType_t ticks_to_wait);
