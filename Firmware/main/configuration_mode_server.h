#pragma once

#include "esp_http_server.h"

/* Function for starting the webserver */
httpd_handle_t start_webserver(void);
httpd_handle_t start_https_webserver(void);
/* Function for stopping the webserver */
void stop_webserver(httpd_handle_t server);
void stop_https_webserver(httpd_handle_t server);