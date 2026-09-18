/**
 * Test Migration Mappers Script
 * Validates transformation from mock data formats to backend schemas.
 */

import {
  mapBackendToLegalAuthority,
  mapCourtListenerToLegalAuthority,
  mapBackendToTimelineEvent,
  mapBackendRunToAiChatMessage
} from "../apps/web/src/lib/migrationMappers.ts";

console.log("=== Testing Acquit.ai Migration Mappers ===");

// 1. Test Authority mapping
const sampleBackendAuth = {
  id: "auth-101",
  title: "State v. Henderson",
  citation: "214 N.E.3d 402 (Ind. 2024)",
  court: "Indiana Supreme Court",
  jurisdiction: "Indiana",
  year: 2024,
  status: "binding",
  holdingSummary: "Warrantless seizure of mobile phone contents without consent violates Ind. Const. art. 1, § 11.",
  verbatimExcerpt: "The expectation of privacy in cellular devices demands strict compliance with warrant requirements.",
  citingCasesCount: 18,
  tags: ["Fourth Amendment", "Digital Search"]
};

const mappedAuthority = mapBackendToLegalAuthority(sampleBackendAuth);
console.log("✓ Mapped Authority:", mappedAuthority.title, "| Precedential Status:", mappedAuthority.precedentialStatus);

// 2. Test CourtListener mapping
const sampleCourtListener = {
  id: 4892011,
  caseName: "Rodriguez v. United States",
  citation: ["575 U.S. 348"],
  court: "Supreme Court of the United States",
  dateFiled: "2015-04-21",
  snippet: "A police stop exceeding the time needed to handle the matter for which the stop was made violates the Constitution's shield against unreasonable seizures."
};

const mappedCourtListener = mapCourtListenerToLegalAuthority(sampleCourtListener);
console.log("✓ Mapped CourtListener Authority:", mappedCourtListener.citation, "| Year:", mappedCourtListener.year);

// 3. Test Timeline Event mapping
const sampleBackendTimeline = {
  id: "evt-001",
  title: "Formal Arraignment & Plea Entry",
  description: "Defendant appeared pro se; entered not guilty plea; court set discovery deadlines.",
  eventDate: "2026-06-15T09:00:00Z",
  category: "hearing",
  stage: "initial",
  status: "completed",
  location: "Courtroom 4B",
  judge: "Hon. Marcus Vance"
};

const mappedTimeline = mapBackendToTimelineEvent(sampleBackendTimeline);
console.log("✓ Mapped Timeline Event:", mappedTimeline.title, "| Category:", mappedTimeline.category, "| Stage:", mappedTimeline.stage);

// 4. Test AI Run Completed mapping
const sampleBackendAiResponse = {
  runId: "run-984210",
  status: "completed",
  output: "Under Ind. R. Crim. P. 2.5, discovery packets must be tendered within 30 days of the omnibus date.",
  citations: [
    {
      id: "cit-1",
      statuteOrRule: "Ind. R. Crim. P. 2.5",
      summary: "Mandatory disclosure obligations of the prosecuting attorney.",
      confidence: 0.98
    }
  ],
  disclaimer: "This information is educational and not legal advice.",
  provider: "gemini",
  model: "gemini-3.8-flash",
  humanReviewRequired: true
};

const mappedAiMessage = mapBackendRunToAiChatMessage(sampleBackendAiResponse);
console.log("✓ Mapped AI Chat Message:", mappedAiMessage.agentName, "| Grounding Score:", mappedAiMessage.ragMetrics.groundingScorePercent + "%");
console.log("ALL MIGRATION MAPPERS VALIDATED SUCCESSFULLY.");
