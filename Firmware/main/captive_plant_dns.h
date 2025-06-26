#pragma once
#include "freertos/FreeRTOS.h"

// DNS header structure
typedef struct __attribute__((packed))
{
  uint16_t id;
  uint16_t flags;
  uint16_t qdcount;
  uint16_t ancount;
  uint16_t nscount;
  uint16_t arcount;
} DnsHeader;

typedef struct __attribute__((packed))
{
  uint16_t type;
  uint16_t cl;
} DnsQuestionFooter;

typedef struct __attribute__((packed))
{
  uint16_t type;
  uint16_t cl;
  uint32_t ttl;
  uint16_t rdlength;
} DnsResourceFooter;

void captive_plant_dns_init();
