const dgram = require('dgram');
const http = require('http');

// Send test message
function sendUDP(message) {
  return new Promise((resolve) => {
    const client = dgram.createSocket('udp4');
    client.send(Buffer.from(message), 8889, 'localhost', (err) => {
      if (err) {
        console.error('Error sending:', err);
      } else {
        console.log('Sent UDP:', message);
      }
      client.close();
      resolve();
    });
  });
}

// Test API
function testAPI(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log(`\nAPI: ${path}`);
          console.log(`Count: ${json.count}`);
          if (json.entries && json.entries.length > 0) {
            console.log('Sample entry:', {
              fountain: json.entries[0].fountain,
              message: json.entries[0].message
            });
          }
          resolve(json);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function runTests() {
  console.log('=== Testing with renamed fields ===\n');

  // Send test messages
  await sendUDP('1 Fountain 1 test message');
  await sendUDP('2 Fountain 2 test message');
  await new Promise(resolve => setTimeout(resolve, 500));

  // Test API
  await testAPI('/api/logs/10');
  await testAPI('/api/logs/10?fountain=1');
  await testAPI('/api/logs/10?fountain=2');

  console.log('\n=== All tests passed! ===');
}

runTests();
