import http from 'http';
import app from '../src/app.js';

async function runTests() {
  console.log('🧪 Starting ShopKu Backend API Tests...\n');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAIL: ${name}`);
      console.error(`   Error: ${err.message}`);
      failed++;
    }
  }

  // 1. Health Check Test
  await test('GET / - Root Health Check', async () => {
    const res = await fetch(`${baseUrl}/`);
    const json = await res.json();
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!json.success || json.message !== 'ShopKu API is running') {
      throw new Error(`Unexpected body: ${JSON.stringify(json)}`);
    }
  });

  await test('GET /api/health - API Health Status', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    const json = await res.json();
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!json.success || json.data?.status !== 'healthy') {
      throw new Error(`Unexpected body: ${JSON.stringify(json)}`);
    }
  });

  // 2. 404 Handler Test
  await test('GET /api/non-existent-endpoint - Returns 404 formatted error', async () => {
    const res = await fetch(`${baseUrl}/api/non-existent-endpoint`);
    const json = await res.json();
    if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
    if (json.success !== false) throw new Error('Expected success to be false');
  });

  // 3. Auth Guard Test
  await test('GET /api/cart without token - Returns 401 Unauthorized', async () => {
    const res = await fetch(`${baseUrl}/api/cart`);
    const json = await res.json();
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
    if (json.success !== false) throw new Error('Expected success to be false');
  });

  await test('GET /api/orders without token - Returns 401 Unauthorized', async () => {
    const res = await fetch(`${baseUrl}/api/orders`);
    const json = await res.json();
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
    if (json.success !== false) throw new Error('Expected success to be false');
  });

  await test('GET /api/admin/dashboard without token - Returns 401 Unauthorized', async () => {
    const res = await fetch(`${baseUrl}/api/admin/dashboard`);
    const json = await res.json();
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
    if (json.success !== false) throw new Error('Expected success to be false');
  });

  // 4. Validation Error Test
  await test('POST /api/auth/register with empty body - Returns 422 Validation Error', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const json = await res.json();
    if (res.status !== 422) throw new Error(`Expected 422, got ${res.status}`);
    if (json.success !== false || !json.errors) throw new Error('Expected validation errors object');
  });

  server.close();

  console.log(`\n======================================================`);
  console.log(`📊 Test Summary: ${passed} passed, ${failed} failed.`);
  console.log(`======================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
