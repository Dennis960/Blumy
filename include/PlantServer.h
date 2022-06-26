#include <ESPAsyncWebServer.h>
#include <ESPAsyncTCP.h>
#include <ESP8266WiFi.h>
#include <LittleFS.h>
#include <rtcStore.h>

#define APSSID "esplant"

IPAddress local_ip(192,168,4,1);
IPAddress gateway(192,168,4,254);
IPAddress netmask(255,255,255,0);
 
AsyncWebServer server(80);

boolean wifiSet = false;
boolean isPlantIdInit = false;

String processor(const String& var){
  Serial.println(var);
  if(var == "STATE"){
      return "State";
  }
  return "Not state";
}

void startPlantServer()
{
    Serial.println("Starting plant server");
    if (!LittleFS.begin()) {
        Serial.println("Error while mounting SPIFFS");
    }
    WiFi.softAPConfig(local_ip, gateway, netmask);
    WiFi.softAP(APSSID);
    server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
        Serial.println("main page accessed");
        request->send(LittleFS, "/index.html");
    });
    server.on("/main.css", HTTP_GET, [](AsyncWebServerRequest *request){
        request->send(LittleFS, "/main.css");
    });
    server.on("/main.js", HTTP_GET, [](AsyncWebServerRequest *request){
        request->send(LittleFS, "/main.js");
    });
    server.on("/favicon.ico", HTTP_GET, [](AsyncWebServerRequest *request){
        request->send(LittleFS, "/favicon.ico");
    });
    server.on("/setWiFi", HTTP_GET, [](AsyncWebServerRequest *request){
        Serial.println("wifi credentials entered");
        int paramsCount = request->params();
        if (paramsCount == 2)
        {
            setSSID((char*)request->getParam(0)->value().c_str());
            setPassword((char*)request->getParam(1)->value().c_str());
            writeToRTC();
        }
        request->send(HTTP_CODE_OK);
        wifiSet = true;
    });
    server.on("/setId", HTTP_GET, [](AsyncWebServerRequest *request){
        Serial.println("plant id set");
        int paramsCount = request->params();
        if (paramsCount == 1)
        {
            rtcStore.plant_id = atoi(request->getParam(0)->value().c_str());
            isPlantIdInit = true;
            writeToRTC();
        }
        request->send(HTTP_CODE_OK);
    });
    
    server.begin();
    unsigned long startTime = millis();
    unsigned long maxAPUpTime = 5 * 60 * 1000;
    while(!wifiSet) { // block any further code from running until wifi is setup
        delay(1);
        if (maxAPUpTime < millis() - startTime)
        {
            Serial.println("Access point was not accessed in 5 minutes, timing out.");
            break;
        }
    }
}