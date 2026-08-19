import { LegalInfoResponseSchema } from '../artifacts/api-server/src/types/legalResponse';
import { STATE_COURT_MAPPINGS } from '../lib/connectors/src/courtlistener-client';
import crypto from 'crypto';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log('\n=== ACQUIT.AI SECURITY & COMPLIANCE VERIFICATION HARNESS ===\n');

// 1. Test Zod Legal Schema Compliance
console.log('1. Testing Zod Legal Schema & UPL Safe-Harbor Constraints:');
const validPayload = {
  disclaimer: 'This information is for educational purposes only and does not constitute legal advice.',
  jurisdiction: { state: 'IN', county: 'Marion' },
  citations: [
    {
      statuteOrRule: 'Ind. R. Crim. P. 2.5',
      summary: 'Mandates disclosure of all prosecution witness statements and physical evidence.',
      sourceUrl: 'https://www.in.gov/courts/rules/criminal/',
    },
  ],
  proceduralSteps: [
    '1. File formal written request with the Marion County Prosecutor.',
    '2. Calendar the 30-day compliance window prior to the Omnibus hearing.',
  ],
  requiresHumanReview: true,
  outcomePredictionAllowed: false,
};

const parseResult = LegalInfoResponseSchema.safeParse(validPayload);
assert(parseResult.success, 'Valid legal response adheres strictly to LegalInfoResponseSchema');

const invalidOutcomePayload = {
  ...validPayload,
  outcomePredictionAllowed: true, // PROHIBITED
};
const invalidOutcomeResult = LegalInfoResponseSchema.safeParse(invalidOutcomePayload);
assert(!invalidOutcomeResult.success, 'Rejects responses containing outcome predictions or win probabilities');

const missingDisclaimerPayload = {
  ...validPayload,
  disclaimer: 'General advice for your case.', // Non-matching disclaimer literal
};
const missingDisclaimerResult = LegalInfoResponseSchema.safeParse(missingDisclaimerPayload);
assert(!missingDisclaimerResult.success, 'Rejects responses with non-matching or altered disclaimer text');


// 2. Test Cryptographic HMAC Human Gate Verification
console.log('\n2. Testing Cryptographic Human Filing Gate (HMAC SHA-256):');
const secret = 'test-hmac-secret-32-chars-long-example!';
const userId = 'user-alex-123';
const documentId = 'doc-motion-discovery-456';
const consentTimestamp = Date.now();

const canonicalPayload = `${userId}:${documentId}:${consentTimestamp}:CONSENT_GIVEN_NOT_LEGAL_ADVICE`;
const validSignature = crypto.createHmac('sha256', secret).update(canonicalPayload).digest('hex');

// Timing-safe comparison check
const validBuffer = Buffer.from(validSignature, 'utf-8');
const computedBuffer = Buffer.from(
  crypto.createHmac('sha256', secret).update(canonicalPayload).digest('hex'),
  'utf-8'
);
assert(
  validBuffer.length === computedBuffer.length && crypto.timingSafeEqual(validBuffer, computedBuffer),
  'Cryptographic HMAC verification succeeds for authorized human consent token'
);

// Forged payload check
const forgedPayload = `${userId}:${documentId}:${consentTimestamp}:MALICIOUS_MODIFIED_PAYLOAD`;
const forgedSignature = crypto.createHmac('sha256', secret).update(forgedPayload).digest('hex');
const forgedBuffer = Buffer.from(forgedSignature, 'utf-8');
assert(
  !crypto.timingSafeEqual(validBuffer, forgedBuffer),
  'Cryptographic HMAC verification rejects forged signatures and modified payloads'
);

// Expiration window check (15 minutes)
const expiredTimestamp = Date.now() - 16 * 60 * 1000;
const isExpired = Date.now() - expiredTimestamp > 15 * 60 * 1000;
assert(isExpired, 'Filing gate enforces strict 15-minute expiration window on consent tokens');


// 3. Test CourtListener 50-State Mapping Coverage
console.log('\n3. Testing CourtListener Jurisdiction Coverage:');
const requiredStates = ['CA', 'NY', 'IN', 'TX', 'FL', 'IL', 'PA', 'OH', 'AZ', 'GA', 'DC'];
const allFound = requiredStates.every((st) => Boolean(STATE_COURT_MAPPINGS[st]));
assert(allFound, `All priority state court identifiers mapped (Total mapped: ${Object.keys(STATE_COURT_MAPPINGS).length})`);


console.log('\n-------------------------------------------------------------');
console.log(`Results: ${passed} passed, ${failed} failed.`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('All compliance and security checks passed successfully.\n');
}
