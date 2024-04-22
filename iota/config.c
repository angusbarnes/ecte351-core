#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "include/config.h"

#define MAX_LINE_LENGTH 100

Config DEFAULT_SERVER_CONFIG = {
    .max_clients = 100, //Max Clients
    .buffer_size = 1204, //Buffer Size
    .connection_timeout = 100, //Connection Timeout
    .max_pending_queue_size = 10, // Max pending connection
    .ip_address = "0.0.0.0", //Ip (DOES NOT GET USED)
    .num_threads = 4 //Thread count
};

Config read_config_from_file(const char *filename) {
    Config config = DEFAULT_SERVER_CONFIG;
    FILE *file = fopen(filename, "r");
    if (file == NULL) {
        printf("Unable to open file %s\n", filename);
        exit(1);
    }

    char line[MAX_LINE_LENGTH];
    while (fgets(line, sizeof(line), file)) {

        if (line[0] == '\n' || (line[0] == '/' && line[1] == '/')) {
            continue;
        }

        char *token = strtok(line, "=");
        if (token != NULL) {
            if (strcmp(token, "MAX_CLIENTS") == 0) {
                token = strtok(NULL, "=");
                if (token != NULL) {
                    config.max_clients = atoi(token);
                }
            } else if (strcmp(token, "BUFFER_SIZE") == 0) {
                token = strtok(NULL, "=");
                if (token != NULL) {
                    config.buffer_size = atoi(token);
                }
            } else if (strcmp(token, "CONNECTION_TIMEOUT") == 0) {
                token = strtok(NULL, "=");
                if (token != NULL) {
                    config.connection_timeout = atoi(token);
                }
            } else if (strcmp(token, "MAX_PENDING_QUEUE_SIZE") == 0) {
                token = strtok(NULL, "=");
                if (token != NULL) {
                    config.max_pending_queue_size = atoi(token);
                }
            } else if (strcmp(token, "IP_ADDRESS") == 0) {
                token = strtok(NULL, "=");
                if (token != NULL) {
                    strncpy(config.ip_address, token, sizeof(config.ip_address));
                    config.ip_address[sizeof(config.ip_address) - 1] = '\0'; // Ensure null-terminated
                }
            } else if (strcmp(token, "NUM_THREADS") == 0) {
                token = strtok(NULL, "=");
                if (token != NULL) {
                    config.num_threads = atoi(token);
                }
            }
        }
    }

    fclose(file);
    return config;
}