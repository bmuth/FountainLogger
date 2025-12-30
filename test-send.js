const dgram = require('dgram');
const client = dgram.createSocket('udp4');

const message = '100 Test message from database';
client.send(Buffer.from(message), 8889, 'localhost', (err) => {
  if (err) {
    console.error('Error sending UDP message:', err);
  } else {
    console.log('Test message sent successfully:', message);
  }
  client.close();
});
