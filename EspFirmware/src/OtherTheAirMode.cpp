#include "OtherTheAirMode.h"

void otaSetup()
{
    serialPrintf("Starting OTA mode\n");
    // ArduinoOTA.setHostname("plantfi");
    // ArduinoOTA.begin();
    pinMode(RESET_INPUT_PIN, OUTPUT);
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
    // ArduinoOTA.handle();
}