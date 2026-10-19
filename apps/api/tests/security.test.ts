import { createServer } from 'http';
import crypto from 'crypto';
import assert from 'node:assert/strict';

// These smoke checks use public health and rejected requests, never DB reads/writes.
// Preserve the fail-fast DB configuration contract without production credentials.
process.env.DATABASE_URL = 'postgresql://smoke:smoke@127.0.0.1:65432/smoke';
// A local rejecting Auth endpoint makes invalid-JWT checks deterministic and offline.
const authServer = createServer((_req, res) => {
  res.writeHead(401, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ code: 'bad_jwt', msg: 'Invalid JWT' }));
});
await new Promise<void>((resolve) => authServer.listen(0, '127.0.0.1', resolve));
const authAddress = authServer.address();
assert(authAddress && typeof authAddress !== 'string');
process.env.SUPABASE_URL = `http://127.0.0.1:${authAddress.port}`;
process.env.SUPABASE_ANON_KEY = 'offline-smoke-anon-key';
process.env.ALLOWED_ORIGINS = 'https://acquit.ai';
delete process.env.SUPABASE_SERVICE_ROLE_KEY;
const { default: app } = await import('../src/app');
const { michaelOrchestrator } = await import('../src/ai/MichaelOrchestrator');

let port = 0;
const server = createServer(app);

async function runTests() {
  console.log('Running Security Verification Tests...');

  // SEC-4 & SEC-5
  let res = await fetch(`http://localhost:${port}/api/directory`);
  assert(res.status === 401, 'Unauthenticated request should return 401');
  let body = await res.json();
  assert(body.error?.code === 'UNAUTHENTICATED', 'Unauthenticated response must use the shared error taxonomy');

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
  assert(res.status === 400, 'Valid signature with no matterId must reach payload validation and return 400');

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

  // SEC-8 & SEC-9 Demo Lockout in Production
  const originalNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';

  // Demo tokens must be strictly rejected in production
  res = await fetch(`http://localhost:${port}/api/directory`, {
    headers: { 'Authorization': 'Bearer demo-token-bypass-attempt' }
  });
  assert(res.status === 401, 'Demo token must return 401 in production (Demo Lockout)');

  // Demo provider on AI route must be rejected in production
  res = await fetch(`http://localhost:${port}/api/ai/agents/lead-counsel/runs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: 'Test procedural query', provider: 'demo' })
  });
  assert(res.status === 401 || res.status === 400, 'Unauthenticated or demo AI run request must be rejected in production');

  // Restore NODE_ENV
  process.env.NODE_ENV = originalNodeEnv;

  console.log('All security verification tests passed.');
}

server.listen(0, async () => {
  const address = server.address();
  assert(address && typeof address !== 'string');
  port = address.port;
  try {
    await runTests();
  } catch (err) {
    console.error('Test Error:', err);
    process.exitCode = 1;
  } finally {
    michaelOrchestrator.cleanup();
    server.close();
    authServer.close();
  }
});
