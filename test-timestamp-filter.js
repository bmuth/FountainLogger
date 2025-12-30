const http = require('http');

function testAPI(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log(`\nTesting: ${path}`);
          console.log(`Count: ${json.count}`);
          if (json.entries.length > 0) {
            console.log('Integer values:', json.entries.map(e => e.integer_value).join(', '));
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
  // Test timestamp filtering without integer filter
  const timestamp = '2025-12-30T02:37:47.000Z';
  await testAPI(`/api/logs/from?timestamp=${encodeURIComponent(timestamp)}`);

  // Test timestamp filtering WITH integer filter for 100
  await testAPI(`/api/logs/from?timestamp=${encodeURIComponent(timestamp)}&integer_value=100`);

  // Test timestamp filtering WITH integer filter for 200
  await testAPI(`/api/logs/from?timestamp=${encodeURIComponent(timestamp)}&integer_value=200`);

  console.log('\nAll timestamp filter tests completed!');
}

runTests();
