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
          console.log('Integer values:', json.entries.map(e => e.integer_value).join(', '));
          resolve(json);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function runTests() {
  await testAPI('/api/logs/50');
  await testAPI('/api/logs/50?integer_value=100');
  await testAPI('/api/logs/50?integer_value=200');
  await testAPI('/api/logs/50?integer_value=300');
  console.log('\nAll tests completed!');
}

runTests();
