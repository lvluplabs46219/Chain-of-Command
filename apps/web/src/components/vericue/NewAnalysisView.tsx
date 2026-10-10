"use client";

import React, { useState } from "react";
import {
  Upload,
  Mic,
  FileText,
  Video,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Languages,
  Sliders,
} from "lucide-react";
import { SessionAnalysis, StatementAnalysis } from "@/lib/vericue-types";
import { SCORE_BANDS, getBandForScore } from "@/lib/vericue-data";

interface NewAnalysisViewProps {
  onSessionCreated: (session: SessionAnalysis) => void;
}

export function NewAnalysisView({ onSessionCreated }: NewAnalysisViewProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "record" | "transcript">("upload");
  const [title, setTitle] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [caseRef, setCaseRef] = useState("");
  const [language, setLanguage] = useState("English (US)");
  const [sampleFileLoaded, setSampleFileLoaded] = useState(false);
  const [fileName, setFileName] = useState("");
  const [transcriptText, setTranscriptText] = useState("");
  const [consentConfirmed, setConsentConfirmed] = useState(false);

  // Pipeline execution state
  const [isProcessing, setIsProcessing] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0);

  const PIPELINE_STEPS = [
    "Step 1/7: Ingesting media & validating container metadata...",
    "Step 2/7: Separating 16kHz mono acoustic stream & filtering noise...",
    "Step 3/7: Generating timestamped phoneme transcription...",
    "Step 4/7: Diarizing speaker turns & Q/A boundaries...",
    "Step 5/7: Extracting linguistic, vocal F0, and facial action unit vectors...",
    "Step 6/7: Comparing vectors against subject's longitudinal baseline...",
    "Step 7/7: Computing isotonic fusion score & generating sanitized report...",
  ];

  const handleSimulateUpload = () => {
    setSampleFileLoaded(true);
    setFileName("deposition_hearing_vance_20261008.mp4 (142.8 MB)");
    if (!title) setTitle("Witness Statement Deposition - Industrial Logistics Audit");
    if (!subjectName) setSubjectName("Marcus K. Sterling");
    if (!caseRef) setCaseRef("AUD-2026-0922");
  };

  const handleStartPipeline = () => {
    if (!consentConfirmed) return;
    setIsProcessing(true);
    setPipelineStep(0);

    // Simulate progressive execution through 7 stages
    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      if (current < PIPELINE_STEPS.length) {
        setPipelineStep(current);
      } else {
        clearInterval(interval);
        // Complete and create new session object
        const newSessionId = `sess-${Date.now()}`;
        const newSession: SessionAnalysis = {
          id: newSessionId,
          title: title || "New Ingested Analysis Session",
          subjectName: subjectName || "Subject Individual",
          caseRef: caseRef || "CASE-REF-LOCAL",
          date: new Date().toISOString().split("T")[0],
          durationFormatted: "16m 40s",
          mediaType: activeTab === "record" ? "video" : activeTab === "upload" ? "video" : "transcript",
          language,
          overallProbability: 64,
          overallBand: "elevated",
          overallConfidence: 0.81,
          overallDataQuality: 0.89,
          dataQualitySummary: "Good Audio/Video SNR, clean 48kHz audio, clear facial visibility.",
          modelVersion: "VeriCue Ensemble v2.4.1 (Isotonic Calibrated)",
          calibrationBrierScore: 0.114,
          humanReviewRequired: true,
          exportLocked: true,
          status: "needs_review",
          workspaceId: "ws-primary",
          speakerBaseline: {
            speakerId: `spk-${Date.now()}`,
            speakerName: subjectName || "Subject Individual",
            sessionsCount: 1,
            averageSpeechRateWpm: 158,
            averagePitchHz: 128,
            averageResponseLatencySec: 0.82,
            typicalHedgingDensity: 0.03,
            lastCalibratedDate: new Date().toISOString().split("T")[0],
          },
          statements: [
            {
              id: `stmt-new-1`,
              statementIndex: 1,
              speaker: subjectName || "Subject Individual",
              timestampStart: "01:15",
              timestampEnd: "01:42",
              transcript: "I reviewed the invoices personally before signing the approval authorization.",
              probabilityScore: 22,
              band: "low",
              confidence: 0.88,
              uncertaintyFlag: false,
              dataQualityScore: 0.94,
              dataQualityFactors: ["Optimal acoustic SNR"],
              cues: [],
              explanation: "Low deception-risk indicators. Cadence and vocal pitch are within normal baseline thresholds.",
              baselineDeltas: {
                speechRateDeltaPercent: -1.2,
                pitchDeviationHz: 3,
                responseLatencySeconds: 0.6,
                hesitationIndex: 0.05,
              },
              humanReviewRequired: false,
            },
            {
              id: `stmt-new-2`,
              statementIndex: 2,
              speaker: subjectName || "Subject Individual",
              timestampStart: "05:40",
              timestampEnd: "06:18",
              transcript: "No, as far as I recall, essentially the contractor was already approved by compliance before I signed off.",
              probabilityScore: 71,
              band: "elevated",
              confidence: 0.82,
              uncertaintyFlag: false,
              dataQualityScore: 0.88,
              dataQualityFactors: ["Clear speech"],
              cues: [
                {
                  cueId: "cue-ling-1",
                  name: "Hedging Language",
                  category: "linguistic",
                  strength: "strong_evidence",
                  weight: 0.08,
                  deltaScore: 0.74,
                  evidenceQuote: "'as far as I recall, essentially'",
                  observationNote: "Epistemic qualifiers shield core claim from direct verification.",
                },
                {
                  cueId: "cue-aud-1",
                  name: "Pitch Elevation Shift",
                  category: "audio",
                  strength: "strong_evidence",
                  weight: 0.09,
                  deltaScore: 0.79,
                  observationNote: "Pitch surged +24 Hz during the compliance sign-off denial.",
                },
              ],
              explanation: "Elevated probability cues: Subject exhibits hedging language paired with a prominent vocal pitch spike.",
              baselineDeltas: {
                speechRateDeltaPercent: -18.5,
                pitchDeviationHz: 24,
                responseLatencySeconds: 1.9,
                hesitationIndex: 0.58,
              },
              humanReviewRequired: true,
            },
          ],
        };

        setIsProcessing(false);
        onSessionCreated(newSession);
      }
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 text-[#E1E2E5]">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono tracking-wider uppercase text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
            Pipeline Stages 1–7 (Blueprint §7)
          </span>
          <span className="text-xs text-neutral-400">Auditable Media Processing</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
          New Analysis & Media Ingestion Console
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Upload recorded media, initiate live capture, or import structured interview transcripts for multimodal cue extraction.
        </p>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex rounded-xl bg-[#12141D] p-1 border border-[#232636] max-w-md">
        <button
          onClick={() => setActiveTab("upload")}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === "upload"
              ? "bg-amber-500 text-neutral-950 shadow-sm"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload File</span>
        </button>
        <button
          onClick={() => setActiveTab("record")}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === "record"
              ? "bg-amber-500 text-neutral-950 shadow-sm"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>Record Live</span>
        </button>
        <button
          onClick={() => setActiveTab("transcript")}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === "transcript"
              ? "bg-amber-500 text-neutral-950 shadow-sm"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Import Text</span>
        </button>
      </div>

      {/* Metadata Form */}
      <div className="bg-[#12141D] border border-[#232636] rounded-2xl p-5 sm:p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white border-b border-[#202330] pb-2">
          1. Session & Case Metadata
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-neutral-300 font-medium mb-1">
              Session Title / Description
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Claimant Deposition - Vance Loss Claim"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#161924] border border-[#2A2E40] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs text-neutral-300 font-medium mb-1">
              Subject Name (For Baseline Association)
            </label>
            <input
              type="text"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              placeholder="e.g. Arthur Vance"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#161924] border border-[#2A2E40] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs text-neutral-300 font-medium mb-1">
              Matter / Case Reference (Optional)
            </label>
            <input
              type="text"
              value={caseRef}
              onChange={(e) => setCaseRef(e.target.value)}
              placeholder="e.g. INS-2026-08492-SIU"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#161924] border border-[#2A2E40] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs text-neutral-300 font-medium mb-1 flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-neutral-400" />
              <span>Primary Audio Language</span>
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#161924] border border-[#2A2E40] text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="English (US)">English (US / UK) — 6.1% Studio FPR</option>
              <option value="Spanish (ES/MX)">Spanish (ES / MX) — 8.9% FPR</option>
              <option value="French (FR)">French (FR) — 9.5% FPR</option>
              <option value="German (DE)">German (DE) — 8.2% FPR</option>
              <option value="Mandarin (CN)">Mandarin (CN) — 11.4% FPR</option>
            </select>
          </div>
        </div>
      </div>

      {/* Upload Box / Input Form */}
      <div className="bg-[#12141D] border border-[#232636] rounded-2xl p-5 sm:p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white border-b border-[#202330] pb-2">
          2. Media Source & Container
        </h2>

        {activeTab === "upload" && (
          <div className="space-y-3">
            <div
              onClick={handleSimulateUpload}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                sampleFileLoaded
                  ? "border-emerald-500/50 bg-emerald-950/10"
                  : "border-[#2D334A] hover:border-amber-500/50 bg-[#161924] hover:bg-[#181d2b]"
              }`}
            >
              <Upload className={`w-8 h-8 mb-2 ${sampleFileLoaded ? "text-emerald-400" : "text-neutral-400"}`} />
              {sampleFileLoaded ? (
                <>
                  <p className="text-xs font-semibold text-emerald-400">File Loaded & Validated</p>
                  <p className="text-[11px] font-mono text-neutral-300 mt-1">{fileName}</p>
                  <span className="text-[10px] text-neutral-400 mt-2">Click to replace media file</span>
                </>
              ) : (
                <>
                  <p className="text-xs font-semibold text-white">Click or drag & drop video/audio here</p>
                  <p className="text-[11px] text-neutral-400 mt-1">Supports MP4, MOV, WAV, MP3 up to 2 GB</p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSimulateUpload();
                    }}
                    className="mt-3 px-3 py-1.5 rounded-lg bg-[#222738] border border-[#323952] text-xs font-medium text-amber-300 hover:bg-[#2b3147] cursor-pointer"
                  >
                    Load Sample Deposition Media
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === "record" && (
          <div className="p-6 rounded-xl bg-[#161924] border border-[#2A2E40] text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
              <Mic className="w-6 h-6 animate-pulse" />
            </div>
            <p className="text-xs font-semibold text-white">Live Microphone & Camera Capture</p>
            <p className="text-[11px] text-neutral-400 max-w-md mx-auto">
              Direct in-browser recorder streams audio to the 16kHz mono separator while logging visual action units.
            </p>
            <button
              onClick={handleSimulateUpload}
              className="px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-semibold hover:bg-rose-600 transition-colors cursor-pointer"
            >
              Arm Studio Recording
            </button>
          </div>
        )}

        {activeTab === "transcript" && (
          <div className="space-y-2">
            <label className="block text-xs text-neutral-300 font-medium">
              Paste Structured Transcript (Q&A Turns)
            </label>
            <textarea
              rows={5}
              value={transcriptText}
              onChange={(e) => {
                setTranscriptText(e.target.value);
                setSampleFileLoaded(e.target.value.length > 20);
              }}
              placeholder="Q: Where were you on the night of the incident?&#10;A: I was home all night after 7:30 PM. I never left the house..."
              className="w-full p-3 rounded-xl bg-[#161924] border border-[#2A2E40] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>
        )}
      </div>

      {/* Consent Gating Confirmation */}
      <div className="bg-[#12141D] border border-[#232636] rounded-2xl p-5 space-y-3">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={consentConfirmed}
            onChange={(e) => setConsentConfirmed(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-[#383C4E] text-amber-500 focus:ring-amber-500 bg-[#0F1117]"
          />
          <div className="text-xs text-neutral-300 leading-snug">
            <strong className="text-white block font-medium">Verified Recording & Analysis Consent</strong>
            I confirm that explicit consent has been obtained from all recorded speakers pursuant to regional wiretap statutes, and this analysis is not conducted for unlawful covert surveillance.
          </div>
        </label>
      </div>

      {/* Pipeline Progress Modal / Indicator */}
      {isProcessing ? (
        <div className="p-6 rounded-2xl bg-[#161926] border border-amber-500/40 shadow-xl space-y-4">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
            <h3 className="text-sm font-semibold text-white">
              Running 10-Stage Multimodal Cue Pipeline...
            </h3>
          </div>
          <div className="w-full bg-[#0E1017] rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-amber-300 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${((pipelineStep + 1) / PIPELINE_STEPS.length) * 100}%` }}
            />
          </div>
          <p className="text-xs font-mono text-amber-300">
            {PIPELINE_STEPS[pipelineStep]}
          </p>
        </div>
      ) : (
        <div className="flex justify-end">
          <button
            onClick={handleStartPipeline}
            disabled={!consentConfirmed || !sampleFileLoaded}
            className={`px-6 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              consentConfirmed && sampleFileLoaded
                ? "bg-amber-500 text-neutral-950 hover:bg-amber-400 shadow-lg shadow-amber-500/20"
                : "bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700/50"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Execute Ingestion & Scoring Pipeline</span>
          </button>
        </div>
      )}
    </div>
  );
}
