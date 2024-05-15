const express = require('express');
const socketio = require('socket.io');
const { mac } = require('address');
const os = require('os');
const net = require('net');

// Create an Express app and a HTTP server
const app = express();
const server = require('http').Server(app);

// Create a WebSocket server
const io = socketio(server);

// Store the last received message
let lastMessage = '';

// Socket.io event handling
io.on('connection', socket => {
    console.log('A client connected.');

    // Send the last received message to the client
    socket.emit('lastMessage', lastMessage);
});

// Start listening for WebSocket connections
server.listen(3000, () => {
    console.log('WebSocket server running on port 3000');
});

// Get the MAC address
let macAddressBytes = null;
mac(function (err, addr) {
    if (!err) {
        macAddressBytes = Buffer.from(addr.replace(/:/g, ''), 'hex');
    }
});

// Create a TCP client socket
const client = net.createConnection({ port: 6969 }, () => {
    console.log('Connected to server!');

    // Prepare the message with MAC address
    const message = Buffer.concat([
        Buffer.from([0x01, 0x02]), // Example data
        macAddressBytes || Buffer.alloc(6), // Use MAC address if available, or fill with zeros
        Buffer.from("listen")
    ]);

    // Send the message to the server
    client.write(message);
});

// Handle incoming data from the server
client.on('data', data => {
    let message = data.toString();
    console.log(`Received message from server: ${message} (${message.length})`);

    message = message = data.toString().slice(0,2);
    // Update the last received message
    lastMessage = message;

    // Send the message to all connected clients using WebSocket
    io.emit('lastMessage', lastMessage);
});

// Handle connection close
client.on('end', () => {
    console.log('Connection closed by server.');
});

// Handle socket errors
client.on('error', err => {
    console.error('Socket error:', err);
});

// Serve a basic web page
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Display Last Message</title>
        <style>
            body { display: flex; justify-content: center; flex-direction: column; align-items: center; height: 100vh; }
            h1 { font-size: 3em; }
        </style>
    </head>
    <body>
        <h1 id="message">${lastMessage}</h1>
        <h2 id="messageCount">Messages received per second: 0</h2>
        <script src="/socket.io/socket.io.js"></script>
        <script>
            const socket = io();
            let messageCount = 0;
            let intervalID;
            
            // Function to update message count and display
            function updateMessageCount() {
                document.getElementById('messageCount').textContent = \`Messages received per second: \${messageCount}\`;
                messageCount = 0; // Reset count for next second
            }
            
            // Update message count every second
            intervalID = setInterval(updateMessageCount, 1000);
            
            socket.on('lastMessage', message => {
                document.getElementById('message').textContent = message;
                messageCount++; // Increment count on new message
            });
            
            // Clear interval when leaving the page to avoid memory leaks
            window.addEventListener('unload', () => clearInterval(intervalID));
        </script>
    </body>
    </html>    
    `);
});

// Start the HTTP server
app.listen(8080, () => {
    console.log('HTTP server running on port 8080');
});
