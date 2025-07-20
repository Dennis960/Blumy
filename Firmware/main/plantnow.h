#pragma once
#include "freertos/FreeRTOS.h"

typedef struct
{
    char token[100];
    char url[100];
} cloud_setup_blumy_t;

void plantnow_init(bool isMaster);
bool plantnow_hasExchangedBlumy(void);
uint8_t *plantnow_getPeerMac(void);
esp_err_t plantnow_sendWifiCredentials(bool waitForSendComplete);
esp_err_t plantnow_sendCloudSetupBlumy(cloud_setup_blumy_t *creds, bool waitForSendComplete);
bool plantnow_waitForSendComplete(TickType_t ticks_to_wait);
