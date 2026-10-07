# Chain of Command: Legal Verification Architecture

## 1. Core Vision
Chain of Command is a living case platform that helps people build and maintain an up-to-date, evidence-backed record of their case—while preserving where information came from, how it changed, and who acted on it.

**Mantra**: Build the case. Verify the evidence. Know what changed.

Unlike static legal software ("Here’s the information you already have"), Chain of Command operates proactively:
*"Here’s what you have, here’s what’s missing, here’s what’s new, here’s where it came from, here’s how it relates to the case, and here’s what changed."*

## 2. The Three-Layer Trust Architecture
Chain of Command acts as a universal verification layer for U.S. legal records using a hybrid storage and cryptographic anchoring model:

### Layer 1: Evidence (The Payload)
The actual physical or digital asset: PDF, image, video, filing, record, or physical item representation. 
*Rule: Never put actual confidential case documents on a public blockchain.*

### Layer 2: Chain of Command (The Ledger)
Our internal, cryptographically linked history tracking every interaction, transformation, and verification event:
`Document -> Hash -> Event -> Previous Hash -> Next Event`

### Layer 3: Public Blockchain Anchoring (The Anchor)
Periodically taking a Merkle root / chain checkpoint and anchoring it to a public blockchain. This allows independent verification that a specific record existed in a specific state no later than the anchor timestamp, establishing undeniable provenance without exposing sensitive data.

## 3. The Legal Verification Engine
Instead of a binary "Verified" badge, the engine establishes provenance, integrity, authenticity, and history across multiple vectors:

- **AUTHENTICITY**: Is the document what it claims to be?
- **INTEGRITY**: Has the SHA-256 hash remained unchanged?
- **SOURCE**: Can the origin (court, agency, witness) be cryptographic or procedurally confirmed?
- **CHAIN OF CUSTODY**: Are there any unexplained gaps in the custody timeline?
- **SIGNATURE**: Are digital signatures (FIPS 186-5/204/205 compliant) valid?
- **CURRENTNESS**: Has this authority been superseded, or is there a newer amended filing?

## 4. CoC-1: Chain of Command Verification Record Standard
Moving toward a machine-readable standard API for courts, attorneys, and evidence providers:

```json
{
  "record_id": "coc_1f9b2a...",
  "document_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "source": "AZ_SUPERIOR_COURT",
  "issuer": "CLERK_OF_COURT",
  "jurisdiction": "AZ",
  "case_id": "CR2026-123456",
  "created_at": "2026-06-12T22:42:00Z",
  "signature": {
    "algorithm": "ECDSA-P256-SHA256",
    "value": "0x..."
  },
  "verification_method": "PUBLIC_KEY_INFRASTRUCTURE",
  "custody_events": ["evt_1", "evt_2"],
  "previous_hash": "00000000000000000000000000000000...",
  "event_hash": "a1b2c3d4...",
  "blockchain_anchor": {
    "network": "ethereum",
    "block": 8492113,
    "transaction": "0x..."
  },
  "verification_status": "VERIFIED"
}
```

## 5. The Big Product Loop
**Discover → Acquire → Verify → Connect → Analyze → Act → Monitor**

AI is not just a chatbot; it actively monitors this loop. E.g., **Evidence Gap Detection**:
*"Your timeline says the vehicle was searched at 10:42 PM, but there is currently no evidence documenting when the search began. Potential sources: Body-camera footage, CAD dispatch records, Officer report."*
