#include "plantnow.h"
#include <freertos/event_groups.h>
#include "esp_wifi.h"
#include <string.h>
#include <stdio.h>
#include <esp_log.h>
#include <esp_mac.h>
#include <esp_now.h>

#include "plantstore.h"

static const char *TAG = "plantnow";

#define ESPNOW_CHANNEL 1
static const uint8_t broadcast_mac[ESP_NOW_ETH_ALEN] = {0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF};

static uint8_t esp_peer_mac[ESP_NOW_ETH_ALEN] = {0};

// Event group bits for state
#define PLANTNOW_EVT_UNINITIALIZED (1 << 0)
#define PLANTNOW_EVT_INITIALIZED (1 << 1)
#define PLANTNOW_EVT_MAC_BROADCASTED (1 << 2)
#define PLANTNOW_EVT_MAC_RECEIVED (1 << 3)
#define PLANTNOW_EVT_WIFI_SENT (1 << 4)
#define PLANTNOW_EVT_ERROR (1 << 5)

static EventGroupHandle_t plantnow_evt_group = NULL;

typedef struct
{
    char ssid[32];
    char password[64];
} wifi_credentials_t;

static esp_err_t sendWifiCredentials()
{
    wifi_credentials_t creds = {0};
    bool isWifiConfigured = plantstore_getWifiCredentials(creds.ssid, creds.password, sizeof(creds.ssid), sizeof(creds.password));
    if (!isWifiConfigured)
    {
        ESP_LOGE(TAG, "No WiFi credentials found in plantstore");
        xEventGroupSetBits(plantnow_evt_group, PLANTNOW_EVT_ERROR);
        return ESP_ERR_NOT_FOUND;
    }

    esp_err_t ret = esp_now_send(esp_peer_mac, (uint8_t *)&creds, sizeof(creds));
    if (ret != ESP_OK)
    {
        ESP_LOGE(TAG, "Failed to send WiFi credentials: %d", ret);
        xEventGroupSetBits(plantnow_evt_group, PLANTNOW_EVT_ERROR);
    }
    else
    {
        ESP_LOGI(TAG, "WiFi credentials sent to slave");
        xEventGroupSetBits(plantnow_evt_group, PLANTNOW_EVT_WIFI_SENT);
    }

    return ret;
}

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
    ret = esp_now_send(peer_addr, mac, ESP_NOW_ETH_ALEN);
    if (ret != ESP_OK)
    {
        ESP_LOGE(TAG, "Failed to send MAC address: %d", ret);
        xEventGroupSetBits(plantnow_evt_group, PLANTNOW_EVT_ERROR);
    }
    else
    {
        ESP_LOGI(TAG, "MAC address sent to peer");
        xEventGroupSetBits(plantnow_evt_group, PLANTNOW_EVT_MAC_BROADCASTED);
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
    xEventGroupSetBits(plantnow_evt_group, PLANTNOW_EVT_MAC_RECEIVED);

    ret = sendWifiCredentials();
    if (ret != ESP_OK)
    {
        ESP_LOGE(TAG, "Failed to send WiFi credentials");
        xEventGroupSetBits(plantnow_evt_group, PLANTNOW_EVT_ERROR);
    }
}

static void receiveWifiCredentials(const uint8_t *data, size_t len)
{
    wifi_credentials_t creds;
    memcpy(&creds, data, sizeof(creds));
    ESP_LOGI(TAG, "Received WiFi credentials: SSID=%s", creds.ssid);

    // Store credentials to plantstore
    plantstore_setWifiCredentials(creds.ssid, creds.password);
    ESP_LOGI(TAG, "WiFi credentials stored successfully");
    xEventGroupSetBits(plantnow_evt_group, PLANTNOW_EVT_WIFI_SENT);
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
}

void plantnow_init(bool isMaster)
{
    if (!plantnow_evt_group)
    {
        plantnow_evt_group = xEventGroupCreate();
    }
    xEventGroupClearBits(plantnow_evt_group, 0x00FFFFFF);
    xEventGroupSetBits(plantnow_evt_group, PLANTNOW_EVT_UNINITIALIZED);

    esp_wifi_set_channel(ESPNOW_CHANNEL, WIFI_SECOND_CHAN_NONE);

    esp_err_t ret = esp_now_init();
    if (ret != ESP_OK)
    {
        ESP_LOGE(TAG, "ESP-NOW init failed: %d", ret);
        xEventGroupSetBits(plantnow_evt_group, PLANTNOW_EVT_ERROR);
        return;
    }

    xEventGroupClearBits(plantnow_evt_group, PLANTNOW_EVT_UNINITIALIZED);

    esp_now_register_send_cb(espnow_send_cb);
    esp_now_register_recv_cb(espnow_recv_cb);
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
    }

    ESP_LOGI(TAG, "plantnow initialized as %s", isMaster ? "master" : "slave");
    xEventGroupSetBits(plantnow_evt_group, PLANTNOW_EVT_INITIALIZED);
}

esp_err_t plantnow_connectToMaster(void)
{
    ESP_LOGI(TAG, "Connecting to master...");
    return sendMac(broadcast_mac);
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
        PLANTNOW_EVT_ERROR | PLANTNOW_EVT_WIFI_SENT,
        pdFALSE,
        pdFALSE,
        ticks_to_wait);
}
