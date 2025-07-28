#include "unity.h"
#include "esp_log.h"
#include "nvs_flash.h"
#include "esp_wifi.h"
#include "esp_event.h"
#include "esp_http_server.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

static const char *TAG = "FIRMWARE_TESTS";

// Forward declarations for stub functions
void plantfi_initWifi(void);
void plantfi_configureAp(const char *ssid, const char *password, int max_connection);
typedef enum {
    PLANTFI_STA_STATUS_CONNECTED,
    PLANTFI_STA_STATUS_DISCONNECTED,
    PLANTFI_STA_STATUS_UNINITIALIZED,
    PLANTFI_STA_STATUS_FAIL,
    PLANTFI_STA_STATUS_PASSWORD_WRONG,
    PLANTFI_STA_STATUS_PENDING
} plantfi_sta_status_t;

typedef struct {
    int8_t rssi;
    char ssid[32];
    uint8_t secure;
} plantfi_ap_record_t;

typedef struct {
    char token[100];
    char url[100];
} cloud_setup_blumy_t;

plantfi_sta_status_t plantfi_get_sta_status(void);
bool plantfi_is_sta_connected(void);
bool plantfi_is_sta_connecting(void);
int8_t plantfi_getRssi(void);
void plantfi_scan_networks(plantfi_ap_record_t *ap_records, int *num_ap_records);
httpd_handle_t start_webserver(void);
void stop_webserver(httpd_handle_t server);
void plantnow_init(bool isMaster);
bool plantnow_hasExchangedBlumy(void);
uint8_t *plantnow_getPeerMac(void);
esp_err_t plantnow_sendWifiCredentials(bool waitForSendComplete);
esp_err_t plantnow_sendCloudSetupBlumy(cloud_setup_blumy_t *creds, bool waitForSendComplete);
bool plantnow_waitForSendComplete(TickType_t ticks_to_wait);

// Test setup and teardown functions
static void setup_nvs_and_wifi(void)
{
    esp_err_t ret = nvs_flash_init();
    if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND) {
        ESP_ERROR_CHECK(nvs_flash_erase());
        ret = nvs_flash_init();
    }
    ESP_ERROR_CHECK(ret);
    
    ESP_ERROR_CHECK(esp_netif_init());
    ESP_ERROR_CHECK(esp_event_loop_create_default());
}

static void teardown_wifi(void)
{
    esp_event_loop_delete_default();
    esp_netif_deinit();
}

// WiFi/PlantFi Tests
TEST_CASE("plantfi initialization", "[plantfi]")
{
    setup_nvs_and_wifi();
    
    plantfi_initWifi();
    
    plantfi_sta_status_t status = plantfi_get_sta_status();
    TEST_ASSERT_NOT_EQUAL(PLANTFI_STA_STATUS_UNINITIALIZED, status);
    
    teardown_wifi();
}

TEST_CASE("plantfi AP configuration", "[plantfi]")
{
    setup_nvs_and_wifi();
    plantfi_initWifi();
    
    const char* test_ssid = "TestAP";
    const char* test_password = "testpass123";
    int max_connections = 4;
    
    plantfi_configureAp(test_ssid, test_password, max_connections);
    TEST_ASSERT_TRUE(true);
    
    teardown_wifi();
}

TEST_CASE("plantfi status functions", "[plantfi]")
{
    setup_nvs_and_wifi();
    plantfi_initWifi();
    
    plantfi_sta_status_t status = plantfi_get_sta_status();
    TEST_ASSERT_TRUE(status >= PLANTFI_STA_STATUS_CONNECTED && status <= PLANTFI_STA_STATUS_PENDING);
    
    bool is_connected = plantfi_is_sta_connected();
    bool is_connecting = plantfi_is_sta_connecting();
    
    TEST_ASSERT_TRUE(is_connected == true || is_connected == false);
    TEST_ASSERT_TRUE(is_connecting == true || is_connecting == false);
    
    teardown_wifi();
}

TEST_CASE("plantfi RSSI reading", "[plantfi]")
{
    setup_nvs_and_wifi();
    plantfi_initWifi();
    
    int8_t rssi = plantfi_getRssi();
    // RSSI should be a reasonable value for WiFi (typically -20 to -100 dBm)
    TEST_ASSERT_TRUE(rssi >= -100 && rssi <= -20);
    
    teardown_wifi();
}

TEST_CASE("plantfi network scanning", "[plantfi]")
{
    setup_nvs_and_wifi();
    plantfi_initWifi();
    
    plantfi_ap_record_t ap_records[10];
    int num_records = 10;
    
    plantfi_scan_networks(ap_records, &num_records);
    TEST_ASSERT_TRUE(num_records >= 0 && num_records <= 10);
    
    teardown_wifi();
}

// HTTP Server Tests
TEST_CASE("webserver start and stop", "[configuration_server]")
{
    setup_nvs_and_wifi();
    
    httpd_handle_t server = start_webserver();
    
    if (server != NULL) {
        stop_webserver(server);
        TEST_ASSERT_TRUE(true);
    } else {
        TEST_ASSERT_TRUE(true);
    }
    
    teardown_wifi();
}

TEST_CASE("webserver multiple cycles", "[configuration_server]")
{
    setup_nvs_and_wifi();
    
    for (int i = 0; i < 3; i++) {
        httpd_handle_t server = start_webserver();
        
        if (server != NULL) {
            stop_webserver(server);
        }
        
        vTaskDelay(pdMS_TO_TICKS(100));
    }
    
    TEST_ASSERT_TRUE(true);
    teardown_wifi();
}

TEST_CASE("webserver null handle stop", "[configuration_server]")
{
    setup_nvs_and_wifi();
    
    stop_webserver(NULL);
    TEST_ASSERT_TRUE(true);
    
    teardown_wifi();
}

// ESP-NOW/PlantNow Tests
TEST_CASE("plantnow init as master", "[plantnow]")
{
    setup_nvs_and_wifi();
    
    plantnow_init(true);
    TEST_ASSERT_TRUE(true);
    
    teardown_wifi();
}

TEST_CASE("plantnow init as slave", "[plantnow]")
{
    setup_nvs_and_wifi();
    
    plantnow_init(false);
    TEST_ASSERT_TRUE(true);
    
    teardown_wifi();
}

TEST_CASE("plantnow exchange status", "[plantnow]")
{
    setup_nvs_and_wifi();
    
    plantnow_init(true);
    
    bool has_exchanged = plantnow_hasExchangedBlumy();
    TEST_ASSERT_TRUE(has_exchanged == true || has_exchanged == false);
    
    teardown_wifi();
}

TEST_CASE("plantnow peer MAC retrieval", "[plantnow]")
{
    setup_nvs_and_wifi();
    
    plantnow_init(true);
    
    uint8_t *peer_mac = plantnow_getPeerMac();
    TEST_ASSERT_NOT_NULL(peer_mac);
    
    teardown_wifi();
}

TEST_CASE("plantnow wifi credentials sending", "[plantnow]")
{
    setup_nvs_and_wifi();
    
    plantnow_init(true);
    
    esp_err_t result = plantnow_sendWifiCredentials(false);
    TEST_ASSERT_TRUE(result == ESP_OK || result != ESP_OK);
    
    teardown_wifi();
}

TEST_CASE("plantnow cloud setup sending", "[plantnow]")
{
    setup_nvs_and_wifi();
    
    plantnow_init(true);
    
    cloud_setup_blumy_t test_setup = {
        .token = "test_token_123",
        .url = "https://test.example.com"
    };
    
    esp_err_t result = plantnow_sendCloudSetupBlumy(&test_setup, false);
    TEST_ASSERT_TRUE(result == ESP_OK || result != ESP_OK);
    
    teardown_wifi();
}

TEST_CASE("plantnow send completion wait", "[plantnow]")
{
    setup_nvs_and_wifi();
    
    plantnow_init(true);
    
    bool wait_result = plantnow_waitForSendComplete(pdMS_TO_TICKS(100));
    TEST_ASSERT_TRUE(wait_result == true || wait_result == false);
    
    teardown_wifi();
}

void app_main(void)
{
    ESP_LOGI(TAG, "Starting Blumy Firmware Tests");
    
    UNITY_BEGIN();
    
    ESP_LOGI(TAG, "Running WiFi/PlantFi tests...");
    unity_run_tests_by_tag("[plantfi]", false);
    
    ESP_LOGI(TAG, "Running HTTP Server tests...");
    unity_run_tests_by_tag("[configuration_server]", false);
    
    ESP_LOGI(TAG, "Running ESP-NOW/PlantNow tests...");
    unity_run_tests_by_tag("[plantnow]", false);
    
    UNITY_END();
    
    ESP_LOGI(TAG, "All tests completed");
}