const dgram = require('dgram');

// Send messages at different times of day (simulated with current time)
const now = new Date();
const messages = [
  `100 Morning message - ${now.toLocaleTimeString('en-US', {hour12: false})}`,
  `200 Afternoon message - ${now.toLocaleTimeString('en-US', {hour12: false})}`,
  `300 Evening message - ${now.toLocaleTimeString('en-US', {hour12: false})}`
];

function sendMessage(message, delay) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const client = dgram.createSocket('udp4');
      client.send(Buffer.from(message), 8889, 'localhost', (err) => {
        if (err) {
          console.error('Error:', err);
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

  console.log('\n24-hour format test complete!');
  console.log('Current time in 24-hour format:', now.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }));
}

sendAll();
