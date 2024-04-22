typedef struct {
    int max_clients;
    int buffer_size;
    int connection_timeout;
    int max_pending_queue_size;
    char ip_address[16];
    int num_threads;
} Config;

Config read_config_from_file(const char *filename);

extern Config DEFAULT_SERVER_CONFIG;