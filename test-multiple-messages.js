const dgram = require('dgram');

const messages = [
  '100 First message with value 100',
  '200 Second message with value 200',
  '100 Third message with value 100',
  '300 Fourth message with value 300',
  '200 Fifth message with value 200',
  '100 Sixth message with value 100'
];

function sendMessage(message, delay) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const client = dgram.createSocket('udp4');
      client.send(Buffer.from(message), 8889, 'localhost', (err) => {
        if (err) {
          console.error('Error sending:', message, err);
        } else {
          console.log('Sent:', message);
        }
        client.close();
        resolve();
      });
    }, delay);
  });
}

async function sendAll() {
  for (let i = 0; i < messages.length; i++) {
    await sendMessage(messages[i], i * 100);
  }
  console.log('All test messages sent!');
}

sendAll();
