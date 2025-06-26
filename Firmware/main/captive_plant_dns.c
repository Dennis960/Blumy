#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_log.h"
#include "lwip/sockets.h"
#include "esp_netif.h"
#include <string.h>
#include "captive_plant_dns.h"

#define DNS_PORT 53
#define DNS_BUF_SIZE 512

static const char *TAG = "dns";
static int sock_fd;

/**
 * Domains that should be forwarded to Google's DNS for the blumy.cloud website to work properly.
 */
const char *blumy_hosts[] = {
    "blumy.cloud",
    "accounts.google.com",
    "oauth2.googleapis.com",
    "www.googleapis.com",
    "apis.google.com",
    "accounts.gstatic.com",
    "fonts.googleapis.com",
    "fonts.gstatic.com",
    "www.google.com",
    "csp.withgoogle.com",
    "www.gstatic.com",
    "content-autofill.googleapis.com",
    "accounts.youtube.com",
    "play.google.com",
};

bool is_blumy_host(const char *host)
{
  for (int i = 0; blumy_hosts[i] != NULL; i++)
  {
    if (strcmp(host, blumy_hosts[i]) == 0)
    {
      return true;
    }
  }
  return false;
}

static char *label_to_str(char *packet, char *label, int packet_len, char *res, int res_len)
{
  int i = 0;
  while (*label && (label - packet < packet_len))
  {
    int len = *label++;
    if (i && i < res_len)
      res[i++] = '.';
    while (len-- && (label - packet < packet_len))
    {
      if (i < res_len)
        res[i++] = *label++;
    }
  }
  res[i] = '\0';
  return label + 1;
}

static char *str_to_label(const char *str, char *label, int max_len)
{
  char *len = label++;
  int count = 0;
  while (*str)
  {
    if (*str == '.')
    {
      *len = count;
      count = 0;
      len = label++;
      str++;
    }
    else
    {
      *label++ = *str++;
      count++;
    }
  }
  *len = count;
  *label++ = 0;
  return label;
}

// Forward the DNS query to Google's 8.8.8.8 and send response back to client
static void dns_forward_query(struct sockaddr_in *client, const char *req, int len)
{
  int forward_sock = socket(AF_INET, SOCK_DGRAM, 0);
  if (forward_sock < 0)
  {
    ESP_LOGE(TAG, "Failed to create forwarding socket");
    return;
  }

  struct sockaddr_in google_dns = {
      .sin_family = AF_INET,
      .sin_port = htons(53),
  };
  inet_pton(AF_INET, "8.8.8.8", &google_dns.sin_addr);

  // Send query to Google DNS
  int sent = sendto(forward_sock, req, len, 0, (struct sockaddr *)&google_dns, sizeof(google_dns));
  if (sent < 0)
  {
    ESP_LOGE(TAG, "Failed to forward query to Google DNS");
    close(forward_sock);
    return;
  }

  // Set a receive timeout (e.g. 2 seconds) so we don't block forever
  struct timeval tv = {.tv_sec = 2, .tv_usec = 0};
  setsockopt(forward_sock, SOL_SOCKET, SO_RCVTIMEO, &tv, sizeof(tv));

  char forward_reply[DNS_BUF_SIZE];
  struct sockaddr_in from;
  socklen_t fromlen = sizeof(from);

  // Receive response from Google DNS
  int resp_len = recvfrom(forward_sock, forward_reply, sizeof(forward_reply), 0, (struct sockaddr *)&from, &fromlen);
  if (resp_len < 0)
  {
    ESP_LOGE(TAG, "No response from Google DNS");
    close(forward_sock);
    return;
  }

  // Send Google's response back to original client
  sendto(sock_fd, forward_reply, resp_len, 0, (struct sockaddr *)client, sizeof(*client));

  ESP_LOGI(TAG, "Forwarded DNS query to Google and sent response back to client: %s:%d", inet_ntoa(client->sin_addr), ntohs(client->sin_port));

  close(forward_sock);
}

static void dns_send_response(struct sockaddr_in *client, const char *req, int len)
{
  char reply[DNS_BUF_SIZE];
  char name[256];
  memcpy(reply, req, len);

  DnsHeader *hdr = (DnsHeader *)req;
  DnsHeader *rhdr = (DnsHeader *)reply;
  rhdr->flags |= htons(0x8000); // set QR bit (response)
  rhdr->ancount = 0;

  char *reader = (char *)req + sizeof(DnsHeader);
  char *writer = reply + len;

  for (int i = 0; i < ntohs(hdr->qdcount); i++)
  {
    reader = label_to_str((char *)req, reader, len, name, sizeof(name));

    if (is_blumy_host(name))
    {
      ESP_LOGI(TAG, "Forwarding query for %s to Google DNS", name);
      dns_forward_query(client, req, len);
      return;
    }
    else
    {
      ESP_LOGI(TAG, "Not forwarding query for %s, handling locally", name);
    }

    DnsQuestionFooter *qf = (DnsQuestionFooter *)reader;
    reader += sizeof(DnsQuestionFooter);

    uint16_t qtype = ntohs(qf->type);
    uint16_t qclass = ntohs(qf->cl);
    ESP_LOGI(TAG, "Query for %s, type %u class %u", name, qtype, qclass);

    if (qtype == 1)
    { // A record
      writer = str_to_label(name, writer, DNS_BUF_SIZE - (writer - reply));
      DnsResourceFooter *rf = (DnsResourceFooter *)writer;
      writer += sizeof(DnsResourceFooter);
      rf->type = htons(1);
      rf->cl = htons(1);
      rf->ttl = htonl(0);
      rf->rdlength = htons(4);
      esp_netif_ip_info_t ip;
      esp_netif_get_ip_info(esp_netif_next(NULL), &ip);
      *writer++ = ip4_addr1(&ip.ip);
      *writer++ = ip4_addr2(&ip.ip);
      *writer++ = ip4_addr3(&ip.ip);
      *writer++ = ip4_addr4(&ip.ip);
      rhdr->ancount = htons(ntohs(rhdr->ancount) + 1);
    }
  }

  sendto(sock_fd, reply, writer - reply, 0, (struct sockaddr *)client, sizeof(struct sockaddr_in));
}

static void dns_task(void *arg)
{
  struct sockaddr_in server_addr = {
      .sin_family = AF_INET,
      .sin_addr.s_addr = INADDR_ANY,
      .sin_port = htons(DNS_PORT)};

  sock_fd = socket(AF_INET, SOCK_DGRAM, 0);
  bind(sock_fd, (struct sockaddr *)&server_addr, sizeof(server_addr));

  ESP_LOGI(TAG, "DNS server started on port %d", DNS_PORT);

  while (1)
  {
    struct sockaddr_in from;
    socklen_t fromlen = sizeof(from);
    char buf[DNS_BUF_SIZE];

    int len = recvfrom(sock_fd, buf, sizeof(buf), 0, (struct sockaddr *)&from, &fromlen);
    if (len > 0)
    {
      dns_send_response(&from, buf, len);
    }
  }

  close(sock_fd);
  vTaskDelete(NULL);
}

void captive_plant_dns_init()
{
  xTaskCreate(dns_task, "dns_task", 4096, NULL, 3, NULL);
}
