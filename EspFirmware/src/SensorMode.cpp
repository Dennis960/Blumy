#include "SensorMode.h"

Sensor sensor = Sensor();
PlantFi plantFi = PlantFi("", "", "", 0, "", "", "", "");

int sensorValue = -1;
bool wasWifiConnectedLastCycle = false;

void sensorSetup()
{
    if (!isWifiChecksumValid())
    {
        serialPrintf("EEPROM Wifi not valid, starting configuration mode\n");
        reset(CONFIGURATION_FLAG);
    }

    String ssid;
    String password;

    loadWiFiCredentials(ssid, password);

    String mqttServer;
    int mqttPort;
    String mqttUser;
    String mqttPassword;
    String mqttTopic;
    String mqttClientId;

    if (isMqttChecksumValid())
    {
        loadMqttCredentials(mqttServer, mqttPort, mqttUser, mqttPassword, mqttTopic, mqttClientId);
    }
    else
    {
        serialPrintf("EEPROM MQTT not valid, using defaults\n");
        // use defaults
        mqttServer = "schneefux.xyz";
        mqttPort = 1883;
        mqttUser = "esplant";
        mqttPassword = "Ma9BdqVcKyxTgJm3";
        mqttTopic = "esplant";
        mqttClientId = "sensor-1";
    }

    plantFi = PlantFi(ssid, password, mqttServer, mqttPort, mqttUser, mqttPassword, mqttTopic, mqttClientId);
    plantFi.checkRtcValidity();

    serialPrintf("Starting wifi connection\n");
    plantFi.connectWifi(plantFi.rtcValid);
}

void sensorLoop()
{
    if (sensorValue == -1)
    {
        sensorValue = sensor.measure();
    }
    // Check connection
    if (plantFi.isWifiConnected())
    {
        if (!wasWifiConnectedLastCycle)
        {
            serialPrintf("Wifi connected\n");
            wasWifiConnectedLastCycle = true;
        }
        if (!plantFi.rtcValid)
        {
            serialPrintf("Saving wifi connection\n");
            plantFi.saveConnection();
            plantFi.rtcValid = true;
        }
        if (sensorValue != -1)
        {
            serialPrintf("Measured value: %d\n", sensorValue);
            serialPrintf("Sending data\n");
            plantFi.sendData(loadSensorId(), sensorValue, sensor.getMeasurementDuration());
            plantFi.disconnect();
            startDeepSleep(SLEEP_DURATION);
        }
    }
    else
    {
        if (plantFi.rtcValid)
        {
            if (millis() - plantFi.connectionStartTime > QUICK_CONNECT_TIMEOUT)
            {
                serialPrintf("Quick connect failed, resetting wifi\n");
                plantFi.resetWifi(); // sets rtcValid to false
            }
        }
        else
        {
            if (millis() - plantFi.connectionStartTime > WIFI_TIMEOUT)
            {
                serialPrintf("Regular connect failed, giving up\n");
                startDeepSleep(SLEEP_DURATION);
            }
        }
    }

    // Total timeout
    if (millis() - plantFi.connectionStartTime > TOTAL_TIMEOUT)
    {
        serialPrintf("Total timeout\n");
        startDeepSleep(SLEEP_DURATION);
    }
}