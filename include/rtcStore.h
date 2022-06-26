#ifndef File_INCLUDED
#define File_INCLUDED

#include <ESP8266HTTPClient.h>

typedef struct {
    uint32_t crc32; // 4U
    // needs to be at the top to calculate crc32 correctly
    uint8_t channel; // 1U
    uint8_t bssid[6]; // 6U
    // ----------------------
    boolean isDoubleReset = true; // 1U
    uint8_t plant_id; // 1U
    char password[40]; // 40U
    char ssid[32]; // 32U
    boolean isHappy; // 1U
    unsigned short referenceCapacitance; // 2U
} RTC_Store;
RTC_Store rtcStore;

uint32_t calculateCRC32(const uint8_t *data, size_t length)
{
  uint32_t crc = 0xffffffff;
  while(length--) {
    uint8_t c = *data++;
    for(uint32_t i = 0x80; i > 0; i >>= 1) {
      bool bit = crc & 0x80000000;
      if(c & i) {
        bit = !bit;
      }

      crc <<= 1;
      if(bit) {
        crc ^= 0x04c11db7;
      }
    }
  }

  return crc;
}
uint32_t calculateWiFiQuickConnectCRC32()
{
    return calculateCRC32(((uint8_t*)&rtcStore) + 4, 7);
}

bool readFromRTC()
{
    return ESP.rtcUserMemoryRead(0, (uint32_t*)&rtcStore, sizeof(rtcStore));
}
bool writeToRTC()
{
    return ESP.rtcUserMemoryWrite(0, (uint32_t*)&rtcStore, sizeof(rtcStore));
}

bool isRtcValid()
{
    bool rtcValid = false;
    if (readFromRTC())
    {
        uint32_t crc = calculateWiFiQuickConnectCRC32();
        if(crc == rtcStore.crc32) {
            rtcValid = true;
        }
    }
    return rtcValid;
}

void setPassword(char* password)
{
    strcpy(rtcStore.password, password);
}
void setSSID(char* ssid)
{
    strcpy(rtcStore.ssid, ssid);
}
void setBssid(uint8_t bssid[6])
{
    memcpy(rtcStore.bssid, bssid, 6);
    rtcStore.crc32 = calculateWiFiQuickConnectCRC32();
    writeToRTC();
}

#endif