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
extern unsigned long lastNetworkScan;
extern const unsigned long networkScanInterval;

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
 * Handle the root request
 */
void handleRoot(AsyncWebServerRequest *request);

/**
 * Handle the wifi manager request
 */
void handleWifiManager(AsyncWebServerRequest *request);

/**
 * Handle the not found request
 */
void handleNotFound(AsyncWebServerRequest *request);

/**
 * Handle the wifi request
 */
void handleConnect(AsyncWebServerRequest *request);

/**
 * Handle the reset request
 */
void handleReset(AsyncWebServerRequest *request);

/**
 * Handle the networks request. This will return a json array of all the networks
 */
void handleNetworks(AsyncWebServerRequest *request);

/**
 * Handle the isConnected request
 */
void handleIsConnected(AsyncWebServerRequest *request);
#endif