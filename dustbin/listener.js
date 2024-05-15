const net = require('net');
const { mac } = require('address');
const os = require('os');

// Get the network interfaces
const networkInterfaces = os.networkInterfaces();

// Find the MAC address of the first non-internal network interface
let macAddressBytes = null;

mac(function (err, addr) {
  macAddressBytes = Buffer.from(addr.replace(/:/g, ''), 'hex');
});

if (macAddressBytes) {
    console.log('MAC Address:', macAddressBytes);
} else {
    console.error('Failed to retrieve MAC address.');
}


// Create a TCP client socket
const client = net.createConnection({ port: 6969 }, () => {
    console.log('Connected to server!');
    let buffer = Buffer.from([0x01, 0x02]);
    const message = Buffer.from("listen");
    buffer = Buffer.concat([buffer, macAddressBytes, message ]);
    // Send a message to the server
    client.write(buffer);
});

// Handle incoming data from the server
client.on('data', data => {
    const message = data.toString();
    console.log('Received message from server:', message);
});

// Handle connection close
client.on('end', () => {
    console.log('Connection closed by server.');
});

// Handle socket errors
client.on('error', err => {
    console.error('Socket error:', err);
});
