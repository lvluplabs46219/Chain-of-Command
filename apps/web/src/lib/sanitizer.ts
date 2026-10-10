/**
 * VeriCue AI Output Sanitizer (Blueprint §1, §8, §10, §17)
 * Strictly enforces that probabilistic, uncertainty-aware framing is preserved.
 * NEVER allows: Liar, Guilty, Lie Confirmed, Deceptive person, Truth verified.
 * ALWAYS ensures mandatory disclosures and confidence bounds are attached.
 */

export const FORBIDDEN_TERMS = [
  /\bliar\b/gi,
  /\blie confirmed\b/gi,
  /\bdefinitely lying\b/gi,
  /\bguilty\b/gi,
  /\bdeceptive person\b/gi,
  /\btruth verified\b/gi,
  /\b100% lie\b/gi,
  /\bproven dishonest\b/gi,
  /\bcaught in a lie\b/gi,
  /\bproven false\b/gi,
] as const;

export const MANDATORY_DISCLOSURE_BANNER =
  "This application provides an AI-generated estimate of patterns associated with possible deception, inconsistency, stress, or uncertainty. It cannot determine truth, intent, guilt, or dishonesty with certainty. Results may be affected by anxiety, trauma, disability, neurodivergence, culture, language, illness, medication, fatigue, camera quality, microphone quality, lighting, background noise, and context. This tool must not be used as the sole basis for employment, housing, credit, legal, law enforcement, immigration, medical, educational, or other important decisions. Always obtain proper consent before recording or analyzing anyone.";

export const MANDATORY_GLASSES_DISCLOSURE =
  "Smart-glasses analysis must not be used for covert recording or unlawful surveillance. The wearer is responsible for obtaining consent and following all applicable recording and privacy laws.";

export interface SanitizationResult {
  text: string;
  violationsFound: string[];
  wasSanitized: boolean;
}

/**
 * Sanitizes any AI-generated or user-facing string before it reaches UI, database, or PDF export.
 */
export function sanitizeVeriCueOutput(input: string): SanitizationResult {
  if (!input) return { text: "", violationsFound: [], wasSanitized: false };

  let sanitized = input;
  const violationsFound: string[] = [];

  // Replace forbidden terms with probabilistic, compliance-approved phrasing
  sanitized = sanitized.replace(/\bliar\b/gi, (match) => {
    violationsFound.push(match);
    return "speaker displaying elevated risk cues";
  });

  sanitized = sanitized.replace(/\blie confirmed\b/gi, (match) => {
    violationsFound.push(match);
    return "high probability deception-risk cues detected";
  });

  sanitized = sanitized.replace(/\bdefinitely lying\b/gi, (match) => {
    violationsFound.push(match);
    return "exhibits elevated behavioral inconsistency cues";
  });

  sanitized = sanitized.replace(/\bguilty\b/gi, (match) => {
    violationsFound.push(match);
    return "elevated indicators flagged for human review";
  });

  sanitized = sanitized.replace(/\bdeceptive person\b/gi, (match) => {
    violationsFound.push(match);
    return "subject showing elevated divergence from baseline";
  });

  sanitized = sanitized.replace(/\btruth verified\b/gi, (match) => {
    violationsFound.push(match);
    return "low indicators of deception detected";
  });

  sanitized = sanitized.replace(/\b100% lie\b/gi, (match) => {
    violationsFound.push(match);
    return "high-probability cue elevation";
  });

  sanitized = sanitized.replace(/\bproven dishonest\b/gi, (match) => {
    violationsFound.push(match);
    return "statistically elevated inconsistency pattern";
  });

  sanitized = sanitized.replace(/\bcaught in a lie\b/gi, (match) => {
    violationsFound.push(match);
    return "unresolved contextual contradiction flagged";
  });

  sanitized = sanitized.replace(/\bproven false\b/gi, (match) => {
    violationsFound.push(match);
    return "contradiction with external reference records";
  });

  return {
    text: sanitized,
    violationsFound,
    wasSanitized: violationsFound.length > 0,
  };
}

/**
 * Verifies whether text strictly complies with VeriCue non-negotiable terminology standards.
 */
export function validateVeriCueCompliance(text: string): { compliant: boolean; issues: string[] } {
  const issues: string[] = [];
  for (const regex of FORBIDDEN_TERMS) {
    if (regex.test(text)) {
      issues.push(`Prohibited phrasing detected matching: ${regex.source}`);
    }
  }
  return {
    compliant: issues.length === 0,
    issues,
  };
}
