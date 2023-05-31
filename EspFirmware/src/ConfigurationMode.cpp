#include "ConfigurationMode.h"

AsyncWebServer server(80);
DNSServer dnsServer;
String networksJson = "";
IPAddress apIP(8, 8, 4, 4); // Default (Google) DNS server

bool shouldConnectToWifi = false;
String ssid = "";
String password = "";

bool shouldReset = false;

/**
 * Macro to print the name of the function that is being called
 * for every request. Just wrap the function in this macro.
 */
#define DEBUG_REQUEST(function)                    \
    [](AsyncWebServerRequest *request)             \
    {                                              \
        serialPrintf("Calling %s()\n", #function); \
        function(request);                         \
    }

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
    if (resetFlag == CONFIGURATION_FLAG || resetFlag == OTA_FLAG)
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
    WiFi.softAPConfig(apIP, apIP, IPAddress(255, 255, 255, 0));
    WiFi.softAP(String(AP_SSID) + "#" + String(SENSOR_ID));
    serialPrintf("Started access point at ip %s\n", WiFi.softAPIP().toString().c_str());

    // start the dns server
    serialPrintf("Starting dns server\n");
    dnsServer.start(53, "*", WiFi.softAPIP());

    // start the webserver
    serialPrintf("Starting webserver\n");
    server.onNotFound(DEBUG_REQUEST(handleGetNotFound));
    server.on("/", HTTP_GET, DEBUG_REQUEST(handleGetIndex));
    server.on("/wifi-manager.html", HTTP_GET, DEBUG_REQUEST(handleGetWifiManager));
    server.on("/connect", HTTP_POST, DEBUG_REQUEST(handlePostConnect));
    server.on("/reset", HTTP_POST, DEBUG_REQUEST(handlePostReset));
    server.on("/networks", HTTP_GET, DEBUG_REQUEST(handleGetNetworks));
    server.on("/isConnected", HTTP_GET, DEBUG_REQUEST(handleGetIsConnected));
    server.on("/mqttSetup", HTTP_POST, DEBUG_REQUEST(handlePostMqttSetup));
    server.on("/sensorId", HTTP_POST, DEBUG_REQUEST(handlePostSensorId));
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
}

void handleGetIndex(AsyncWebServerRequest *request)
{
    request->send(LittleFS, "/index.html", "text/html");
}

void handleGetWifiManager(AsyncWebServerRequest *request)
{
    request->send(LittleFS, "/wifi-manager.html", "text/html");
}

void handleGetNotFound(AsyncWebServerRequest *request)
{
    request->send(LittleFS, "/404.html", "text/html");
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

void handleGetNetworks(AsyncWebServerRequest *request)
{
    String json = "[";
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
                json += ",";
            json += "{";
            json += "\"rssi\":" + String(WiFi.RSSI(i));
            json += ",\"ssid\":\"" + WiFi.SSID(i) + "\"";
            json += ",\"bssid\":\"" + WiFi.BSSIDstr(i) + "\"";
            json += ",\"channel\":" + String(WiFi.channel(i));
            json += ",\"secure\":" + String(WiFi.encryptionType(i));
            json += ",\"hidden\":" + String(WiFi.isHidden(i) ? "true" : "false");
            json += "}";
        }
        WiFi.scanDelete();
        if (WiFi.scanComplete() == -2)
        {
            WiFi.scanNetworks(true);
        }
    }
    json += "]";
    request->send(200, "application/json", json);
    json = String();
}

void handleGetIsConnected(AsyncWebServerRequest *request)
{
    request->send(200, "text/plain", String(WiFi.status()));
}

void handlePostMqttSetup(AsyncWebServerRequest *request)
{
    if (!request->hasParam("mqttServer", true) || !request->hasParam("mqttPort", true) || !request->hasParam("mqttUser", true) || !request->hasParam("mqttPassword", true))
    {
        request->send(400, "text/plain", "Bad request");
        return;
    }
    AsyncWebParameter *newMqttServer = request->getParam("mqttServer", true);
    AsyncWebParameter *newMqttPort = request->getParam("mqttPort", true);
    AsyncWebParameter *newMqttUser = request->getParam("mqttUser", true);
    AsyncWebParameter *newMqttPassword = request->getParam("mqttPassword", true);

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