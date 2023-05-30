#include "ConfigurationMode.h"

AsyncWebServer server(80);
DNSServer dnsServer;
String networksJson = "";
unsigned long lastNetworkScan = -5000;
const unsigned long networkScanInterval = 5000;
IPAddress apIP(8,8,4,4); // Default (Google) DNS server

bool shouldConnectToWifi = false;
String ssid = "";
String password = "";

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
    server.onNotFound(handleNotFound);
    server.on("/", HTTP_GET, handleRoot);
    server.on("/wifi-manager.html", HTTP_GET, handleWifiManager);
    server.on("/connect", HTTP_POST, handleConnect);
    server.on("/reset", HTTP_POST, handleReset);
    server.on("/networks", HTTP_GET, handleNetworks);
    server.on("/isConnected", HTTP_GET, handleIsConnected);
    server.addHandler(new CaptiveRequestHandler()).setFilter(ON_AP_FILTER); // only when requested from AP
    server.begin();
}

void configurationLoop()
{
    dnsServer.processNextRequest(); // used for auto-redirecting to captive portal

    // scan for wifis every 10 seconds
    if (millis() - lastNetworkScan > networkScanInterval)
    {
        lastNetworkScan = millis();
        // scan for wifis, print them
        serialPrintf("Scanning for wifis\n");
        int n = WiFi.scanNetworks();
        serialPrintf("Found %d wifis\n", n);
        networksJson = "[";
        for (int i = 0; i < n; i++)
        {
            String ssid = WiFi.SSID(i);
            // if ssid equals OTA_SSID set ota flag and reset
            if (ssid == OTA_SSID)
            {
                reset(OTA_FLAG);
            }

            networksJson += "{\"ssid\":\"" + ssid + "\",\"rssi\":" + WiFi.RSSI(i) + "}";
            if (i < n - 1)
            {
                networksJson += ",";
            }
        }
        networksJson += "]";
    }

    // TODO: make this async
    if (shouldConnectToWifi)
    {
        shouldConnectToWifi = false;
        serialPrintf("Connecting to wifi\n");
        WiFi.begin(ssid.c_str(), password.c_str());
        int retries = 0;
        while (WiFi.status() != WL_CONNECTED)
        {
            retries++;
            delay(500);
            serialPrintf("Retrying to connect to wifi\n");
            if (retries > 10)
            {
                serialPrintf("Failed to connect to wifi\n");
                break;
            }
        }
        if (WiFi.status() == WL_CONNECTED)
        {
            serialPrintf("Connected to wifi\n");
            saveWiFiCredentials(ssid, password);
        }
    }

    if (shouldReset)
    {
        reset(SENSOR_FLAG);
    }
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
        AsyncWebParameter *newSsid = request->getParam("ssid", true);
        AsyncWebParameter *newPassword = request->getParam("password", true);

        serialPrintf("Received ssid: %s\n", newSsid->value().c_str());
        serialPrintf("Received password: %s\n", newPassword->value().c_str());

        ssid = newSsid->value();
        password = newPassword->value();
        shouldConnectToWifi = true;

        serialPrintf("Connected to wifi\n");
        request->send(200, "text/plain", "OK");
    }
    else
    {
        request->send(400, "text/plain", "Bad request");
    }
}

void handleReset(AsyncWebServerRequest *request)
{
    serialPrintf("Received request for /reset\n");
    shouldReset = true;
    request->send(200, "application/json", "OK");
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