#pragma once

#include "esp_http_server.h"

/* Function for starting the webserver */
httpd_handle_t start_webserver(bool resetReasonOta);
/* Function for stopping the webserver */
void stop_webserver(httpd_handle_t server);