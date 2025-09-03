#!/usr/bin/env node

// Simple API test script
import http from 'http';

const API_BASE = 'http://localhost:3001';

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testAPI() {
  console.log('🧪 Testing INCOIS Hazard Reporting API...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const health = await makeRequest('GET', '/api/health');
    console.log(`   Status: ${health.status}`);
    console.log(`   Response: ${JSON.stringify(health.data, null, 2)}\n`);

    if (health.status !== 200) {
      console.log('❌ Health check failed. Make sure the server is running.');
      return;
    }

    // Test registration
    console.log('2. Testing user registration...');
    const registerData = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123'
    };

    const register = await makeRequest('POST', '/api/auth/register', registerData);
    console.log(`   Status: ${register.status}`);
    
    if (register.status === 201) {
      console.log('   ✅ Registration successful');
      const token = register.data.token;
      
      // Test authenticated endpoint
      console.log('\n3. Testing authenticated endpoint...');
      const profileReq = http.request(new URL('/api/auth/profile', API_BASE), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          console.log(`   Status: ${res.statusCode}`);
          if (res.statusCode === 200) {
            console.log('   ✅ Authentication working');
          }
        });
      });
      profileReq.end();
    } else {
      console.log(`   ❌ Registration failed: ${JSON.stringify(register.data)}`);
    }

    console.log('\n🎉 API test completed!');
    console.log('\n📚 Next steps:');
    console.log('- Review API_EXAMPLES.md for detailed usage');
    console.log('- Test WebSocket connection for real-time features');
    console.log('- Integrate with your frontend application');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('- Ensure the server is running: npm run dev');
    console.log('- Check your .env configuration');
    console.log('- Verify database connection');
  }
}

testAPI();