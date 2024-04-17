import socket
import random
import time

UDP_IP = "127.0.0.1"  # IP address of the Node.js server
UDP_PORT = 6969       # UDP port number

try:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.settimeout(1)
        sock.connect((UDP_IP, UDP_PORT))

        timeout = 0.010 # 10 ms
        while(True): 
            sock.send(b'TEST')
            data = sock.recv(1024)

            print(data)
            if (random.random() < 0.01):
                sock.shutdown(socket.SHUT_RDWR)
                sock.close()
            time.sleep(timeout)
            timeout += 0.005
except KeyboardInterrupt:
    pass