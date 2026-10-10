/**
 * VeriCue AI Type Definitions (Blueprint v2.0)
 * Aligned with 10-stage pipeline, 18-cue catalog, 4-tier bands,
 * and 3-scenario profit model.
 */

export type DeceptionBand = "low" | "indeterminate" | "elevated" | "high";

export interface BandConfig {
  band: DeceptionBand;
  rangeMin: number;
  rangeMax: number;
  label: string;
  badgeColor: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
  actionRequired: string;
}

export type CueCategory =
  | "linguistic"
  | "audio"
  | "visual"
  | "contextual"
  | "data_quality";

export type CueStrength = "strong_evidence" | "weak_signal";

export interface CueDefinition {
  id: string;
  name: string;
  category: CueCategory;
  weight: number;
  description: string;
  empiricalBasis: string;
  typicalCounterExplanation: string;
}

export interface DetectedCue {
  cueId: string;
  name: string;
  category: CueCategory;
  strength: CueStrength;
  weight: number;
  deltaScore: number; // 0.0 to 1.0 magnitude
  timestampSec?: number;
  evidenceQuote?: string;
  observationNote: string;
}

export interface ReviewerSignOff {
  signedOff: boolean;
  reviewerId: string;
  reviewerName: string;
  licenseOrRole: string;
  organization: string;
  timestamp: string;
  notes: string;
  concurrence: "concurs" | "adjusted_downward" | "flagged_inconclusive";
  certificationCode: string;
}

export interface StatementAnalysis {
  id: string;
  statementIndex: number;
  speaker: string;
  timestampStart: string;
  timestampEnd: string;
  transcript: string;
  probabilityScore: number; // 0 to 100
  band: DeceptionBand;
  confidence: number; // 0.0 to 1.0
  uncertaintyFlag: boolean;
  uncertaintyReason?: string;
  dataQualityScore: number; // 0.0 to 1.0
  dataQualityFactors: string[];
  cues: DetectedCue[];
  explanation: string;
  suggestedFollowUpQuestions?: string[];
  baselineDeltas: {
    speechRateDeltaPercent: number;
    pitchDeviationHz: number;
    responseLatencySeconds: number;
    hesitationIndex: number;
  };
  humanReviewRequired: boolean;
}

export interface SpeakerBaseline {
  speakerId: string;
  speakerName: string;
  sessionsCount: number;
  averageSpeechRateWpm: number;
  averagePitchHz: number;
  averageResponseLatencySec: number;
  typicalHedgingDensity: number;
  lastCalibratedDate: string;
}

export interface SessionAnalysis {
  id: string;
  title: string;
  subjectName: string;
  caseRef?: string;
  date: string;
  durationFormatted: string;
  mediaType: "video" | "audio" | "transcript" | "live";
  mediaUrl?: string;
  language: string;
  overallProbability: number; // 0 to 100
  overallBand: DeceptionBand;
  overallConfidence: number; // 0.0 to 1.0
  overallDataQuality: number; // 0.0 to 1.0
  dataQualitySummary: string;
  statements: StatementAnalysis[];
  speakerBaseline?: SpeakerBaseline;
  modelVersion: string;
  calibrationBrierScore: number;
  humanReviewRequired: boolean;
  reviewerSignOff?: ReviewerSignOff;
  exportLocked: boolean; // True if Elevated/High and unreviewed
  status: "completed" | "processing" | "needs_review";
  workspaceId: string;
}

// -------------------------------------------------------------
// Smart Glasses Types (§5 Page 12, §6, §11)
// -------------------------------------------------------------
export interface SmartGlassesDevice {
  id: string;
  modelName: string;
  batteryPercent: number;
  connected: boolean;
  recordingActive: boolean;
  privacyModeEnabled: boolean;
  displayMode: "optical_visor" | "phone_companion";
  hapticFeedbackEnabled: boolean;
  earpieceAudioSummary: boolean;
  lastHeartbeat: string;
}

export interface HudStatementState {
  currentStatement: string;
  speaker: string;
  lastScore: number | null;
  lastBand: DeceptionBand | "indeterminate";
  confidence: number;
  uncertaintyFlag: boolean;
  isCompleteAnswer: boolean; // Score ONLY shown after complete answer
  recordingIndicator: boolean;
  timestamp: string;
}

// -------------------------------------------------------------
// Model Routing & Latency Budget (§7)
// -------------------------------------------------------------
export interface ModelRouteEntry {
  useCase: string;
  latencyBudgetMs: number;
  actualP95Ms: number;
  primaryProvider: string;
  fallbackProvider: string;
  activeStatus: "optimal" | "degraded" | "fallback_active";
  tokensPerSessionAvg: number;
}

// -------------------------------------------------------------
// Dataset Governance (§5 Page 21)
// -------------------------------------------------------------
export interface DatasetGovernanceEntry {
  id: string;
  name: string;
  license: "Commercial Validated" | "Research Only (Isolated)" | "Proprietary Consented";
  consentStatus: "Verified Individual Consent" | "Public Deposition" | "Simulated Lab";
  labelMeaning: "Real-World Ground Truth" | "Acted Deception" | "Synthetic Benchmark";
  sampleCount: number;
  languages: string[];
  knownBiasNotes: string;
  splitIsolation: "Strict Speaker-Disjoint Holdout";
  version: string;
  activeInProductionModel: boolean;
}

// -------------------------------------------------------------
// Calibration Metrics (§5 Page 22)
// -------------------------------------------------------------
export interface CalibrationBucket {
  predictedBin: string; // e.g., "0.1-0.2"
  predictedMean: number;
  empiricalTruePositiveRate: number;
  sampleCount: number;
}

export interface LanguagePerformance {
  language: string;
  sessionsTested: number;
  falsePositiveRate: number;
  falseNegativeRate: number;
  accuracy: number;
  calibrationDelta: number;
}

export interface QualityBandPerformance {
  band: "Studio HD (Clean Audio/Lighting)" | "Good Mobile Quality" | "Low Bitrate / Ambient Noise";
  falsePositiveRate: number;
  falseNegativeRate: number;
  confidencePenaltyApplied: number;
}

// -------------------------------------------------------------
// Profit Model & Unit Economics (§2, §14)
// -------------------------------------------------------------
export interface UnitEconomicsTier {
  tierName: "Consumer Pro" | "Business Workspace" | "Enterprise Private";
  listPriceMonthly: number;
  netPriceAfterFees: number;
  feePercentage: number;
  inferenceStorageCost: number;
  humanReviewShareCost: number;
  contributionMarginDollars: number;
  contributionMarginPercent: number;
  ltvDollars: number;
  cacDollars: number;
  ltvToCacRatio: number;
  paybackMonths: number;
}

export interface ScenarioYearData {
  year: 1 | 2 | 3;
  payingConsumersYearEnd: number;
  businessWorkspacesYearEnd: number;
  enterpriseAccountsYearEnd: number;
  arrExitingYear: number;
  consumerSubscriptionRevenue: number;
  businessSubscriptionRevenue: number;
  enterpriseSubscriptionRevenue: number;
  enterpriseOnboardingRevenue: number;
  addonsReviewerFeeRevenue: number;
  totalRevenue: number;
  variableInferenceStorageCost: number;
  variableHumanReviewCost: number;
  storeAndPaymentFees: number;
  grossProfit: number;
  grossMarginPercent: number;
  marketingAcquisitionCost: number;
  fixedOperatingCost: number;
  operatingProfitLoss: number;
  cumulativeOperatingProfitLoss: number;
  totalSessionsAnalyzed: number;
  revenueNeededToBreakEven: number;
  surplusOrShortfallVsBreakeven: number;
}

export interface ProfitModelScenario {
  id: "conservative" | "base" | "optimistic";
  name: string;
  description: string;
  years: [ScenarioYearData, ScenarioYearData, ScenarioYearData];
  breakevenStatus: string;
  peakFundingNeed: number;
  threeYearCumulativeLossOrGain: number;
}

export interface MonetizationStream {
  id: number;
  name: string;
  proposedPrice: string;
  timeToFirstRevenue: string;
  targetBuyer: string;
  marginProfile: string;
  strategicRole: string;
}
