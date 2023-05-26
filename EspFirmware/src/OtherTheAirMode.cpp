#include "OtherTheAirMode.h"
#include <AsyncElegantOTA.h>

AsyncWebServer otaServer(80);

void otaSetup()
{
    serialPrintf("Starting OTA mode\n");
    
    pinMode(RESET_INPUT_PIN, OUTPUT);
    analogWrite(RESET_INPUT_PIN, 60);

    // connect to ota wifi
    WiFi.mode(WIFI_STA);
    WiFi.begin(OTA_SSID);
    int result = WiFi.waitForConnectResult();
    if (result != WL_CONNECTED)
    {
        serialPrintf("Failed to connect to OTA wifi\n");
        reset(SENSOR_FLAG);
    }
    serialPrintf("Connected to OTA wifi\n");

    AsyncElegantOTA.begin(&otaServer);
    otaServer.begin();
    serialPrintf("Connected to ip %s\n", WiFi.localIP().toString().c_str());
}

long lastBlink = 0;
bool blinkState = LOW;
const long blinkSpeed = 300;
const int ledBrightness = 60;

void otaLoop()
{
    // blink the led
    if (millis() - lastBlink > blinkSpeed)
    {
        lastBlink = millis();
        blinkState = !blinkState;
        analogWrite(RESET_INPUT_PIN, blinkState * ledBrightness);
    }
}