#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <arpa/inet.h>
#include <sys/time.h>
#include <sys/types.h>
#include <sys/socket.h>

// Dictionary to store known devices and their statuses
#define MAX_DEVICES 2
char* known_devices[MAX_DEVICES] = {
    "00:11:22:33:44:55",
    "AA:BB:CC:DD:EE:FF"
};

// Function to handle client connection
// Function to handle client connection with timeout
void handle_connection(int client_socket, int timeout_ms) {
    char buffer[1024];
    char* response;

    fd_set readfds;
    struct timeval timeout;
    int activity, bytes_received;

    FD_ZERO(&readfds);
    FD_SET(client_socket, &readfds);

    timeout.tv_sec = 0;
    timeout.tv_usec = timeout_ms*1000;

    activity = select(client_socket + 1, &readfds, NULL, NULL, &timeout);
    if (activity < 0) {
        perror("Error in select");
        return;
    } else if (activity == 0) {
        printf("Timeout: No data received\n");
        return;
    }

    if (FD_ISSET(client_socket, &readfds)) {
        // Receive data from the client
        bytes_received = recv(client_socket, buffer, sizeof(buffer), 0);
        if (bytes_received < 0) {
            perror("Error receiving data");
            return;
        }

        // Null-terminate the received data
        buffer[bytes_received] = '\0';

        // Process received data (check device status, etc.)
        // Example logic:
        if (strcmp(buffer, "Hello") == 0) {
            response = "Success: Device is known\n";
        } else {
            response = "Failure: Device is new\n";
        }

        // Send the response back to the client
        ssize_t bytes_sent = send(client_socket, response, strlen(response), 0);
        if (bytes_sent < 0) {
            perror("Error sending data");
        }
    }

    // Close the client socket
    close(client_socket);
}

// Function to start the server
void start_server(const char* host, int port) {
    int server_socket, client_socket;
    struct sockaddr_in server_addr, client_addr;
    socklen_t client_addr_len = sizeof(client_addr);

    // Create a TCP socket
    server_socket = socket(AF_INET, SOCK_STREAM, 0);
    if (server_socket < 0) {
        perror("Error creating socket");
        exit(EXIT_FAILURE);
    }

    // Bind the socket to the specified host and port
    server_addr.sin_family = AF_INET;
    server_addr.sin_addr.s_addr = inet_addr(host);
    server_addr.sin_port = htons(port);
    if (bind(server_socket, (struct sockaddr*)&server_addr, sizeof(server_addr)) < 0) {
        perror("Error binding socket");
        exit(EXIT_FAILURE);
    }

    // Listen for incoming connections
    if (listen(server_socket, 5) < 0) {
        perror("Error listening");
        exit(EXIT_FAILURE);
    }

    printf("Server listening on %s:%d\n", host, port);

    while (1) {
        // Accept incoming connection
        client_socket = accept(server_socket, (struct sockaddr*)&client_addr, &client_addr_len);
        if (client_socket < 0) {
            perror("Error accepting connection");
            continue;
        }

        // Handle the connection
        handle_connection(client_socket, 100);
    }

    // Close the server socket
    close(server_socket);
}

int main() {
    const char* HOST = "127.0.0.1";  // Change to your server's IP or hostname
    const int PORT = 6969;           // Change to the desired port number

    start_server(HOST, PORT);

    return 0;
}
