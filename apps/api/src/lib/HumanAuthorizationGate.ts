import crypto from 'crypto';

export class HumanAuthorizationGate {
  private static get secret(): string {
    const s = process.env.FILING_GATE_SECRET;
    if (!s) {
      throw new Error("FILING_GATE_SECRET is missing");
    }
    return s;
  }

  // Generate short-lived (5 min) challenge token upon user UI confirmation
  public static issueFilingToken(userId: string, matterId: string, filingId: string): string {
    const expiresAt = Date.now() + 5 * 60 * 1000;
    const payload = `${userId}:${matterId}:${filingId}:${expiresAt}`;
    const signature = crypto.createHmac('sha256', this.secret).update(payload).digest('hex');
    return Buffer.from(JSON.stringify({ payload, signature })).toString('base64');
  }

  // Validate the token prior to e-filing execution
  public static verifyHumanGate(token: string, expectedUser: string, expectedMatter: string, expectedFiling: string): boolean {
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
      const { payload, signature } = decoded;
      const [userId, matterId, filingId, expiresAt] = payload.split(':');

      if (userId !== expectedUser || matterId !== expectedMatter || filingId !== expectedFiling) return false;
      if (Date.now() > Number(expiresAt)) return false;

      const expectedSig = crypto.createHmac('sha256', this.secret).update(payload).digest('hex');
      return crypto.timingSafeEqual(Buffer.from(signature, 'utf-8'), Buffer.from(expectedSig, 'utf-8'));
    } catch {
      return false;
    }
  }
}
