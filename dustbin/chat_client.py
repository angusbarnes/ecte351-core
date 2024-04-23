import socket

def main():
    # Server's IP address and port
    server_ip = '127.0.0.1'  # Change this to your server's IP address
    server_port = 6969  # Change this to your server's port

    # Create a socket object
    client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

    try:
        # Connect to the server
        client_socket.connect((server_ip, server_port))
        print("Connected to server.")

        # Get user input
        message = input("Enter text to send to the server: ")

        # Send the message to the server
        client_socket.sendall(message.encode())

        # # Receive response from the server
        # response = client_socket.recv(1024).decode()
        # print("Server response:", response)

    except ConnectionRefusedError:
        print("Error: Connection to the server was refused.")
    except Exception as e:
        print("Error:", e)
    finally:
        # Close the socket
        client_socket.close()

if __name__ == "__main__":
    main()
