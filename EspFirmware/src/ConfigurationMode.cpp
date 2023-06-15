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

int updatePercentage = 0;

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

    resetFlag = CONFIGURATION_FLAG;

    // start the filesystem
    serialPrintf("Starting filesystem\n");
    LittleFS.begin();

    // start the access point
    serialPrintf("Starting access point\n");
    WiFi.mode(WIFI_AP);
    WiFi.softAPConfig(apIP, apIP, mask);
    WiFi.softAP(String(AP_SSID));
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
    server.on("/update/percentage", HTTP_GET, handleGetUpdatePercentage);
    server.on("/plantName", HTTP_POST, handlePostPlantName);
    server.on("/plantName", HTTP_GET, handleGetPlantName);
    server.on("/connectedNetwork", HTTP_GET, handleGetConnectedNetwork);

    // OTA
    server.on("/update/rescue", HTTP_GET, handleGetUpdateRescue);
    server.on(
        "/update/firmware", HTTP_POST, [](AsyncWebServerRequest *request) {},
        [](AsyncWebServerRequest *request, const String &filename, size_t index, uint8_t *data,
           size_t len, bool final)
        { handlePostUpdate(request, filename, index, data, len, final, U_FLASH); });
    server.on(
        "/update/littlefs", HTTP_POST, [](AsyncWebServerRequest *request) {},
        [](AsyncWebServerRequest *request, const String &filename, size_t index, uint8_t *data,
           size_t len, bool final)
        { handlePostUpdate(request, filename, index, data, len, final, U_FS); });

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
    if (!Update.isRunning())
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
            reset(resetFlag);
        }

        // scan wifi networks every 3 seconds
        if (millis() - lastWifiScan > wifiScanInterval)
        {
            lastWifiScan = millis();
            scanNetworks();
        }
    }
    // ota timeout
    else if (millis() - lastUpdatePost > UPDATE_TIMEOUT)
    {
        serialPrintf("No upload received in the last %lu milliseconds. Cancelling update\n", UPDATE_TIMEOUT);
        Update.end();
        ledOn();
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
    if (request->hasParam("resetFlag", true))
    {
        resetFlag = request->getParam("resetFlag", true)->value().toInt();
    }
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

void handleGetUpdateRescue(AsyncWebServerRequest *request)
{
    request->send(200, "text/html", "<form method='POST' action='/update/firmware' enctype='multipart/form-data' style='margin-bottom: 10px;'><input type='file' name='update' style='padding: 5px; border: 1px solid #ccc; border-radius: 3px;'><input type='submit' value='Update firmware' style='padding: 5px 10px; background-color: #4CAF50; color: white; border: none; border-radius: 3px; cursor: pointer;'></form><form method='POST' action='/update/littlefs' enctype='multipart/form-data' style='margin-bottom: 10px;'><input type='file' name='update' style='padding: 5px; border: 1px solid #ccc; border-radius: 3px;'><input type='submit' value='Update LittleFs' style='padding: 5px 10px; background-color: #4CAF50; color: white; border: none; border-radius: 3px; cursor: pointer;'></form>");
}

void handleGetUpdatePercentage(AsyncWebServerRequest *request)
{
    request->send(200, "text/plain", String(updatePercentage));
}

void handlePostUpdate(AsyncWebServerRequest *request, const String &filename, size_t index, uint8_t *data, size_t len, bool final, int cmd)
{
    if (index == 0)
    {
        beginUpdate(request, filename, cmd);
    }
    handleUpdate(data, len);
    if (final)
    {
        endUpdate(request, cmd);
    }
}

void beginUpdate(AsyncWebServerRequest *request, const String &filename, int cmd)
{
    if (cmd == U_FS)
    {
        LittleFS.end();
    }
    if (Update.isRunning())
    {
        Update.end();
        serialPrintf("Ending running update\n");
    }
    serialPrintf("Update for %s started with file: %s\n", cmd == U_FS ? "filesystem" : "flash", filename.c_str());
    size_t contentLength = request->contentLength();
    if (cmd == U_FS)
    {
        // TODO figure out why the content length is ~202 bit larger than the file size
        uint32_t maxContentLength = FS_end - FS_start;
        if (contentLength > maxContentLength)
        {
            contentLength = maxContentLength;
        }
    }
    Update.runAsync(true);
    if (!Update.begin(contentLength, cmd))
    {
        Update.printError(Serial);
        ledOn();
    }
}

void handleUpdate(uint8_t *data, size_t len)
{
    if (Update.size() != 0)
    {
        updatePercentage = (int)((Update.progress() * 100) / Update.size());
    }
    blinkUpdateLed();
    lastUpdatePost = millis();
    if (Update.write(data, len) != len && Update.hasError())
    {
        Update.printError(Serial);
        ledOn();
    }
    else
    {
        serialPrintf("Progress: %d%%\n", updatePercentage);
    }
}

void endUpdate(AsyncWebServerRequest *request, int cmd)
{
    if (!Update.end(true))
    {
        Update.printError(Serial);
        ledOn();
        return;
    }
    serialPrintf("Update complete\n");
    Serial.flush();

    if (cmd == U_FS)
    {
        LittleFS.begin();
    }
    updatePercentage = 100;
    request->send(200, "text/plain", "OK");
}

void blinkUpdateLed()
{
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
}

void handlePostPlantName(AsyncWebServerRequest *request)
{
    if (!request->hasParam("name", true))
    {
        request->send(400, "text/plain", "Bad request");
        return;
    }
    AsyncWebParameter *newPlantName = request->getParam("name", true);

    serialPrintf("Received plantName: %s\n", newPlantName->value().c_str());

    savePlantName(newPlantName->value());

    request->send(200, "text/plain", "OK");
}

void handleGetPlantName(AsyncWebServerRequest *request)
{
    request->send(200, "text/plain", loadPlantName());
}

void handleGetConnectedNetwork(AsyncWebServerRequest *request)
{
    String connectedNetworkJson = "{";
    connectedNetworkJson += "\"rssi\": \"" + String(WiFi.RSSI()) + "\",";
    connectedNetworkJson += "\"ssid\": \"" + WiFi.SSID() + "\",";
    connectedNetworkJson += "\"bssid\": \"" + WiFi.BSSIDstr() + "\",";
    connectedNetworkJson += "\"channel\": \"" + String(WiFi.channel()) + "\"";
    connectedNetworkJson += "}";
    request->send(200, "text/plain", connectedNetworkJson);
}
