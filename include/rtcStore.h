#ifndef File_INCLUDED
#define File_INCLUDED

#include <ESP8266HTTPClient.h>

typedef struct {
    boolean isDoubleReset = true; // 1U
    short plant_id; // 2U
    char password[40]; // 40U
    char ssid[32]; // 32U
    boolean isHappy; // 1U
    unsigned short referenceCapacitance; // 2U
} RTC_Store;

RTC_Store rtcStore;

void setPassword(char* password)
{
    strcpy(rtcStore.password, password);
}
void setSSID(char* ssid)
{
    strcpy(rtcStore.ssid, ssid);
}

void readFromRTC()
{
    system_rtc_mem_read(64, &rtcStore, sizeof(rtcStore));
}
void writeToRTC()
{
    system_rtc_mem_write(64, &rtcStore, sizeof(rtcStore));
}

#endif