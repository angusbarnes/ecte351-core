import numpy as np
import matplotlib.pyplot as plt

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

# Plot the data
plt.plot(data)
plt.xlabel('Time')
plt.ylabel('Temperature')
plt.title('Simulated Temperature Sensor Output with Bounds')
plt.ylim(lower_limit, upper_limit)  # Set y-axis limits
plt.show()