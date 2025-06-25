#include "update.h"

#include "esp_log.h"

#include "plantstore.h"
#include "defaults.h"

#include "esp_https_ota.h"

float *_ota_update_percentage = NULL;

void ota_update_task(void *pvParameter)
{
    ESP_LOGI("OTA", "Starting OTA update task");
    char url[100] = DEFAULT_FIRMWARE_UPDATE_URL;
    if (!plantstore_getFirmwareUpdateUrl(url, 100))
    {
        ESP_LOGE("OTA", "No firmware update URL set");
        vTaskDelete(NULL);
        return;
    }

    esp_http_client_config_t config = {
        .url = url,
        .cert_pem = NULL,
        .timeout_ms = 10000,
    };
    esp_https_ota_config_t ota_config = {
        .http_config = &config,
        .http_client_init_cb = NULL,
    };
    esp_https_ota_handle_t handle = NULL;
    esp_err_t err = esp_https_ota_begin(&ota_config, &handle);
    if (err != ESP_OK)
    {
        ESP_LOGE("OTA", "Failed to start OTA (%s)", esp_err_to_name(err));
        vTaskDelete(NULL);
        return;
    }

    int otaImageSize = esp_https_ota_get_image_size(handle);
    if (otaImageSize < 0)
    {
        ESP_LOGE("OTA", "Failed to get image size (%d)", otaImageSize);
        esp_https_ota_abort(handle);
        vTaskDelete(NULL);
        return;
    }
    while (1)
    {
        err = esp_https_ota_perform(handle);
        int otaImageLenRead = esp_https_ota_get_image_len_read(handle);
        if (_ota_update_percentage != NULL && otaImageSize > 0)
        {
            *_ota_update_percentage = (float)otaImageLenRead / otaImageSize * 100;
        }
        if (err == ESP_ERR_HTTPS_OTA_IN_PROGRESS)
        {
            continue;
        }
        if (err == ESP_OK)
        {
            break;
        }
        else
        {
            ESP_LOGE("OTA", "Failed to perform OTA (%s)", esp_err_to_name(err));
            esp_https_ota_abort(handle);
            vTaskDelete(NULL);
            return;
        }
    }
    err = esp_https_ota_finish(handle);
    if (err != ESP_OK)
    {
        ESP_LOGE("OTA", "Failed to finish OTA (%s)", esp_err_to_name(err));
        vTaskDelete(NULL);
        return;
    }

    ESP_LOGI("OTA", "OTA finished, restarting");
    esp_restart();
    vTaskDelete(NULL);
}

void update_updateFirmware(float *ota_update_percentage)
{
    _ota_update_percentage = ota_update_percentage;
    xTaskCreate(ota_update_task, "ota_update_task", 8192, NULL, 5, NULL);
}