#include "ConfigurationMode.h"
#include <AsyncElegantOTA.h>

AsyncWebServer server(80);
DNSServer dnsServer;
String networksJson = "";
IPAddress apIP(192, 168, 4, 1); // Captive portal only works with non private ip addresses such as 8.8.4.4 (google dns)
                                // Loading index.html only works with private ip addresses such as 192.168.4.1
IPAddress mask(255, 255, 255, 0);

bool shouldConnectToWifi = false;
String ssid = "";
String password = "";
String networkJson = "";
unsigned long wifiScanInterval = 3000;
unsigned long lastWifiScan = -wifiScanInterval; // force a scan on first run

bool shouldReset = false;

class CaptiveRequestHandler : public AsyncWebHandler
{
public:
    CaptiveRequestHandler() {}
    virtual ~CaptiveRequestHandler() {}

    bool canHandle(AsyncWebServerRequest *request)
    {
        return true;
    }

    void handleRequest(AsyncWebServerRequest *request)
    {
        serialPrintf("Redirecting to captive portal\n");
        request->send(LittleFS, "/index.html", "text/html");
    }
};

void configurationSetup()
{
    uint32_t resetFlag = loadResetFlag();
    if (resetFlag == CONFIGURATION_FLAG)
    {
        serialPrintf("Double reset detected, resetting\n");
        reset(SENSOR_FLAG);
    }
    saveResetFlag(CONFIGURATION_FLAG);

    serialPrintf("Enabling led\n");
    pinMode(RESET_INPUT_PIN, OUTPUT);
    analogWrite(RESET_INPUT_PIN, 60);

    // start the filesystem
    serialPrintf("Starting filesystem\n");
    LittleFS.begin();

    // start the access point
    serialPrintf("Starting access point\n");
    WiFi.mode(WIFI_AP);
    WiFi.softAPConfig(apIP, apIP, mask);
    WiFi.softAP(String(AP_SSID) + "#" + String(SENSOR_ID));
    serialPrintf("Started access point at ip %s\n", WiFi.softAPIP().toString().c_str());

    // start the dns server
    serialPrintf("Starting dns server\n");
    dnsServer.start(53, "*", WiFi.softAPIP());

    // start the webserver
    serialPrintf("Starting webserver\n");
    server.onNotFound(handleGetNotFound);
    server.on("/connect", HTTP_POST, handlePostConnect);
    server.on("/reset", HTTP_POST, handlePostReset);
    server.on("/networks", HTTP_GET, handleGetNetworks);
    server.on("/isConnected", HTTP_GET, handleGetIsConnected);
    server.on("/mqttSetup", HTTP_POST, handlePostMqttSetup);
    server.on("/sensorId", HTTP_POST, handlePostSensorId);

    // Add OTA
    AsyncElegantOTA.begin(&server);

    // Send files from LittleFS
    server.serveStatic("/", LittleFS, "/");

    // Captive portal
    server.addHandler(new CaptiveRequestHandler()).setFilter(ON_AP_FILTER); // only when requested from AP
    server.begin();

    // start wifi connection if eeprom is valid
    if (isWifiChecksumValid())
    {
        loadWiFiCredentials(ssid, password);
        serialPrintf("Connecting to wifi %s\n", ssid.c_str());
        WiFi.begin(ssid, password);
    }
    else
    {
        serialPrintf("EEPROM is invalid\n");
    }

    // start wifi scan
    WiFi.scanNetworks(true);
}

void configurationLoop()
{
    dnsServer.processNextRequest(); // used for auto-redirecting to captive portal

    if (shouldConnectToWifi)
    {
        if (WiFi.status() == WL_CONNECTED)
        {
            serialPrintf("Connected to wifi %s\n", ssid.c_str());
            shouldConnectToWifi = false;
            saveWiFiCredentials(ssid, password);
        }
        else if (WiFi.status() == WL_CONNECT_FAILED || WiFi.status() == WL_NO_SSID_AVAIL)
        {
            serialPrintf("Failed to connect to wifi %s\n", ssid.c_str());
            shouldConnectToWifi = false;
        }
    }

    if (shouldReset)
    {
        reset(SENSOR_FLAG);
    }

    // scan wifi networks every 3 seconds
    if (millis() - lastWifiScan > wifiScanInterval)
    {
        lastWifiScan = millis();
        scanNetworks();
    }
}

void handleGetNotFound(AsyncWebServerRequest *request)
{
    request->send(200, "text/plain", "Not found");
    // request->send(LittleFS, "/404.html", "text/html");
}

void handlePostConnect(AsyncWebServerRequest *request)
{
    if (!request->hasParam("ssid", true) || !request->hasParam("password", true))
    {
        request->send(400, "text/plain", "Bad request");
        return;
    }
    AsyncWebParameter *newSsid = request->getParam("ssid", true);
    AsyncWebParameter *newPassword = request->getParam("password", true);

    serialPrintf("Received ssid: %s\n", newSsid->value().c_str());
    serialPrintf("Received password: %s\n", newPassword->value().c_str());

    ssid = newSsid->value();
    password = newPassword->value();
    shouldConnectToWifi = true;
    WiFi.begin(ssid.c_str(), password.c_str());

    request->send(200, "text/plain", "OK");
}

void handlePostReset(AsyncWebServerRequest *request)
{
    shouldReset = true;
    request->send(200, "text/plain", "OK");
}

void scanNetworks()
{
    networkJson = String();
    networkJson = "[";
    int n = WiFi.scanComplete();
    if (n == -2)
    {
        WiFi.scanNetworks(true);
    }
    else if (n)
    {
        for (int i = 0; i < n; ++i)
        {
            if (i)
                networkJson += ",";
            networkJson += "{";
            networkJson += "\"rssi\":" + String(WiFi.RSSI(i));
            networkJson += ",\"ssid\":\"" + WiFi.SSID(i) + "\"";
            networkJson += ",\"bssid\":\"" + WiFi.BSSIDstr(i) + "\"";
            networkJson += ",\"channel\":" + String(WiFi.channel(i));
            networkJson += ",\"secure\":" + String(WiFi.encryptionType(i));
            networkJson += ",\"hidden\":" + String(WiFi.isHidden(i) ? "true" : "false");
            networkJson += "}";
        }
        WiFi.scanDelete();
        if (WiFi.scanComplete() == -2)
        {
            WiFi.scanNetworks(true);
        }
    }
    networkJson += "]";
}

void handleGetNetworks(AsyncWebServerRequest *request)
{
    request->send(200, "application/json", networkJson);
}

void handleGetIsConnected(AsyncWebServerRequest *request)
{
    request->send(200, "text/plain", String(WiFi.status()));
}

void handlePostMqttSetup(AsyncWebServerRequest *request)
{
    if (!request->hasParam("server", true) || !request->hasParam("port", true))
    {
        request->send(400, "text/plain", "Bad request");
        return;
    }
    AsyncWebParameter *newMqttServer = request->getParam("server", true);
    AsyncWebParameter *newMqttPort = request->getParam("port", true);
    AsyncWebParameter *newMqttUser = request->getParam("user", true);
    AsyncWebParameter *newMqttPassword = request->getParam("password", true);

    serialPrintf("Received mqttServer: %s\n", newMqttServer->value().c_str());
    serialPrintf("Received mqttPort: %s\n", newMqttPort->value().c_str());
    serialPrintf("Received mqttUser: %s\n", newMqttUser->value().c_str());
    serialPrintf("Received mqttPassword: %s\n", newMqttPassword->value().c_str());

    String mqttServer = newMqttServer->value();
    int mqttPort = newMqttPort->value().toInt();
    String mqttUser = newMqttUser->value();
    String mqttPassword = newMqttPassword->value();

    saveMqttCredentials(mqttServer, mqttPort, mqttUser, mqttPassword);

    request->send(200, "text/plain", "OK");
}

void handlePostSensorId(AsyncWebServerRequest *request)
{
    if (!request->hasParam("sensorId", true))
    {
        request->send(400, "text/plain", "Bad request");
        return;
    }
    AsyncWebParameter *newSensorId = request->getParam("sensorId", true);

    serialPrintf("Received sensorId: %s\n", newSensorId->value().c_str());

    uint32_t sensorId = atol(newSensorId->value().c_str());

    if (sensorId == 0)
    {
        request->send(400, "text/plain", "Bad request");
        return;
    }

    saveSensorId(sensorId);

    request->send(200, "text/plain", "OK");
}

void handleGetSensorId(AsyncWebServerRequest *request)
{
    request->send(200, "text/plain", String(loadSensorId()));
}
