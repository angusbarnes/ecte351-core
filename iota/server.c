#include <string.h>
#include <sys/socket.h>
#include <arpa/inet.h>
#include <fcntl.h>
#include <sys/time.h>
#include <sys/errno.h>
#include <signal.h>
#include "lib/include.h"

#define MAX_CLIENTS 100
#define CONNECTION_TIMEOUT 100 // Timeout in ms
#define MAX_PENDING_QUEUE_SIZE 10
#define TCP_STATELESS 0
#define TCP_PERSISTENT 1

#define MARK_AS_CLOSED(x) x->status = SHOULD_CLOSE

#define CF_WANTS_PERSISTENCE = 01
#define CF_WANTS_AUTHORITY

typedef enum {
    IS_FREE = -1,
    IS_CONNECTED = 0,
    IS_ALIVE = 1,
    SHOULD_CLOSE = 2
} ConnectionStatus;

typedef struct {
    int client_fd;
    struct timeval last_activity_time;
    char persistent;
    ConnectionStatus status;
} Client;

typedef uint8_t MACAdress[6];
typedef uint8_t SimpleDataFrame[16];

#define MSG_FIXED_DATA_FRAME 255
#define MSG_SIMPLE_DATA_FRAME 100
#define MSG_VARIABLE_DATA_FRAME 70
#define FLAG_IOTA_CLIENT 0b00000001

union iota_metadata {
    uint16_t iota_metadata;
    struct iota_meta {
        uint8_t message_type;
        uint8_t flags;
    };
};

// Each mesage should come with an address
// This is agreed upon during the handshake 
// The simple data frame can be used to fit a message entirely in the header. If the 
// FLAG_SKIP_SDF is set in the metadata flags, then this field should be ignored and the
// rest of the message data can be assumed to be the bodys. This is only necessary for total
// efficiency

// Any text transmitted should be null terminated
typedef struct iota_message_header {
    union iota_metadata meta;
    MACAdress address;
    SimpleDataFrame frame;
} IotaHeader;

// could have a task for performing a TLS handshake

ThreadPool pool;
TaskQueue task_queue;
Config cfg;

// fcntl is file control sys call
// F_SETFL and F_GETFL are File Set Flags and File Get Flags respectively
// O_NONBLOCK sets these files to nonblocking mode. (Use it or lose it)
void set_nonblocking(int socket_fd) {
    int flags = fcntl(socket_fd, F_GETFL, 0);
    fcntl(socket_fd, F_SETFL, flags | O_NONBLOCK);
}

void handle_persistent_connection(Client* client) {

    if (client->status == IS_FREE) return; // We dont need to handle open connections

    char buffer[cfg.buffer_size];
    memset(buffer, '\0', sizeof(buffer));
    int bytes_read = read(client->client_fd, buffer, sizeof(IotaHeader));

    IotaHeader* header;

    header = (IotaHeader*)buffer;

    if (bytes_read > 0) {
        buffer[bytes_read] = '\0'; // Null-terminate the string
        printf("Received message type: %d from client %d (%02X:%02X:%02X:%02X:%02X:%02X): %s\n", header->meta.iota_metadata, client->client_fd,header->address[5], header->address[4], header->address[3], header->address[2], header->address[1], header->address[0], header->frame);
        if(strcmp(buffer, "task") == 0) {
            Task* task = get_sample_task();

            enqueueTask(&task_queue, task);
        }
        // Example: Echo back the received data
        write(client->client_fd, buffer, bytes_read);
        gettimeofday(&client->last_activity_time, NULL); // Update last activity time
    } else if (bytes_read == 0) {
        // THIS IS SUPPOSED TO REPRESENT A CLIENT DC
        printf("Client %d has closed the connection\n", client->client_fd);
        MARK_AS_CLOSED(client);
    } else if (errno == EAGAIN || errno == EWOULDBLOCK) {

        struct timeval current_time;
        gettimeofday(&current_time, NULL);

        // Calculate the elapsed time in milliseconds
        long elapsed_time = (current_time.tv_sec - client->last_activity_time.tv_sec) * 1000 +
            (current_time.tv_usec - client->last_activity_time.tv_usec) / 1000;

        if (elapsed_time > cfg.connection_timeout) { // Check if elapsed time exceeds 100 milliseconds
            MARK_AS_CLOSED(client);
            printf("Client %d has timed out. Timeout: %ld\n", client->client_fd, elapsed_time);
        }
    } else {

        // Can be no route to host or an early close from the socket
        if (errno == ECONNABORTED) {
            MARK_AS_CLOSED(client); // Just kill the client, we dont deal with time wasters
            logMessage(LOG_INFO, "Client %d refused to listen or aborted.", client->client_fd);
            return;
        }
        printf("Hey we discovered a new magical edge case. Good luck debugging this for the next 8 hours. Errno: %d\n", errno);
    }
}

void handle_stateless_connection(Client* client, int* num_clients) {
    // Similar logic as handle_persistent_connection, but with different handling for stateless connections
}

char g_running = 1;

// Signal handler function for Ctrl+C (SIGINT)
void sigintHandler(int signal) {
    g_running = 0;
    printf("\nServer shutting down gracefully...\n");
    // Perform cleanup actions here if needed
}

int main() {
    setLogLevel(LOG_DEBUG);
    signal(SIGINT, sigintHandler);

    cfg = read_config_from_file("config.txt");

    init_task_queue(&task_queue, 50);
    initialize_thread_pool(&pool, cfg.num_threads, startWorkerThread, &task_queue);

    int server_socket_fd, client_socket_fd;
    struct sockaddr_in server_addr, client_addr = {0};
    socklen_t client_addr_len;
    Client clients[MAX_CLIENTS];
    int num_clients = 0;

    // Create server socket
    // IPv4, TCP (full duplex), IP
    server_socket_fd = socket(AF_INET, SOCK_STREAM, 0);
    if (server_socket_fd == -1) {
        perror("Socket creation failed");
        exit(EXIT_FAILURE);
    }

    // Set server socket options
    memset(&server_addr, 0, sizeof(server_addr));
    server_addr.sin_family = AF_INET;
    server_addr.sin_addr.s_addr = INADDR_ANY;
    server_addr.sin_port = htons(6969);

    // Bind server socket
    if (bind(server_socket_fd, (struct sockaddr*)&server_addr, sizeof(server_addr)) == -1) {
        perror("Bind failed");
        exit(EXIT_FAILURE);
    }

    printf("Server was bound to socket successfully\n");

    // Set server socket to listen
    if (listen(server_socket_fd, MAX_PENDING_QUEUE_SIZE) == -1) {
        perror("Listen failed");
        exit(EXIT_FAILURE);
    }

    printf("Server now listening on port: %d\n", 6969);

    // Initialize client structures
    for (int i = 0; i < MAX_CLIENTS; i++) {
        clients[i].client_fd = -1;
        clients[i].persistent = TCP_STATELESS;
        clients[i].status = IS_FREE;
    }

    // Set server socket to non-blocking
    set_nonblocking(server_socket_fd);

    // THERE IS A BUG IN THE WAY CLIENT CONNECTIONS ARE CLOSED
    // THE TOTAL CONNECTION COUNT IS SIMPLY DECREMENTED
    // THIS IS BAD BECAUSE NEW CONNECTIONS USE THE TOTAL CONNECTION COUNTER AS
    // AN INDEX INTO THE CLIENT ARRAY. IF THE 0TH CLIENT DC'S THEN INSTEAD OF A NEW CONNECTION
    // BEING PUT INTO INDEX 0 IT WILL GO INTO THE END OF THE ARRAY, OVERWRITING AN EXISTING CONNECTION
    while (g_running) {
        // Accept new connections
        client_addr_len = sizeof(client_addr);
        client_socket_fd = accept(server_socket_fd, (struct sockaddr*)&client_addr, &client_addr_len);

        char client_ip[INET_ADDRSTRLEN];
        inet_ntop(AF_INET, &(client_addr.sin_addr), client_ip, INET_ADDRSTRLEN);

        if (client_socket_fd != -1) {
            printf("Connection request from origin: %s\n", client_ip);
        }
        
        if (client_socket_fd > 0) {
            if (num_clients < MAX_CLIENTS) {

                // Do a search for the first available index
                int freeIndex = -1;
                for (int i = 0; i < MAX_CLIENTS; i++) {
                    // Check both conditions for extra certainty
                    if (clients[i].status == IS_FREE && clients[i].client_fd == -1) {
                        freeIndex = i;
                        break;
                    }
                }
                // Add new client to the list
                clients[freeIndex].client_fd = client_socket_fd;

                // We should start as a persistent connection
                // 
                clients[freeIndex].persistent = TCP_PERSISTENT;
                clients[freeIndex].status = IS_CONNECTED;
                gettimeofday(&clients[freeIndex].last_activity_time, NULL);
                set_nonblocking(client_socket_fd);
                num_clients++;
            } else {
                printf("Maximum clients reached, connection rejected.\n");
                close(client_socket_fd);
            }
        }

        // Handle client events
        for (int i = 0; i < num_clients; i++) {
            Client* client = &clients[i];
            if (client->client_fd != -1) {
                if (clients[i].persistent) {
                    handle_persistent_connection(&clients[i]);
                } else {
                    handle_stateless_connection(&clients[i], &num_clients);
                }
            }

            if (client->status == SHOULD_CLOSE) {
                // Client closed the connection
                // THIS COULD BE ITS OWN FUNCTION, SHOULD TECHNICALLY CHECK FOR SUCESS BEFORE FREEING
                close(client->client_fd);
                client->status = IS_FREE;
                client->client_fd = -1; // Mark as closed
                num_clients--;
            }
        }

        // Check for idle persistent connections and close if necessary
    }

    // Close server socket
    close(server_socket_fd);
    logMessage(LOG_INFO, "Socket server has been closed");

    shutdown_task_queue(&task_queue);

    for(int i = 0; i < pool.size; i++) {
        logMessage(LOG_DEBUG, "Attempting to join thread: %d", i);
        pthread_t thread = pool.threads[i];
        pthread_join(thread, NULL); 
    }  


    release_thread_pool(&pool);

    release_task_queue(&task_queue);

    printf("Press any key to continue... ");
    getchar();
    return 0;
}
