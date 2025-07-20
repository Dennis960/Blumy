#include "plantdns.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "lwip/sockets.h"
#include "lwip/inet.h"
#include "string.h"
#include "esp_log.h"

#define DNS_PORT 53
#define DNS_RESP_IP {192, 168, 4, 1} // Your ESP32 AP IP
#define TAG "PLANTDNS"

static TaskHandle_t dns_task_handle = NULL;
static volatile bool dns_running = false;

static void dns_task(void *arg)
{
    struct sockaddr_in server_addr, client_addr;
    socklen_t addr_len = sizeof(client_addr);
    uint8_t rx_buffer[512];

    int sock = socket(AF_INET, SOCK_DGRAM, IPPROTO_UDP);
    if (sock < 0)
    {
        ESP_LOGE(TAG, "Failed to create socket");
        vTaskDelete(NULL);
        return;
    }

    server_addr.sin_family = AF_INET;
    server_addr.sin_port = htons(DNS_PORT);
    server_addr.sin_addr.s_addr = htonl(INADDR_ANY);

    if (bind(sock, (struct sockaddr *)&server_addr, sizeof(server_addr)) < 0)
    {
        ESP_LOGE(TAG, "Socket bind failed");
        close(sock);
        vTaskDelete(NULL);
        return;
    }
    while (dns_running)
    {
        int len = recvfrom(sock, rx_buffer, sizeof(rx_buffer), 0,
                           (struct sockaddr *)&client_addr, &addr_len);
        if (len < 12)
            continue;

        char client_ip[INET_ADDRSTRLEN];
        inet_ntop(AF_INET, &client_addr.sin_addr, client_ip, sizeof(client_ip));

        // Parse domain name from DNS query
        char domain[256] = {0};
        int idx = 12; // DNS header is 12 bytes
        int domain_pos = 0;
        while (idx < len && rx_buffer[idx] != 0 && domain_pos < sizeof(domain) - 2)
        {
            uint8_t label_len = rx_buffer[idx++];
            if (label_len == 0 || idx + label_len > len)
                break;
            if (domain_pos != 0)
                domain[domain_pos++] = '.';
            memcpy(&domain[domain_pos], &rx_buffer[idx], label_len);
            domain_pos += label_len;
            idx += label_len;
        }
        domain[domain_pos] = '\0';

        ESP_LOGI(TAG, "DNS request from %s for domain: %s", client_ip, domain);

        // If not connectivitycheck.gstatic.com, ignore the request
        if (strcmp(domain, "connectivitycheck.gstatic.com") != 0)
        {
            ESP_LOGI(TAG, "Ignoring DNS request for domain: %s", domain);
            continue;
        }

        uint8_t qname_end = 12;
        while (qname_end < len && rx_buffer[qname_end] != 0)
            qname_end++;
        if (qname_end >= len - 4)
            continue;

        uint8_t tx_buffer[512];
        memcpy(tx_buffer, rx_buffer, len);
        tx_buffer[2] = 0x81;
        tx_buffer[3] = 0x80;
        tx_buffer[7] = 1;

        int answer_offset = len;

        tx_buffer[answer_offset++] = 0xC0;
        tx_buffer[answer_offset++] = 0x0C;

        tx_buffer[answer_offset++] = 0x00;
        tx_buffer[answer_offset++] = 0x01;

        tx_buffer[answer_offset++] = 0x00;
        tx_buffer[answer_offset++] = 0x01;

        tx_buffer[answer_offset++] = 0x00;
        tx_buffer[answer_offset++] = 0x00;
        tx_buffer[answer_offset++] = 0x00;
        tx_buffer[answer_offset++] = 0x1E;

        tx_buffer[answer_offset++] = 0x00;
        tx_buffer[answer_offset++] = 0x04;

        uint8_t ip[4] = DNS_RESP_IP;
        memcpy(&tx_buffer[answer_offset], ip, 4);
        answer_offset += 4;

        sendto(sock, tx_buffer, answer_offset, 0, (struct sockaddr *)&client_addr, addr_len);
    }
    close(sock);
    vTaskDelete(NULL);
}

void plantdns_start()
{
    dns_running = true;
    xTaskCreate(dns_task, "dns_task", 4096, NULL, 5, &dns_task_handle);
}

void plantdns_stop()
{
    dns_running = false;
}

bool plantdns_is_running()
{
    return dns_task_handle != NULL;
}
