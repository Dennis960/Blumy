#include "ConfigurationMode.h"

AsyncWebServer server(80);
bool shouldScanWifi = false;
String networksJson = "";

void configurationSetup()
{
    serialPrintf("Enabling led\n");
    pinMode(RESET_INPUT_PIN, OUTPUT);
    analogWrite(RESET_INPUT_PIN, 60);

    // start the filesystem
    LittleFS.begin();

    // start the webserver
    server.onNotFound(handleNotFound);
    server.on("/", HTTP_GET, handleRoot);
    server.on("/wifi-manager.html", HTTP_GET, handleWifiManager);
    server.on("/connect", HTTP_POST, handleConnect);
    server.on("/reset", HTTP_POST, handleReset);
    server.on("/scan", HTTP_POST, handleScan);
    server.on("/networks", HTTP_GET, handleNetworks);
    server.on("/isConnected", HTTP_GET, handleIsConnected);
    server.begin();

    // disable wifi
    WiFi.forceSleepBegin();
    delay(1);
    WiFi.mode(WIFI_OFF);
    delay(1);

    // start the access point
    WiFi.softAP(AP_SSID);
    serialPrintf("Started access point at ip %s\n", WiFi.softAPIP().toString().c_str());
}

void configurationLoop()
{
    if (shouldScanWifi)
    {
        // scan for wifis, print them
        serialPrintf("Scanning for wifis\n");
        int n = WiFi.scanNetworks();
        serialPrintf("Found %d wifis\n", n);
        networksJson = "[";
        for (int i = 0; i < n; i++)
        {
            networksJson += "{\"ssid\":\"" + WiFi.SSID(i) + "\",\"rssi\":" + WiFi.RSSI(i) + "}";
            if (i < n - 1)
            {
                networksJson += ",";
            }
        }
        networksJson += "]";
        shouldScanWifi = false;
    }
}

void reset()
{
    serialPrintf("Disabling led\n");
    analogWrite(RESET_INPUT_PIN, 0);
    delay(100);

    startDeepSleep(1000000, false);
}

void handleRoot(AsyncWebServerRequest *request)
{
    serialPrintf("Received request for /\n");
    request->send(LittleFS, "/index.html", "text/html");
}
void handleWifiManager(AsyncWebServerRequest *request)
{
    serialPrintf("Received request for /wifi-manager\n");
    request->send(LittleFS, "/wifi-manager.html", "text/html");
}

void handleNotFound(AsyncWebServerRequest *request)
{
    serialPrintf("Received request for %s, but no handler was found\n", request->url().c_str());
    request->send(404, "text/plain", "Not found");
}

void handleConnect(AsyncWebServerRequest *request)
{
    serialPrintf("Received request for /connect\n");
    if (request->hasParam("ssid", true) && request->hasParam("password", true))
    {
        AsyncWebParameter *ssid = request->getParam("ssid", true);
        AsyncWebParameter *password = request->getParam("password", true);

        serialPrintf("Received ssid: %s\n", ssid->value().c_str());
        serialPrintf("Received password: %s\n", password->value().c_str());
        
        // try to connect to the wifi
        WiFi.begin(ssid->value().c_str(), password->value().c_str());
        int8_t state = WiFi.waitForConnectResult();
        if (state == WL_CONNECTED)
        {
            serialPrintf("Connected to wifi\n");
            request->send(200, "text/plain", "OK");
        }
        else
        {
            serialPrintf("Failed to connect to wifi\n");
            request->send(400, "text/plain", "Bad request");
        }
    }
    else
    {
        request->send(400, "text/plain", "Bad request");
    }
}

void handleReset(AsyncWebServerRequest *request)
{
    serialPrintf("Received request for /reset\n");
    reset();
}

void handleScan(AsyncWebServerRequest *request)
{
    serialPrintf("Received request for /scan\n");
    shouldScanWifi = true;
    request->send(200, "application/json", "");
}

void handleNetworks(AsyncWebServerRequest *request)
{
    serialPrintf("Received request for /networks\n");
    request->send(200, "application/json", networksJson);
}

void handleIsConnected(AsyncWebServerRequest *request)
{
    serialPrintf("Received request for /isConnected\n");
    if (WiFi.status() == WL_CONNECTED)
    {
        serialPrintf("Connected to wifi\n");
        request->send(200, "text/plain", "1");
    }
    else
    {
        serialPrintf("Not connected to wifi\n");
        request->send(200, "text/plain", "0");
    }
}