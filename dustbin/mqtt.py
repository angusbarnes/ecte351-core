# This is the test file for instrumentation purposes

import socket
import random
import time

UDP_IP = "127.0.0.1"  # IP address of the Node.js server
UDP_PORT = 5005       # UDP port number

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

while True:
    random_byte = random.randint(0, 255)
    sock.sendto(random_byte.to_bytes(4, byteorder='big'), (UDP_IP, UDP_PORT))
    time.sleep(0.1)
