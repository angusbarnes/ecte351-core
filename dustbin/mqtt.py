# This is the test file for instrumentation purposes
import numpy as np

# Parameters
num_points = 1000  # Number of data points
drift = 0.03  # Drift coefficient
noise_std = 0.5  # Standard deviation of noise
lower_limit = 5  # Lower bound
upper_limit = 35  # Upper bound

# Generate random noise
noise = np.random.normal(0, noise_std, num_points)

# Generate time series data
data = np.zeros(num_points)
for t in range(1, num_points):
    # Apply drift and noise
    data[t] = data[t-1] + drift + noise[t]
    
    # Enforce bounds
    if data[t] > upper_limit:
        data[t] = upper_limit - (data[t] - upper_limit)
        drift = -drift  # Reverse trend if approaching upper limit
    elif data[t] < lower_limit:
        data[t] = lower_limit + (lower_limit - data[t])
        drift = -drift  # Reverse trend if approaching lower limit


import socket
import random
import time

UDP_IP = "127.0.0.1"  # IP address of the Node.js server
UDP_PORT = 5005       # UDP port number

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

t = 0
while True:
    random_byte = int(255 * data[t]/upper_limit)
    print(f"Sending: {data[t]}")
    sock.sendto(random_byte.to_bytes(1, byteorder='big'), (UDP_IP, UDP_PORT))
    time.sleep(0.1)
    t += 1

    if t >= len(data):
        t=0
