const dgram = require('dgram');
const client = dgram.createSocket('udp4');

const randomNumber = Math.floor(Math.random() * 1000) + 1;
const message = `100 Test message from database - Random: ${randomNumber}`;
client.send(Buffer.from(message), 8889, 'fountain.bmuth.com', (err) => {
  if (err) {
    console.error('Error sending UDP message:', err);
  } else {
    console.log(`Test message sent successfully (Random: ${randomNumber})`);
  }
  client.close();
});
