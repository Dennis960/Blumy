#ifndef ConfigurationMode_H
#define ConfigurationMode_H

#include <Arduino.h>
#include <ESPAsyncWebServer.h>
#include <DNSServer.h>
#include <LittleFS.h>
#include <ArduinoJson.h>

#include "Config.h"
#include "Utils.h"
#include "MyEeprom.h"

#define AP_SSID "PlantFi"

extern AsyncWebServer server;
extern DNSServer dnsServer;
extern String networksJson;

extern bool shouldConnectToWifi;
extern String ssid;
extern String password;

extern bool shouldReset;

/**
 * Setup function for the configuration mode
 */
void configurationSetup();

/**
 * Loop function for the configuration mode
 */
void configurationLoop();

/**
 * Reset the device
 * @param resetFlag The reset flag to set
 */
void reset(uint32_t resetFlag);

/**
 * Function descriptions:
 * 
 * Needs <Type> <Name> parameters
 * Triggers <Action>
 * Sends <File> | <Type> response with <Content>
*/

/**
 * Sends 404.html
 */
void handleGetNotFound(AsyncWebServerRequest *request);

/**
 * Sends index.html
 */
void handleGetIndex(AsyncWebServerRequest *request);

/**
 * Sends wifi-manager.html
 */
void handleGetWifiManager(AsyncWebServerRequest *request);

/**
 * Needs String ssid, String password
 * Triggers shouldConnectToWifi = true
 * Sends application/json response with "1"
 */
void handlePostConnect(AsyncWebServerRequest *request);

/**
 * Triggers shouldReset = true
 */
void handlePostReset(AsyncWebServerRequest *request);

/**
 * Triggers WiFi.scanNetworks
 * Sends application/json response with the networks
 * 
 * First call returns an empty array
 */
void handleGetNetworks(AsyncWebServerRequest *request);

/**
 * Sends text/plain response with the wifi status
 * 
 * 0 : WL_IDLE_STATUS when Wi-Fi is in process of changing between statuses
 * 1 : WL_NO_SSID_AVAILin case configured SSID cannot be reached
 * 3 : WL_CONNECTED after successful connection is established
 * 4 : WL_CONNECT_FAILED if connection failed
 * 6 : WL_CONNECT_WRONG_PASSWORD if password is incorrect
 * 7 : WL_DISCONNECTED if module is not configured in station mode
 */
void handleGetIsConnected(AsyncWebServerRequest *request);

/**
 * Needs String mqttServer, int mqttPort, String mqttUsername, String mqttPassword
 * Triggers saves the mqtt settings to EEPROM
*/
void handlePostMqttSetup(AsyncWebServerRequest *request);

/**
 * Needs int sensorId
 * Triggers saves the sensorId to EEPROM
*/
void handlePostSensorId(AsyncWebServerRequest *request);

/**
 * Sends text/plain response with the sensorId
*/
void handleGetSensorId(AsyncWebServerRequest *request);
#endif