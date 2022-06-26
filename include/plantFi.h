#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <rtcStore.h>
#include <ESP8266WiFi.h>
#include <PlantServer.h>

#include <ArduinoJson.h>

String UNDEFINED_NAME = "undefined";
IPAddress subnet(255,255,255,0);

class PlantFi
{
private:
    HTTPClient http;
    WiFiClientSecure wifiClient;

    String plants_url = "https://plants.hoppingadventure.com/api/plants";
    String measure_url = "https://plants.hoppingadventure.com/api/plants/%d/measures";
public:
    PlantFi()
    {
        Serial.print("Last SSID: ");
        Serial.println(rtcStore.ssid);
        if (!connectWifi())
        {
            startPlantServer(); // this should set ssid and password
            if (connectWifi())
            {
                if (!isPlantIdInit) {
                    rtcStore.plant_id = initPlantId();
                }
            }
        }
        writeToRTC();
    }

    // Returns true if success and false if failed
    boolean connectWifi()
    {
        unsigned long connectionStartTime = millis();
        Serial.print("Current connection: ");
        Serial.println(WiFi.SSID());
        if (WiFi.status() == WL_CONNECTED && WiFi.SSID() == rtcStore.ssid) {
            Serial.println("WiFi already connected");
            return true;
        }
        wifiClient.setInsecure();
        Serial.print("Connecting to: ");
        Serial.println(rtcStore.ssid);
        bool rtcValid = isRtcValid();
        if (rtcValid)
        {
            Serial.println("Rtc is valid, using channel and bssid");
            WiFi.begin(rtcStore.ssid, rtcStore.password, rtcStore.channel, rtcStore.bssid); // WiFi connection quick connect
        }
        else
        {
            Serial.println("Rtc is not valid, establishing new WiFi connection");
            WiFi.begin(rtcStore.ssid, rtcStore.password); // WiFi connection without quick connect
        }
        unsigned long startTime = millis();
        wl_status_t wifiStatus = WiFi.status();
        while (wifiStatus != WL_CONNECTED) // Wait for the WiFI connection completion
        {
            wifiStatus = WiFi.status();
            if (millis()-startTime > 30000 || wifiStatus == WL_IDLE_STATUS || wifiStatus == WL_CONNECT_FAILED) // timeout after 30 seconds or on no connection found
            {
                Serial.println("Connection failed");
                return false;
            }
            delay(500);
        }

        if (!rtcValid) // need to save new channel and bssid
        {
            Serial.println("Saving channel and bssid");
            rtcStore.channel = WiFi.channel();
            setBssid(WiFi.BSSID());
        }

        Serial.print("IP address: ");
        Serial.println(WiFi.localIP());
        Serial.print("Connection successful in: ");
        Serial.println(millis() - connectionStartTime); // takes 4731 ms to connect without quick connect and 2007 with quick connect
        return true;
    }

    int initPlantId()
    {
        Serial.println("Adding new plant");
        http.begin(wifiClient, plants_url);
        http.addHeader("Content-Type", "application/json");
        String requestBody = "{\"name\":\"" + UNDEFINED_NAME + "\"}";
        int httpResponseCode = http.POST(requestBody);
        String payload = http.getString();
        Serial.println(plants_url);
        Serial.println(requestBody);
        Serial.println(payload);
        Serial.println(httpResponseCode);
        http.end();
        
        if (httpResponseCode == HTTP_CODE_CREATED)
        {
            DynamicJsonDocument doc(1024);
            deserializeJson(doc, payload);
            Serial.println((int)doc["id"]);
            return doc["id"];
        }
        return -1;
    }

    void startConnectionToPlantApi()
    {
        char url[128];
        sprintf(url, measure_url.c_str(), rtcStore.plant_id);
        http.begin(wifiClient, url);
        http.addHeader("Content-Type", "application/json");
    }

    void sendMeasurement(unsigned int water, unsigned int sun, float voltage)
    {
        Serial.println("Sending measurement");
        startConnectionToPlantApi();
        char requestBody[128];
        sprintf(requestBody, "{\"water\":%d,\"sun\":%d,\"voltage\":%f}", water, sun, voltage);
        Serial.println(requestBody);

        http.POST(requestBody);
        Serial.println(http.getString());
        http.end();
    }

    void sendReferenceCapacitance(unsigned int referenceCapacitance)
    {
        Serial.println("Sending measurement");
        startConnectionToPlantApi();
        char requestBody[64];
        sprintf(requestBody, "{\"referenceWater\":%d}", referenceCapacitance);
        Serial.println(requestBody);

        http.POST(requestBody);
        Serial.println(http.getString());
        http.end();
    }
};