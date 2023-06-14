#ifndef ConfigurationMode_H
#define ConfigurationMode_H

#include <Arduino.h>
#include <ESPAsyncWebServer.h>
#include <DNSServer.h>
#include <LittleFS.h>
#include <ArduinoJson.h>
#include <Updater.h>

#include "Config.h"
#include "Utils.h"
#include "MyEeprom.h"

#define AP_SSID "PlantFi"

extern AsyncWebServer server;
extern DNSServer dnsServer;
extern String networksJson;
extern IPAddress apiIP;
extern IPAddress mask;

extern bool shouldConnectToWifi;
extern String ssid;
extern String password;

extern bool shouldReset;

extern int updatePercentage;

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
 */

/**
 * Triggers redirect to /
 */
void handleGetNotFound(AsyncWebServerRequest *request);

/**
 * Needs String ssid, String password
 * Triggers shouldConnectToWifi = true
 * Sends application/json response with "OK"
 */
void handlePostConnect(AsyncWebServerRequest *request);

/**
 * Triggers shouldReset = true
 * Needs resetFlag (Optional) to specify which mode to reset to
 * Default mode is CONFIGURATION_FLAG
 * Available modes:
 * 0 : SENSOR_FLAG
 * 1 : CONFIGURATION_FLAG
 * Sends application/json response with "OK"
 */
void handlePostReset(AsyncWebServerRequest *request);

/**
 * Scans for wifi networks.
 * After running at least once, the networksJson variable will be populated with the networks
 */
void scanNetworks();

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

/**
 * Sends update.html
*/
void handleGetUpdateRescue(AsyncWebServerRequest *request);

/**
 * Sends the percentage of an update as integer between 0 and 100
*/
void handleGetUpdatePercentage(AsyncWebServerRequest *request);

/**
 * Needs a file to upload
 * Triggers the update process
 * Sends text/plain response when done
 * 
 * cmd specifies the type of update (FLASH or FS)
*/
void handlePostUpdate(AsyncWebServerRequest *request, const String &filename, size_t index, uint8_t *data, size_t len, bool final, int cmd);

/**
 * Begins the update
*/
void beginUpdate(AsyncWebServerRequest *request, const String &filename, int cmd);

/**
 * Handles the update
*/
void handleUpdate(uint8_t *data, size_t len);

/**
 * Ends the update
*/
void endUpdate(AsyncWebServerRequest *request, int cmd);

/**
 * Blinks the led when doing an update
*/
void blinkUpdateLed();

/**
 * Needs String name
 * Triggers saves the plantName to EEPROM
 */
void handlePostPlantName(AsyncWebServerRequest *request);

#endif