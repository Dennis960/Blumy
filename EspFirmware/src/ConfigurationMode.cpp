#include "ConfigurationMode.h"

AsyncWebServer server(80);
DNSServer dnsServer;
String networksJson = "";
IPAddress apIP(192, 168, 4, 1);
IPAddress mask(255, 255, 255, 0);

bool shouldConnectToWifi = false;
String ssid = "";
String password = "";
String networkJson = "";
unsigned long wifiScanInterval = 3000;
unsigned long lastWifiScan = -wifiScanInterval; // force a scan on first run

bool shouldReset = false;

size_t content_len = 1;

unsigned long lastUpdatePost = -1;
bool isLedOn = true;

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
    serialPrintf("Enabling led\n");
    ledOn();

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

    // OTA
    server.on("/update", HTTP_GET, handleGetUpdate);
    server.on(
        "/update", HTTP_POST, [](AsyncWebServerRequest *request) {},
        [](AsyncWebServerRequest *request, const String &filename, size_t index, uint8_t *data,
           size_t len, bool final)
        { handlePostUpdate(request, filename, index, data, len, final); });

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

    // ota timeout
    if (Update.isRunning() && millis() - lastUpdatePost > UPDATE_TIMEOUT)
    {
        serialPrintf("No upload received in the last %lu milliseconds. Cancelling update\n", UPDATE_TIMEOUT);
        Update.end();
    }
}

void handleGetNotFound(AsyncWebServerRequest *request)
{
    request->redirect("/");
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

void handleGetUpdate(AsyncWebServerRequest *request)
{
    request->send(200, "text/html", "<form method='POST' action='/update' enctype='multipart/form-data'><input type='file' name='update'><input type='submit' value='Update'></form>");
}

void handlePostUpdate(AsyncWebServerRequest *request, const String &filename, size_t index, uint8_t *data, size_t len, bool final)
{
    int updatePercentage = 100;
    if (Update.size() != 0)
    {
        updatePercentage = (int)((Update.progress() * 100) / Update.size());
    }
    if (updatePercentage % 2 == 0 && isLedOn)
    {
        ledOff();
        isLedOn = false;
    }
    else if (updatePercentage % 2 == 1 && !isLedOn)
    {
        ledOn();
        isLedOn = true;
    }
    lastUpdatePost = millis();
    if (index == 0)
    {
        if (Update.isRunning())
        {
            Update.end();
            serialPrintf("Ending running update\n");
        }
        serialPrintf("Update Start: %s\n", filename.c_str());
        content_len = request->contentLength();
        // TODO here is the place where we can define whether to upload firmware or filesystem
        int cmd = (filename.indexOf("fs") > -1) ? U_FS : U_FLASH;
        serialPrintf("Updating: %s\n", cmd == U_FS ? "filesystem" : "flash");
        Update.runAsync(true);
        if (!Update.begin(content_len, cmd))
        {
            serialPrintf("Update.begin failed! %s\n", Update.getErrorString());
            ledOn();
        }
    }

    if (Update.write(data, len) != len)
    {
        if (Update.hasError())
        {
            serialPrintf("Update.write failed! %s\n", Update.getErrorString());
            ledOn();
        }
    }
    else
    {
        serialPrintf("Progress: %d%%\n", updatePercentage);
    }

    if (final)
    {
        AsyncWebServerResponse *response = request->beginResponse(302, "text/plain", "Please wait while the device reboots");
        response->addHeader("Refresh", "20");
        response->addHeader("Location", "/");
        request->send(response);
        if (!Update.end(true))
        {
            serialPrintf("Update.end failed! %s\n", Update.getErrorString());
            ledOn();
        }
        else
        {
            serialPrintf("Update complete\n");
            Serial.flush();
            reset(CONFIGURATION_FLAG);
        }
    }
}