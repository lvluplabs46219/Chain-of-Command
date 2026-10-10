"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Radio,
  Mic,
  MicOff,
  Video,
  Pause,
  Play,
  Square,
  AlertTriangle,
  ShieldAlert,
  Sparkles,
  Volume2,
  CheckCircle2,
  Bookmark,
  Send,
  Sliders,
  HelpCircle,
} from "lucide-react";
import { StatementAnalysis, DeceptionBand } from "@/lib/vericue-types";
import { SCORE_BANDS, getBandForScore } from "@/lib/vericue-data";
import { sanitizeVeriCueOutput } from "@/lib/sanitizer";

interface LiveAnswerRecord {
  id: string;
  question: string;
  answer: string;
  speaker: string;
  timestamp: string;
  probabilityScore: number;
  band: DeceptionBand;
  confidence: number;
  uncertaintyFlag: boolean;
  dataQuality: number;
  cues: Array<{ name: string; category: string; strength: string }>;
  explanation: string;
}

export function LiveAnalysisView() {
  const [isRecording, setIsRecording] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(248);
  const [currentSpeaker, setCurrentSpeaker] = useState<"Interviewer" | "Arthur Vance">("Arthur Vance");
  const [micActive, setMicActive] = useState(true);
  const [audioLevel, setAudioLevel] = useState(45);

  // Per-answer scoring state (Score is ONLY rendered after complete answer)
  const [inProgressTranscript, setInProgressTranscript] = useState(
    "I was on the second floor reviewing shipping manifests until approximately..."
  );
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [customInputText, setCustomInputText] = useState("");

  const [liveAnswers, setLiveAnswers] = useState<LiveAnswerRecord[]>([
    {
      id: "live-ans-1",
      question: "At what time did you secure the building on Sunday?",
      answer: "I left through the front door at exactly 6:00 PM and activated the exterior keypad alarm.",
      speaker: "Arthur Vance",
      timestamp: "02:14",
      probabilityScore: 24,
      band: "low",
      confidence: 0.88,
      uncertaintyFlag: false,
      dataQuality: 0.92,
      cues: [],
      explanation: "Low deception-risk cues. Pitch and speech rate match baseline. No internal or external contradictions flagged.",
    },
    {
      id: "live-ans-2",
      question: "Did anyone access the water shutoff valve prior to the pipe breach?",
      answer: "No, as far as I know, essentially nobody on the crew touched that valve all weekend.",
      speaker: "Arthur Vance",
      timestamp: "03:42",
      probabilityScore: 72,
      band: "elevated",
      confidence: 0.84,
      uncertaintyFlag: false,
      dataQuality: 0.90,
      cues: [
        { name: "Hedging Language", category: "linguistic", strength: "strong_evidence" },
        { name: "Pitch Elevation Shift (+24 Hz)", category: "audio", strength: "strong_evidence" },
        { name: "Internal Statement Contradiction", category: "contextual", strength: "strong_evidence" },
      ],
      explanation: "Elevated probability cues: Epistemic disclaimers ('as far as I know', 'essentially') combined with a prominent pitch elevation (+24 Hz) and conflict with maintenance log.",
    },
    {
      id: "live-ans-3",
      question: "Can you confirm the serial numbers on the salvaged electronics pallets?",
      answer: "The serials were cataloged on a sheet in the truck, but the rain smudged the ink.",
      speaker: "Arthur Vance",
      timestamp: "04:05",
      probabilityScore: 48,
      band: "indeterminate",
      confidence: 0.42,
      uncertaintyFlag: true,
      dataQuality: 0.54,
      cues: [{ name: "Acoustic Disfluency", category: "audio", strength: "weak_signal" }],
      explanation: "Result Indeterminate: Data quality degraded by background truck engine acoustic rumble. Model confidence below 0.50 threshold. Suggest follow-up clarification.",
    },
  ]);

  // Audio VU meter simulation
  useEffect(() => {
    if (!isRecording || isPaused) return;
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
      setAudioLevel(35 + Math.floor(Math.random() * 30));
    }, 1000);
    return () => clearInterval(timer);
  }, [isRecording, isPaused]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleCompleteCurrentStatement = (textToScore?: string) => {
    const stmt = textToScore || inProgressTranscript;
    if (!stmt.trim()) return;

    setIsEvaluating(true);
    setTimeout(() => {
      const isHedging = stmt.toLowerCase().includes("as far as") || stmt.toLowerCase().includes("essentially");
      const isContradiction = stmt.toLowerCase().includes("never") && stmt.toLowerCase().includes("except");
      const score = isContradiction ? 78 : isHedging ? 66 : 28;
      const band = getBandForScore(score).band;

      const newRecord: LiveAnswerRecord = {
        id: `live-ans-${Date.now()}`,
        question: "Interviewer inquiry regarding timeline continuity",
        answer: stmt,
        speaker: currentSpeaker,
        timestamp: formatTime(elapsedSeconds),
        probabilityScore: score,
        band,
        confidence: 0.85,
        uncertaintyFlag: band === "indeterminate",
        dataQuality: 0.91,
        cues: isHedging
          ? [{ name: "Hedging Language", category: "linguistic", strength: "strong_evidence" }]
          : [],
        explanation: isHedging
          ? "Elevated cues: Hedging terminology clustered during temporal assertion."
          : "Low deception-risk indicators. Vocal parameters consistent with speaker baseline.",
      };

      setLiveAnswers((prev) => [newRecord, ...prev]);
      setInProgressTranscript("Listening for subsequent statement...");
      setCustomInputText("");
      setIsEvaluating(false);
    }, 600);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 text-[#E1E2E5]">
      {/* Top Controller Bar */}
      <div className="bg-[#12141D] border border-[#232636] rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider">
              {isPaused ? "LIVE PAUSED" : "LIVE ANALYSIS STREAM ACTIVE"}
            </span>
          </div>

          <div className="font-mono text-sm font-semibold text-white px-2.5 py-1 rounded bg-[#181B26] border border-[#2A2E40]">
            {formatTime(elapsedSeconds)}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="px-3 py-1.5 rounded-lg bg-[#181B26] border border-[#2D3246] hover:bg-[#202534] text-xs font-medium text-neutral-200 flex items-center gap-1.5 cursor-pointer"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
            <span>{isPaused ? "Resume" : "Pause"}</span>
          </button>

          <button
            onClick={() => setMicActive(!micActive)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 cursor-pointer ${
              micActive
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-rose-500/10 border-rose-500/30 text-rose-300"
            }`}
          >
            {micActive ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
            <span>{micActive ? "Mic Live (48kHz)" : "Mic Muted"}</span>
          </button>

          {/* VU Meter */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181B26] border border-[#2D3246]">
            <Volume2 className="w-3.5 h-3.5 text-neutral-400" />
            <div className="w-16 h-2 bg-[#0E1017] rounded-full overflow-hidden">
              <div
                className="bg-emerald-400 h-full transition-all duration-100"
                style={{ width: `${audioLevel}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Audio Stream & Q/A Formatter */}
        <div className="lg:col-span-7 space-y-4">
          {/* Active Statement Box */}
          <div className="bg-[#12141D] border border-[#232636] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#202330] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase text-amber-400 font-bold px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                  Active Q&A Buffer
                </span>
                <span className="text-xs text-neutral-400">
                  Speaker: <strong className="text-white">{currentSpeaker}</strong>
                </span>
              </div>
              <span className="text-[10px] text-neutral-500 font-mono">p95 Latency: &lt;640ms</span>
            </div>

            <div className="p-4 rounded-xl bg-[#161824] border border-[#292D3E] min-h-[90px] flex items-center">
              <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-sans italic">
                "{inProgressTranscript}"
              </p>
            </div>

            {/* Strict Constraint Notice: Score is only shown AFTER complete answer */}
            <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/25 flex items-start gap-2 text-[11px] text-amber-300/90 leading-tight">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Non-Negotiable Rule (Blueprint §10):</strong> Scoring triggers only after a complete answer. No mid-sentence scores are computed to prevent false positives during exploratory thought.
              </span>
            </div>

            {/* Simulation Triggers for Live Testing */}
            <div className="pt-2 flex flex-wrap gap-2">
              <button
                onClick={() => handleCompleteCurrentStatement("I was on the second floor reviewing shipping manifests until approximately 7:15 PM.")}
                disabled={isEvaluating}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium hover:bg-emerald-500/25 cursor-pointer"
              >
                Trigger Complete Direct Answer (Low Risk)
              </button>
              <button
                onClick={() => handleCompleteCurrentStatement("No, as far as I know, essentially I never went near the basement except when maintenance asked.")}
                disabled={isEvaluating}
                className="px-3 py-1.5 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-300 text-xs font-medium hover:bg-orange-500/25 cursor-pointer"
              >
                Trigger Hedged Contradiction (Elevated Risk)
              </button>
            </div>

            {/* Custom Input */}
            <div className="pt-2 flex gap-2">
              <input
                type="text"
                value={customInputText}
                onChange={(e) => setCustomInputText(e.target.value)}
                placeholder="Or type a test statement for live scoring..."
                className="flex-1 px-3 py-2 rounded-xl bg-[#161924] border border-[#2A2E40] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={() => handleCompleteCurrentStatement(customInputText)}
                disabled={!customInputText.trim() || isEvaluating}
                className="px-4 py-2 rounded-xl bg-amber-500 text-neutral-950 font-semibold text-xs hover:bg-amber-400 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Evaluate</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Per-Answer Scored Stream */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#12141D] border border-[#232636] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#202330] pb-3">
              <h3 className="text-sm font-semibold text-white">Live Evaluated Statements</h3>
              <span className="text-[11px] font-mono text-neutral-400">{liveAnswers.length} Statements</span>
            </div>

            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {liveAnswers.map((item) => {
                const bandConfig = getBandForScore(item.probabilityScore);
                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-[#161924] border border-[#252838] space-y-2 hover:border-[#383E54] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-neutral-400">
                        [{item.timestamp}] {item.speaker}
                      </span>
                      <div className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${bandConfig.badgeColor}`}>
                        {bandConfig.label} ({item.probabilityScore}%)
                      </div>
                    </div>

                    <p className="text-xs text-neutral-200 leading-snug">
                      "{item.answer}"
                    </p>

                    {item.uncertaintyFlag && (
                      <div className="inline-flex items-center gap-1 text-[10px] text-amber-400 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Indeterminate (Confidence &lt; 0.50)</span>
                      </div>
                    )}

                    {item.cues.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {item.cues.map((c, idx) => (
                          <span
                            key={idx}
                            className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#202434] text-neutral-300 border border-[#2F354D]"
                          >
                            {c.name}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="text-[10px] text-neutral-400 border-t border-[#222534] pt-1.5 mt-1 leading-normal">
                      {item.explanation}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
