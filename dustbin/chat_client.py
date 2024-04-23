import socket
import uuid

import re
import uuid

def format_mac_address():
    mac_address_bytes = uuid.getnode().to_bytes(6, byteorder='big')
    # Convert the bytes to a hexadecimal string
    mac_address_hex = mac_address_bytes.hex()
    # Ensure the input is a valid MAC address string
    mac_address = re.sub(r'[^0-9a-fA-F]', '', mac_address_hex)
    if len(mac_address) != 12:
        raise ValueError("Invalid MAC address format")

    # Insert ":" separator between each pair of hexadecimal digits
    formatted_mac = ':'.join([mac_address[i:i+2] for i in range(0, 12, 2)])

    return formatted_mac.upper()

print(format_mac_address())

generic_header = (1000).to_bytes(2, 'little') + uuid.getnode().to_bytes(6, byteorder='little')
def main():
    # Server's IP address and port
    server_ip = '127.0.0.1'  # Change this to your server's IP address
    server_port = 6969  # Change this to your server's port

    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.connect((server_ip, server_port))

            while(True): 
                text = input('> ')
                sock.send(generic_header + text.encode())
                data = sock.recv(1024)
                print(data)
    except KeyboardInterrupt:
        pass

if __name__ == "__main__":
    main()
