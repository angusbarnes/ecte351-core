const dgram = require('dgram');

const UDP_PORT = 5005;  // UDP port number

const server = dgram.createSocket('udp4');

server.on('error', (err) => {
    console.log(`Server error:\n${err.stack}`);
    server.close();
});

server.on('message', (msg, rinfo) => {
    const byteValue1 = msg.readUInt8(); // Convert the received buffer to an integer
    const byteValue2 = msg.readUInt8();
    const byteValue3 = msg.readUInt8();
    const byteValue4 = msg.readUInt8();
    console.log('Received byte value:', [byteValue1, byteValue2, byteValue3,byteValue4]);
});

server.on('listening', () => {
    const address = server.address();
    console.log(`UDP server listening on ${address.address}:${address.port}`);
});

server.bind(UDP_PORT);
