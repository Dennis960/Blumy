#include "MyEeprom.h"

void initEEPROM()
{
    serialPrintf("Initializing EEPROM\n");
    EEPROM.begin(EEPROM_SIZE);
}

void writeStringToEEPROM(int addrOffset, const String &data)
{
    // check if the string is longer than 32 bytes
    int length = data.length();
    if (length > 32)
    {
        serialPrintf("String is too long to write to EEPROM\n");
        return;
    }
    EEPROM.write(addrOffset, length);
    for (int i = 0; i < length; ++i)
    {
        EEPROM.write(addrOffset + 1 + i, data[i]);
    }
    EEPROM.commit();
}

void writeUint32_tToEEPROM(int addrOffset, uint32_t data)
{
    EEPROM.write(addrOffset, data & 0xFF);
    EEPROM.write(addrOffset + 1, (data >> 8) & 0xFF);
    EEPROM.write(addrOffset + 2, (data >> 16) & 0xFF);
    EEPROM.write(addrOffset + 3, (data >> 24) & 0xFF);
    EEPROM.commit();
}

String readStringFromEEPROM(int addrOffset)
{
    int length = EEPROM.read(addrOffset);
    String data = "";
    for (int i = 0; i < length; ++i)
    {
        data += char(EEPROM.read(addrOffset + 1 + i));
    }
    return data;
}

uint32_t readUint32_tFromEEPROM(int addrOffset)
{
    uint32_t data = 0;
    data |= EEPROM.read(addrOffset);
    data |= EEPROM.read(addrOffset + 1) << 8;
    data |= EEPROM.read(addrOffset + 2) << 16;
    data |= EEPROM.read(addrOffset + 3) << 24;
    return data;
}

uint32_t calculateWifiChecksum()
{
    String ssid = readStringFromEEPROM(SSID_ADDRESS);
    String password = readStringFromEEPROM(PASSWORD_ADDRESS);
    return calculateCRC32(ssid + password, ssid.length() + password.length());
}

bool isWifiChecksumValid()
{
    serialPrintf("Checking if WiFi checksum is valid\n");
    uint32_t checksum = readUint32_tFromEEPROM(WIFI_CHECKSUM_ADDRESS);
    uint32_t calculatedChecksum = calculateWifiChecksum();
    serialPrintf("Checksum:            %d\n", checksum);
    serialPrintf("Calculated checksum: %d\n", calculatedChecksum);
    return checksum == calculatedChecksum;
}

void saveWiFiCredentials(const String &ssid, const String &password)
{
    serialPrintf("Saving WiFi credentials\n");
    writeStringToEEPROM(SSID_ADDRESS, ssid);
    writeStringToEEPROM(PASSWORD_ADDRESS, password);
    writeUint32_tToEEPROM(WIFI_CHECKSUM_ADDRESS, calculateWifiChecksum());
}

void loadWiFiCredentials(String &ssid, String &password)
{
    serialPrintf("Loading WiFi credentials\n");
    ssid = readStringFromEEPROM(SSID_ADDRESS);
    password = readStringFromEEPROM(PASSWORD_ADDRESS);
    serialPrintf("SSID: %s\n", ssid.c_str());
}

void saveResetFlag(uint32_t resetFlag)
{
    serialPrintf("Saving reset flag\n");
    writeUint32_tToEEPROM(RESET_FLAG_ADDRESS, resetFlag);
}

uint32_t loadResetFlag()
{
    serialPrintf("Loading reset flag\n");
    return readUint32_tFromEEPROM(RESET_FLAG_ADDRESS);
}

void saveSensorId(uint32_t sensorId)
{
    serialPrintf("Saving sensor ID\n");
    writeUint32_tToEEPROM(SENSOR_ID_ADDRESS, sensorId);
}

uint32_t loadSensorId()
{
    serialPrintf("Loading sensor ID\n");
    return readUint32_tFromEEPROM(SENSOR_ID_ADDRESS);
}

uint32_t calculateMqttChecksum()
{
    String mqttServer = readStringFromEEPROM(MQTT_SERVER_ADDRESS);
    uint32_t mqttPort = readUint32_tFromEEPROM(MQTT_PORT_ADDRESS);
    String mqttUser = readStringFromEEPROM(MQTT_USER_ADDRESS);
    String mqttPassword = readStringFromEEPROM(MQTT_PASSWORD_ADDRESS);
    String mqttTopic = readStringFromEEPROM(MQTT_TOPIC_ADDRESS);
    String mqttClientId = readStringFromEEPROM(MQTT_CLIENT_ID_ADDRESS);
    return calculateCRC32(
        mqttServer + String(mqttPort) + mqttUser + mqttPassword + mqttTopic + mqttClientId,
        mqttServer.length() + mqttUser.length() + mqttPassword.length() + mqttTopic.length() + mqttClientId.length() + 4);
}

bool isMqttChecksumValid()
{
    serialPrintf("Checking if MQTT checksum is valid\n");
    uint32_t checksum = readUint32_tFromEEPROM(MQTT_CHECKSUM_ADDRESS);
    uint32_t calculatedChecksum = calculateMqttChecksum();
    serialPrintf("Checksum:            %d\n", checksum);
    serialPrintf("Calculated checksum: %d\n", calculatedChecksum);
    return checksum == calculatedChecksum;
}

void saveMqttCredentials(String mqttServer, int mqttPort, String mqttUser, String mqttPassword, String mqttTopic, String mqttClientId)
{
    serialPrintf("Saving MQTT credentials\n");
    writeStringToEEPROM(MQTT_SERVER_ADDRESS, mqttServer);
    writeUint32_tToEEPROM(MQTT_PORT_ADDRESS, mqttPort);
    writeStringToEEPROM(MQTT_USER_ADDRESS, mqttUser);
    writeStringToEEPROM(MQTT_PASSWORD_ADDRESS, mqttPassword);
    writeStringToEEPROM(MQTT_TOPIC_ADDRESS, mqttTopic);
    writeStringToEEPROM(MQTT_CLIENT_ID_ADDRESS, mqttClientId);
    writeUint32_tToEEPROM(MQTT_CHECKSUM_ADDRESS, calculateMqttChecksum());
}

void loadMqttCredentials(String &mqttServer, int &mqttPort, String &mqttUser, String &mqttPassword, String &mqttTopic, String &mqttClientId)
{
    serialPrintf("Loading MQTT credentials\n");
    mqttServer = readStringFromEEPROM(MQTT_SERVER_ADDRESS);
    mqttPort = readUint32_tFromEEPROM(MQTT_PORT_ADDRESS);
    mqttUser = readStringFromEEPROM(MQTT_USER_ADDRESS);
    mqttPassword = readStringFromEEPROM(MQTT_PASSWORD_ADDRESS);
    mqttTopic = readStringFromEEPROM(MQTT_TOPIC_ADDRESS);
    mqttClientId = readStringFromEEPROM(MQTT_CLIENT_ID_ADDRESS);
    serialPrintf("MQTT server: %s\n", mqttServer.c_str());
    serialPrintf("MQTT port: %d\n", mqttPort);
    serialPrintf("MQTT user: %s\n", mqttUser.c_str());
    serialPrintf("MQTT topic: %s\n", mqttTopic.c_str());
    serialPrintf("MQTT client id: %s\n", mqttClientId.c_str());
}

void savePlantName(String plantName)
{
    serialPrintf("Saving plant name\n");
    writeStringToEEPROM(PLANT_NAME_ADDRESS, plantName);
}

/**
 * Load the plant name from the EEPROM
 * @return The plant name
 */
String loadPlantName()
{
    serialPrintf("Loading plant name\n");
    return readStringFromEEPROM(PLANT_NAME_ADDRESS);
}

void saveSleepDuration(uint32_t sleepDuration)
{
    serialPrintf("Saving sleep duration\n");
    writeUint32_tToEEPROM(SLEEP_DURATION_ADDRESS, sleepDuration);
}

uint32_t loadSleepDuration()
{
    serialPrintf("Loading sleep duration\n");
    return readUint32_tFromEEPROM(SLEEP_DURATION_ADDRESS);
}
