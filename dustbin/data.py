import socket
import random
import time

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

UDP_IP = "127.0.0.1"  # IP address of the Node.js server
UDP_PORT = 6969       # UDP port number

try:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.settimeout(1)
        sock.connect((UDP_IP, UDP_PORT))

        timeout = 0.010 # 10 ms
        while(True): 
            sock.send(generic_header + str(random.randint(10,99)).encode())
            data = sock.recv(1024)
            time.sleep(1)

except KeyboardInterrupt:
    pass