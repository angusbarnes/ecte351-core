#include <sys/socket.h> // This may need to be different to compile on linux
#include <netinet/in.h>
#include <arpa/inet.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <errno.h>
#include <string.h>
#include <sys/types.h>
#include <time.h>

#define MAX_CLIENTS 10
#define TRUE 1
#define FALSE 0

int main(void) {
    int listenfd = 0, connfd = 0; // These are file descriptors (they describe identify incoming connections)
    struct sockaddr_in server_address;

    char send_buffer[1024];
    time_t ticks;

    // Get the file descriptor of the listening port
    // AF_INET specified IPv4 and SOCK_STREAM specified a TCP connection type
    // 0 is to select IP protocol (rather than file stream, Mem-IO or such)
    listenfd = socket(AF_INET, SOCK_STREAM, 0);

    // Clear the memory space of our send buffer and server address settings
    memset(&server_address, '0', sizeof(server_address));
    memset(&send_buffer, '0', sizeof(server_address));

    server_address.sin_family = AF_INET;
    // sin_addr == socket internet address (Union)
    // s_addr == socket adress (Network byte order)
    // Here we are essetnially listening on 0.0.0.0:6969
    server_address.sin_addr.s_addr = htonl(INADDR_ANY);
    server_address.sin_port = htons(6969);

    // Bind our socket to the created network address
    bind(listenfd, (struct sockaddr*) &server_address, sizeof(server_address));

    listen(listenfd, MAX_CLIENTS);

    printf("Initialised socket server on 0.0.0.0:6969\n");

    while(TRUE) {
        connfd = accept(listenfd, (struct sockaddr*)NULL, NULL);

        /* As soon as server gets a request from client, it prepares the date and time and
		* writes on the client socket through the descriptor returned by accept()
		*/
		ticks = time(NULL);
		snprintf(send_buffer, sizeof(send_buffer), "%.24s\r\n", ctime(&ticks));
		write(connfd, send_buffer, strlen(send_buffer));
        printf("Handled Connection gracefully\n");
		close(connfd);
		sleep(1);
    }
}