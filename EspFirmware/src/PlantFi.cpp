#include "PlantFi.h"

RtcData rtcData;

PlantFi::PlantFi(
    String ssid,
    String password,
    String mqttServer,
    int mqttPort,
    String mqttUser,
    String mqttPassword,
    String mqttTopic,
    String mqttClientId
)
{
    _ssid = ssid;
    _password = password;
    _mqttServer = mqttServer;
    _mqttPort = mqttPort;
    _mqttUser = mqttUser;
    _mqttPassword = mqttPassword;
    _mqttTopic = mqttTopic;
    _mqttClientId = mqttClientId;
}

bool PlantFi::isRtcValid()
{
    // Try to read WiFi settings from RTC memory
    if (ESP.rtcUserMemoryRead(0, (uint32_t *)&rtcData, sizeof(rtcData)))
    {
        // Calculate the CRC of what we just read from RTC memory, but skip the first 4 bytes as that's the checksum itself.
        uint32_t crc = calculateCRC32(((uint8_t *)&rtcData) + 4, sizeof(rtcData) - 4);
        if (crc == rtcData.crc32)
        {
            return true;
        }
    }
    return false;
}

void PlantFi::checkRtcValidity()
{
    rtcValid = isRtcValid();
}

void PlantFi::connectWifi(bool quickConnect)
{
    if (quickConnect)
    {
        WiFi.begin(_ssid, _password, rtcData.channel, rtcData.bssid, true);
    }
    else
    {
        WiFi.begin(_ssid, _password);
    }
    connectionStartTime = millis();
}

void PlantFi::disconnect()
{
    mqttClient.disconnect();
}

void PlantFi::resetWifi()
{
    // Quick connect is not working, reset WiFi and try regular connection
    WiFi.disconnect();
    delay(10);
    WiFi.forceSleepBegin();
    delay(10);
    WiFi.forceSleepWake();
    delay(10);
    connectWifi(false);
    rtcValid = false;
}

bool PlantFi::isWifiConnected()
{
    return WiFi.status() == WL_CONNECTED;
}

void PlantFi::saveConnection()
{
    rtcData.channel = WiFi.channel();
    memcpy(rtcData.bssid, WiFi.BSSID(), 6); // Copy 6 bytes of BSSID (AP's MAC address)
    rtcData.crc32 = calculateCRC32(((uint8_t *)&rtcData) + 4, sizeof(rtcData) - 4);
    ESP.rtcUserMemoryWrite(0, (uint32_t *)&rtcData, sizeof(rtcData));
}

void PlantFi::sendData(int sensorAddress, int water, unsigned long measurementDuration)
{
    mqttClient.setClient(wifiClient);
    mqttClient.setServer(_mqttServer.c_str(), _mqttPort);
    if (!mqttClient.connect(_mqttClientId.c_str(), _mqttUser.c_str(), _mqttPassword.c_str())) {
        // TODO handle connection error
        serialPrintf("MQTT Connection error\n");
    }
    char buffer[200];
    sprintf(buffer, "{\"sensorAddress\":%d,\"water\":%d,\"duration\":%lu,\"measurementDuration\":%lu,\"rssi\":%d}", sensorAddress, water, millis(), measurementDuration, WiFi.RSSI());
    mqttClient.publish(_mqttTopic.c_str(), buffer);
}