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
        console.log('✓ Sent UDP:', message);
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
          console.log(`\n✓ API Test: ${path}`);
          console.log(`  Entries returned: ${json.count}`);
          if (json.entries && json.entries.length > 0) {
            const entry = json.entries[json.entries.length - 1];
            console.log(`  Latest entry: fountain=${entry.fountain}, message="${entry.message}"`);
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
  console.log('=== Testing renamed table "logs" with fields "fountain" and "message" ===\n');

  // Send test messages
  await sendUDP('5 Test from fountain 5');
  await sendUDP('10 Test from fountain 10');
  await new Promise(resolve => setTimeout(resolve, 500));

  // Test API endpoints
  await testAPI('/api/logs/50');
  await testAPI('/api/logs/50?fountain=5');
  await testAPI('/api/logs/50?fountain=10');

  console.log('\n=== All tests completed successfully! ===');
}

runTests();
