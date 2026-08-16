import { createServer } from 'http';
import app from '../src/app';
import crypto from 'crypto';

const port = 3001;
const server = createServer(app);

// Simple assertion helper
function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error('❌ FAIL: ' + message);
    process.exit(1);
  }
}

async function runTests() {
  console.log('Running Security Verification Tests...');

  // SEC-4 & SEC-5
  let res = await fetch(`http://localhost:${port}/api/directory`);
  assert(res.status === 401, 'Unauthenticated request should return 401');
  let body = await res.json();
  assert(body.error === 'UNAUTHORIZED', 'Unauthenticated request should have UNAUTHORIZED error');

  res = await fetch(`http://localhost:${port}/api/directory`, {
    headers: { 'Authorization': 'Bearer invalid' }
  });
  assert(res.status === 401, 'Invalid bearer token should return 401');

  // SEC-3 Webhook HMAC
  res = await fetch(`http://localhost:${port}/api/webhooks/courtlistener`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ docket_id: '123' })
  });
  assert(res.status === 401, 'Missing webhook signature should return 401');
  
  process.env.COURTLISTENER_WEBHOOK_SECRET = 'test-secret';
  const payload = { docket_id: '123' };
  const invalidSignature = 'sha256=' + crypto.createHmac('sha256', 'wrong').update(JSON.stringify(payload)).digest('hex');
  res = await fetch(`http://localhost:${port}/api/webhooks/courtlistener`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-hub-signature-256': invalidSignature },
    body: JSON.stringify(payload)
  });
  assert(res.status === 401, 'Invalid webhook signature should return 401');

  const validSignature = 'sha256=' + crypto.createHmac('sha256', 'test-secret').update(JSON.stringify(payload)).digest('hex');
  res = await fetch(`http://localhost:${port}/api/webhooks/courtlistener`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-hub-signature-256': validSignature },
    body: JSON.stringify(payload)
  });
  // Since db connection might fail or something else, but it shouldn't be 401
  assert(res.status !== 401, 'Valid webhook signature should NOT return 401');

  // SEC-6 & SEC-7 CORS & CSP
  res = await fetch(`http://localhost:${port}/api/health`, {
    method: 'OPTIONS',
    headers: { 'Origin': 'https://acquit.ai', 'Access-Control-Request-Method': 'GET' }
  });
  assert(res.headers.get('access-control-allow-origin') === 'https://acquit.ai', 'CORS should allow acquit.ai');

  res = await fetch(`http://localhost:${port}/api/health`, {
    method: 'OPTIONS',
    headers: { 'Origin': 'https://malicious.com', 'Access-Control-Request-Method': 'GET' }
  });
  assert(res.headers.get('access-control-allow-origin') === null, 'CORS should reject malicious.com');

  res = await fetch(`http://localhost:${port}/api/health`);
  const csp = res.headers.get('content-security-policy') || '';
  assert(!csp.includes("'unsafe-inline'"), "CSP should not include 'unsafe-inline'");
  assert(csp.includes("default-src 'self'"), "CSP should include default-src 'self'");

  console.log('✅ All security verification tests passed!');
  server.close();
  process.exit(0);
}

server.listen(port, () => {
  runTests().catch(err => {
    console.error('Test Error:', err);
    server.close();
    process.exit(1);
  });
});
