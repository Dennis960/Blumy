#include "plantnow.h"
#include <freertos/event_groups.h>
#include "esp_wifi.h"
#include <string.h>
#include <stdio.h>
#include <esp_log.h>
#include <esp_mac.h>
#include <esp_now.h>

#include "plantstore.h"

static const char *TAG = "PLANTNOW";

#define ESPNOW_CHANNEL 1
static const uint8_t broadcast_mac[ESP_NOW_ETH_ALEN] = {0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF};

static uint8_t esp_peer_mac[ESP_NOW_ETH_ALEN] = {0};

uint8_t pmk[] = {0xDA, 0x11, 0xDA, 0xCD, 0x87, 0xEF, 0x1F, 0x7C,
                 0x8C, 0x5B, 0xD4, 0x7F, 0x0E, 0xC3, 0x05, 0x7C};
uint8_t lmk[] = {0xD9, 0x85, 0x42, 0x21, 0x17, 0x27, 0x83, 0x04,
                 0x3C, 0xCA, 0xD6, 0x74, 0xC2, 0x1A, 0x4B, 0xB1};

#define PLANTNOW_EVT_INITIALIZED (1 << 0)    // Indicates that plantnow has been initialized
#define PLANTNOW_EVT_PEER_ADDED (1 << 1)     // Indicates that the MAC address of the peer has been received and is added as a peer
#define PLANTNOW_EVT_WIFI_EXCHANGED (1 << 2) // Indicates that WiFi credentials have been sent or received successfully
#define PLANTNOW_EVT_ERROR (1 << 3)          // Indicates that an error has occurred during the exchange
#define PLANTNOW_EVT_SENT (1 << 4)           // Indicates that the last send operation was successful

static EventGroupHandle_t plantnow_evt_group = NULL;
static bool is_master = false;

typedef struct
{
    char ssid[32];
    char password[64];
} wifi_credentials_t;

static esp_err_t sendMac(const uint8_t *peer_addr)
{
    uint8_t mac[ESP_NOW_ETH_ALEN];
    esp_err_t ret = esp_read_mac(mac, ESP_MAC_WIFI_STA);

    if (ret != ESP_OK)
    {
        ESP_LOGE(TAG, "Failed to read MAC address: %d", ret);
        xEventGroupSetBits(plantnow_evt_group, PLANTNOW_EVT_ERROR);
        return ret;
    }
    ESP_LOGI(TAG, "Sending MAC address: %02X:%02X:%02X:%02X:%02X:%02X",
             mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
    xEventGroupClearBits(plantnow_evt_group, PLANTNOW_EVT_SENT);
    ret = esp_now_send(peer_addr, mac, ESP_NOW_ETH_ALEN);
    if (ret != ESP_OK)
    {
        ESP_LOGE(TAG, "Failed to send MAC address: %d", ret);
        xEventGroupSetBits(plantnow_evt_group, PLANTNOW_EVT_ERROR);
    }
    else
    {
        ESP_LOGI(TAG, "MAC address sent to peer");
    }
    return ret;
}

static void receiveMac(const uint8_t *data, size_t len)
{
    memcpy(esp_peer_mac, data, ESP_NOW_ETH_ALEN);
    ESP_LOGI(TAG, "Received MAC address: %02X:%02X:%02X:%02X:%02X:%02X",
             esp_peer_mac[0], esp_peer_mac[1], esp_peer_mac[2],
             esp_peer_mac[3], esp_peer_mac[4], esp_peer_mac[5]);

    // Add peer for this slave
    esp_now_peer_info_t peerInfo = {0};
    memcpy(peerInfo.peer_addr, esp_peer_mac, ESP_NOW_ETH_ALEN);
    peerInfo.channel = ESPNOW_CHANNEL;
    peerInfo.encrypt = false;
    esp_err_t ret = esp_now_add_peer(&peerInfo);
    if (ret != ESP_OK && ret != ESP_ERR_ESPNOW_EXIST)
    {
        ESP_LOGE(TAG, "Failed to add peer: %d", ret);
        xEventGroupSetBits(plantnow_evt_group, PLANTNOW_EVT_ERROR);
        return;
    }
    ESP_LOGI(TAG, "Peer added successfully");

    if (is_master)
    {
        // Send own MAC to the slave
        ret = sendMac(esp_peer_mac);
        if (ret != ESP_OK)
        {
            ESP_LOGE(TAG, "Failed to send own MAC to slave: %d", ret);
            xEventGroupSetBits(plantnow_evt_group, PLANTNOW_EVT_ERROR);
            return;
        }
    }
    // Make the peer communication encrypted now
    peerInfo.encrypt = true;
    memcpy(peerInfo.lmk, lmk, sizeof(lmk));
    if (esp_now_mod_peer(&peerInfo) != ESP_OK)
    {
        ESP_LOGE(TAG, "Failed to modify peer for encryption");
        xEventGroupSetBits(plantnow_evt_group, PLANTNOW_EVT_ERROR);
        return;
    }
    xEventGroupSetBits(plantnow_evt_group, PLANTNOW_EVT_PEER_ADDED);
}

static void receiveWifiCredentials(const uint8_t *data, size_t len)
{
    wifi_credentials_t creds;
    memcpy(&creds, data, sizeof(creds));
    ESP_LOGI(TAG, "Received WiFi credentials: SSID=%s", creds.ssid);

    // Store credentials to plantstore
    plantstore_setWifiCredentials(creds.ssid, creds.password);
    ESP_LOGI(TAG, "WiFi credentials stored successfully");
    xEventGroupSetBits(plantnow_evt_group, PLANTNOW_EVT_WIFI_EXCHANGED);
}

static void espnow_recv_cb(const esp_now_recv_info_t *esp_now_info, const uint8_t *data, int data_len)
{
    ESP_LOGI(TAG, "Received data from %02X:%02X:%02X:%02X:%02X:%02X, length: %d",
             esp_now_info->src_addr[0], esp_now_info->src_addr[1], esp_now_info->src_addr[2],
             esp_now_info->src_addr[3], esp_now_info->src_addr[4], esp_now_info->src_addr[5], data_len);

    if (data_len == ESP_NOW_ETH_ALEN)
    {
        receiveMac(data, data_len);
    }
    else if (data_len == sizeof(wifi_credentials_t))
    {
        receiveWifiCredentials(data, data_len);
    }
    else
    {
        ESP_LOGW(TAG, "Received unknown data size: %d", data_len);
    }
}

static void espnow_send_cb(const uint8_t *mac_addr, esp_now_send_status_t status)
{
    ESP_LOGI(TAG, "Send status to %02X:%02X:%02X:%02X:%02X:%02X: %s",
             mac_addr[0], mac_addr[1], mac_addr[2], mac_addr[3], mac_addr[4], mac_addr[5],
             status == ESP_NOW_SEND_SUCCESS ? "Success" : "Fail");
    if (status != ESP_NOW_SEND_SUCCESS)
    {
        xEventGroupSetBits(plantnow_evt_group, PLANTNOW_EVT_ERROR);
    }
    xEventGroupSetBits(plantnow_evt_group, PLANTNOW_EVT_SENT);
}

void plantnow_init(bool isMaster)
{
    is_master = isMaster;
    if (!plantnow_evt_group)
    {
        plantnow_evt_group = xEventGroupCreate();
    }
    xEventGroupClearBits(plantnow_evt_group, 0x00FFFFFF);

    esp_wifi_set_channel(ESPNOW_CHANNEL, WIFI_SECOND_CHAN_NONE);

    esp_err_t ret = esp_now_init();
    if (ret != ESP_OK)
    {
        ESP_LOGE(TAG, "ESP-NOW init failed: %d", ret);
        xEventGroupSetBits(plantnow_evt_group, PLANTNOW_EVT_ERROR);
        return;
    }

    ESP_LOGI(TAG, "plantnow initialized as %s", isMaster ? "master" : "slave");
    xEventGroupSetBits(plantnow_evt_group, PLANTNOW_EVT_INITIALIZED);

    esp_now_register_send_cb(espnow_send_cb);
    esp_now_register_recv_cb(espnow_recv_cb);
    esp_now_set_pmk(pmk);
    if (!isMaster)
    {
        // Add broadcast peer so slave can broadcast its MAC
        esp_now_peer_info_t peerInfo = {0};
        memcpy(peerInfo.peer_addr, broadcast_mac, ESP_NOW_ETH_ALEN);
        peerInfo.channel = ESPNOW_CHANNEL;
        peerInfo.encrypt = false;

        ret = esp_now_add_peer(&peerInfo);
        if (ret != ESP_OK && ret != ESP_ERR_ESPNOW_EXIST)
        {
            ESP_LOGE(TAG, "Failed to add broadcast peer: %d", ret);
            xEventGroupSetBits(plantnow_evt_group, PLANTNOW_EVT_ERROR);
        }
        ret = sendMac(broadcast_mac);
        if (ret != ESP_OK)
        {
            ESP_LOGE(TAG, "Failed to send MAC to broadcast peer: %d", ret);
            xEventGroupSetBits(plantnow_evt_group, PLANTNOW_EVT_ERROR);
        }
        esp_now_del_peer(broadcast_mac);
    }

    xEventGroupSetBits(plantnow_evt_group, PLANTNOW_EVT_INITIALIZED);
}
/**
 * Wait until the current send operation is complete.
 * @return true if the send operation completed successfully, false if an error occurred or the timeout was reached.
 */
bool plantnow_waitForSendComplete(TickType_t ticks_to_wait)
{
    if (!plantnow_evt_group)
    {
        ESP_LOGE(TAG, "plantnow not initialized");
        return false;
    }
    EventBits_t bits = xEventGroupWaitBits(plantnow_evt_group,
                                           PLANTNOW_EVT_SENT | PLANTNOW_EVT_ERROR,
                                           pdFALSE, pdFALSE, ticks_to_wait);
    if (bits & PLANTNOW_EVT_ERROR)
    {
        ESP_LOGE(TAG, "Error occurred during send operation");
        return false;
    }
    return (bits & PLANTNOW_EVT_SENT) != 0;
}

/**
 * @brief Send WiFi credentials to the peer.
 * @return ESP_OK on success, or an error code on failure.
 */
esp_err_t plantnow_sendWifiCredentials(bool waitForSendComplete)
{
    wifi_credentials_t creds = {0};
    bool isWifiConfigured = plantstore_getWifiCredentials(creds.ssid, creds.password, sizeof(creds.ssid), sizeof(creds.password));
    if (!isWifiConfigured)
    {
        ESP_LOGE(TAG, "No WiFi credentials found in plantstore");
        xEventGroupSetBits(plantnow_evt_group, PLANTNOW_EVT_ERROR);
        return ESP_ERR_NOT_FOUND;
    }

    ESP_LOGI(TAG, "Sending WiFi credentials to slave");
    xEventGroupClearBits(plantnow_evt_group, PLANTNOW_EVT_SENT);
    esp_err_t ret = esp_now_send(esp_peer_mac, (uint8_t *)&creds, sizeof(creds));
    if (ret != ESP_OK)
    {
        ESP_LOGE(TAG, "Failed to send WiFi credentials: %d", ret);
        xEventGroupSetBits(plantnow_evt_group, PLANTNOW_EVT_ERROR);
        return ret;
    }

    if (waitForSendComplete)
    {
        if (!plantnow_waitForSendComplete(portMAX_DELAY))
        {
            ESP_LOGE(TAG, "Sending WiFi credentials failed");
            return ESP_FAIL;
        }
    }

    xEventGroupSetBits(plantnow_evt_group, PLANTNOW_EVT_WIFI_EXCHANGED);
    esp_now_del_peer(esp_peer_mac);
    xEventGroupClearBits(plantnow_evt_group, PLANTNOW_EVT_PEER_ADDED);

    return ESP_OK;
}

/**
 * @param ticks_to_wait The maximum time to wait for the bits to be set.
 */
void plantnow_wait_for_exchange(TickType_t ticks_to_wait)
{
    if (!plantnow_evt_group)
        return;
    xEventGroupWaitBits(
        plantnow_evt_group,
        PLANTNOW_EVT_ERROR | PLANTNOW_EVT_WIFI_EXCHANGED,
        pdFALSE,
        pdFALSE,
        ticks_to_wait);
}

bool plantnow_hasReceivedPeerMac(void)
{
    if (!plantnow_evt_group)
        return false;
    EventBits_t bits = xEventGroupGetBits(plantnow_evt_group);
    return (bits & PLANTNOW_EVT_PEER_ADDED) != 0;
}

/**
 * @return the MAC address of the peer if it has been received, NULL otherwise.
 */
uint8_t *plantnow_getPeerMac(void)
{
    if (!plantnow_hasReceivedPeerMac())
    {
        return NULL;
    }
    return esp_peer_mac;
}
