#include "MyEeprom.h"

void initEEPROM()
{
    serialPrintf("Initializing EEPROM\n");
    EEPROM.begin(512);
}

bool isEEPROMValid()
{
    serialPrintf("Checking EEPROM validity\n");
    String ssid = readStringFromEEPROM(SSID_ADDRESS);
    String password = readStringFromEEPROM(PASSWORD_ADDRESS);
    uint32_t checksum = readUint32_tFromEEPROM(CHECKSUM_ADDRESS);
    uint32_t calculatedChecksum = calculateCRC32(ssid + password, ssid.length() + password.length());
    serialPrintf("Checksum:            %u\n", checksum);
    serialPrintf("Calculated checksum: %u\n", calculatedChecksum);
    return checksum == calculatedChecksum;
}

void writeStringToEEPROM(int addrOffset, const String &data)
{
    int length = data.length();
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

void saveWiFiCredentials(const String &ssid, const String &password)
{
    serialPrintf("Saving WiFi credentials\n");
    writeStringToEEPROM(SSID_ADDRESS, ssid);
    writeStringToEEPROM(PASSWORD_ADDRESS, password);
    uint32_t checksum = calculateCRC32(ssid + password, ssid.length() + password.length());
    writeUint32_tToEEPROM(CHECKSUM_ADDRESS, checksum);
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