"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Activity,
  Upload,
  Radio,
  Glasses,
  FileText,
  DollarSign,
  Cpu,
  BarChart3,
  Database,
  SlidersHorizontal,
  Layers,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Settings,
  Scale,
  Sparkles,
  Sun,
  Moon,
  FlaskConical,
  User,
  ShieldAlert,
  ArrowLeft,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import { SAMPLE_SESSIONS } from "@/lib/vericue-data";
import { SessionAnalysis, ReviewerSignOff } from "@/lib/vericue-types";
import { DisclosureGate } from "./DisclosureGate";
import { PersistentDisclosureBanner } from "./PersistentDisclosureBanner";
import { HomeDashboard } from "./HomeDashboard";
import { NewAnalysisView } from "./NewAnalysisView";
import { LiveAnalysisView } from "./LiveAnalysisView";
import { SmartGlassesView } from "./SmartGlassesView";
import { ResultsDetailView } from "./ResultsDetailView";
import { CueBreakdownView } from "./CueBreakdownView";
import { ReportsReviewerView } from "./ReportsReviewerView";
import { ProfitModelView } from "./ProfitModelView";
import { EvaluationCalibrationView } from "./EvaluationCalibrationView";
import { ModelCenterView } from "./ModelCenterView";
import { DatasetGovernanceView } from "./DatasetGovernanceView";
import { SettingsComplianceView } from "./SettingsComplianceView";

export type VeriCueTab =
  | "home"
  | "new_analysis"
  | "live_mode"
  | "smart_glasses"
  | "results"
  | "cue_breakdown"
  | "reports"
  | "profit_model"
  | "calibration"
  | "model_center"
  | "governance"
  | "settings"
  | "legal";

interface VeriCueMasterAppProps {
  initialTab?: VeriCueTab;
}

export function VeriCueMasterApp({ initialTab = "home" }: VeriCueMasterAppProps) {
  const [hasConsented, setHasConsented] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<VeriCueTab>(initialTab);
  const [sessions, setSessions] = useState<SessionAnalysis[]>(SAMPLE_SESSIONS);
  const [selectedSessionId, setSelectedSessionId] = useState<string>(SAMPLE_SESSIONS[0].id);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check consent gate and saved theme preference in localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("vericue_consent_gate_v2");
      if (!stored) {
        setHasConsented(false);
      }
      const savedTheme = localStorage.getItem("vericue_theme_v2");
      if (savedTheme === "dark" || savedTheme === "light") {
        setTheme(savedTheme);
      } else {
        setTheme("dark");
      }
    }
  }, []);

  const handleToggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("vericue_theme_v2", next);
    }
  };

  const handleConsentAccepted = () => {
    setHasConsented(true);
  };

  const handleSelectSession = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setActiveTab("results");
  };

  const handleSessionCreated = (newSession: SessionAnalysis) => {
    setSessions((prev) => [newSession, ...prev]);
    setSelectedSessionId(newSession.id);
    setActiveTab("results");
  };

  const handleSignOffSession = (sessionId: string, signOff: ReviewerSignOff) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          return {
            ...s,
            reviewerSignOff: signOff,
            exportLocked: false,
            status: "completed",
          };
        }
        return s;
      })
    );
  };

  const selectedSession = sessions.find((s) => s.id === selectedSessionId) || sessions[0];
  const isDark = theme === "dark";

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        isDark ? "bg-[#020617] text-slate-100" : "bg-[#FFF5F8] text-slate-900"
      }`}
    >
      {/* Blocking Disclosure & Consent Gate if not yet accepted */}
      {!hasConsented && <DisclosureGate onAccept={handleConsentAccepted} />}

      {/* Mandatory Regulatory Header Banner (Blueprint §9 & §10) */}
      <PersistentDisclosureBanner />

      <div className="flex-1 flex min-h-0 relative">
        {/* ------------------------------------------------------------- */}
        {/* FIXED LEFT SIDEBAR (≈256px wide)                              */}
        {/* ------------------------------------------------------------- */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 flex flex-col justify-between transition-transform duration-200 border-r ${
            isDark
              ? "bg-[#0c1324] border-[#151b2d]"
              : "bg-[#FFF0F5] border-pink-200/90 shadow-xs"
          } ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        >
          {/* Top section: Brand Block & Navigation */}
          <div className="p-4 space-y-6 overflow-y-auto">
            {/* Brand Block */}
            <div className="pt-2">
              <div className="flex items-center justify-between">
                <div
                  onClick={() => {
                    setActiveTab("home");
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2.5 cursor-pointer group"
                >
                  {/* Stylized VeriCue Logo Prism */}
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 via-pink-500 to-rose-400 flex items-center justify-center text-white font-black text-base shadow-md shadow-rose-500/30 group-hover:scale-105 transition-transform">
                    V
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`font-black text-base tracking-tight ${
                          isDark ? "text-white" : "text-slate-900"
                        }`}
                      >
                        VeriCue AI
                      </span>
                      {/* Glowing CANDY Pill Badge */}
                      <span className="text-[9px] font-mono font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-[0_0_10px_rgba(244,63,94,0.45)]">
                        CANDY
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-mono tracking-wide block ${
                        isDark ? "text-rose-300" : "text-rose-600 font-semibold"
                      }`}
                    >
                      Forensic Epistemics
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sub-label return link to parent OS */}
              <div className="mt-3 pt-2 border-t border-pink-200/60 dark:border-slate-800">
                <Link
                  href="/"
                  className={`text-[11px] font-medium flex items-center gap-1 transition-colors ${
                    isDark
                      ? "text-slate-400 hover:text-rose-300"
                      : "text-slate-600 hover:text-rose-600"
                  }`}
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Return to Legal OS Workspace</span>
                </Link>
              </div>
            </div>

            {/* Section 1: Workstation Operations */}
            <div className="space-y-1">
              <span
                className={`text-[10px] font-mono uppercase tracking-widest px-2 font-bold block ${
                  isDark ? "text-slate-500" : "text-slate-500"
                }`}
              >
                Workstation Operations
              </span>

              <nav className="space-y-0.5 pt-1">
                {/* 1. Home (Dashboard) */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("home");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                    activeTab === "home"
                      ? isDark
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-xs"
                        : "bg-white text-rose-700 border border-pink-200/90 shadow-sm"
                      : isDark
                      ? "text-slate-300 hover:bg-slate-900/60 hover:text-white"
                      : "text-slate-700 hover:bg-pink-100/70 hover:text-slate-900"
                  }`}
                >
                  <Activity className="w-4 h-4 text-rose-500" />
                  <span>Home (Dashboard)</span>
                </button>

                {/* 2. New Analysis (Upload) */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("new_analysis");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                    activeTab === "new_analysis"
                      ? isDark
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-xs"
                        : "bg-white text-rose-700 border border-pink-200/90 shadow-sm"
                      : isDark
                      ? "text-slate-300 hover:bg-slate-900/60 hover:text-white"
                      : "text-slate-700 hover:bg-pink-100/70 hover:text-slate-900"
                  }`}
                >
                  <Upload className="w-4 h-4 text-rose-500" />
                  <span>New Analysis (Upload)</span>
                </button>

                {/* 3. Live Mode (with pulsing indicator) */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("live_mode");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    activeTab === "live_mode"
                      ? isDark
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-xs"
                        : "bg-white text-rose-700 border border-pink-200/90 shadow-sm"
                      : isDark
                      ? "text-slate-300 hover:bg-slate-900/60 hover:text-white"
                      : "text-slate-700 hover:bg-pink-100/70 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Radio className="w-4 h-4 text-rose-500" />
                    <span>Live Mode</span>
                  </div>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                  </span>
                </button>

                {/* 4. Smart Glasses */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("smart_glasses");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                    activeTab === "smart_glasses"
                      ? isDark
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-xs"
                        : "bg-white text-rose-700 border border-pink-200/90 shadow-sm"
                      : isDark
                      ? "text-slate-300 hover:bg-slate-900/60 hover:text-white"
                      : "text-slate-700 hover:bg-pink-100/70 hover:text-slate-900"
                  }`}
                >
                  <Glasses className="w-4 h-4 text-cyan-500" />
                  <span>Smart Glasses HUD</span>
                </button>

                {/* 5. Reports & Reviewer */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("reports");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                    activeTab === "reports"
                      ? isDark
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-xs"
                        : "bg-white text-rose-700 border border-pink-200/90 shadow-sm"
                      : isDark
                      ? "text-slate-300 hover:bg-slate-900/60 hover:text-white"
                      : "text-slate-700 hover:bg-pink-100/70 hover:text-slate-900"
                  }`}
                >
                  <FileText className="w-4 h-4 text-amber-500" />
                  <span>Reports &amp; Reviews</span>
                </button>

                {/* 6. Model Center (with ACTIVE emerald badge) */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("model_center");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    activeTab === "model_center"
                      ? isDark
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-xs"
                        : "bg-white text-rose-700 border border-pink-200/90 shadow-sm"
                      : isDark
                      ? "text-slate-300 hover:bg-slate-900/60 hover:text-white"
                      : "text-slate-700 hover:bg-pink-100/70 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Cpu className="w-4 h-4 text-emerald-500" />
                    <span>Model Center</span>
                  </div>
                  <span className="text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    ACTIVE
                  </span>
                </button>

                {/* Secondary Deep-Dives */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("cue_breakdown");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-[11px] font-medium flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === "cue_breakdown"
                      ? isDark
                        ? "text-rose-300 font-bold"
                        : "text-rose-700 font-bold"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                  <span>18-Cue Catalog</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("profit_model");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-[11px] font-medium flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === "profit_model"
                      ? isDark
                        ? "text-rose-300 font-bold"
                        : "text-rose-700 font-bold"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                  <span>3-Scenario Profit Model</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("calibration");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-[11px] font-medium flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === "calibration"
                      ? isDark
                        ? "text-rose-300 font-bold"
                        : "text-rose-700 font-bold"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Calibration (Brier: 0.114)</span>
                </button>
              </nav>
            </div>

            {/* Section 2: System Governance */}
            <div className="space-y-1 pt-2 border-t border-pink-200/60 dark:border-slate-800">
              <span
                className={`text-[10px] font-mono uppercase tracking-widest px-2 font-bold block ${
                  isDark ? "text-slate-500" : "text-slate-500"
                }`}
              >
                System Governance
              </span>

              <nav className="space-y-0.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("settings");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                    activeTab === "settings"
                      ? isDark
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                        : "bg-white text-rose-700 border border-pink-200 shadow-sm"
                      : isDark
                      ? "text-slate-300 hover:bg-slate-900/60"
                      : "text-slate-700 hover:bg-pink-100/70"
                  }`}
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Settings &amp; Audit Logs</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("governance");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                    activeTab === "governance"
                      ? isDark
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                        : "bg-white text-rose-700 border border-pink-200 shadow-sm"
                      : isDark
                      ? "text-slate-300 hover:bg-slate-900/60"
                      : "text-slate-700 hover:bg-pink-100/70"
                  }`}
                >
                  <Scale className="w-4 h-4 text-slate-400" />
                  <span>Legal &amp; Consent Governance</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Bottom Sidebar: Telemetry Integrity Progress Bar */}
          <div
            className={`p-4 border-t ${
              isDark ? "border-[#151b2d] bg-[#080d1a]" : "border-pink-200/80 bg-white"
            }`}
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="font-semibold text-slate-600 dark:text-slate-300">
                  Telemetry Integrity
                </span>
                <span className="font-bold text-emerald-400">99.8%</span>
              </div>

              {/* Pink-to-Emerald Gradient Progress Bar */}
              <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800/80 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-500 via-pink-400 to-emerald-400 shadow-[0_0_8px_rgba(244,63,94,0.35)]"
                  style={{ width: "99.8%" }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5">
                <span>SHA-256 Ledger: Live</span>
                <span className="text-emerald-400 font-semibold">0 Errors</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ------------------------------------------------------------- */}
        {/* MAIN CONTENT AREA WITH STICKY TOP HEADER                      */}
        {/* ------------------------------------------------------------- */}
        <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
          {/* Sticky Top Header */}
          <header
            className={`sticky top-0 z-30 border-b backdrop-blur-md transition-colors ${
              isDark
                ? "bg-[#0c1324]/90 border-[#151b2d]"
                : "bg-white/90 border-pink-200/90 shadow-2xs"
            }`}
          >
            <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-300"
                >
                  <Menu className="w-5 h-5" />
                </button>

                {/* Lab Status Chips */}
                <div className="hidden sm:flex items-center gap-2 text-xs font-mono">
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${
                      isDark
                        ? "bg-[#0E1527] border-[#222E46] text-rose-300"
                        : "bg-pink-50 border-pink-200 text-rose-700"
                    }`}
                  >
                    <FlaskConical className="w-3.5 h-3.5 text-rose-500" />
                    <span className="font-semibold">Forensic Behavioral Lab #04</span>
                  </div>

                  <div
                    className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full border ${
                      isDark
                        ? "bg-[#0E1527] border-[#222E46] text-slate-300"
                        : "bg-white border-pink-200 text-slate-700 shadow-2xs"
                    }`}
                  >
                    <Cpu className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Local Ollama (Llama-3-70B · 0ms Egress)</span>
                  </div>

                  <div
                    className={`hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full border ${
                      isDark
                        ? "bg-[#0E1527] border-[#222E46] text-emerald-400"
                        : "bg-emerald-50 border-emerald-200 text-emerald-700"
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="font-semibold">Consent: Verified &amp; Audited</span>
                  </div>
                </div>
              </div>

              {/* Right: Theme Switcher & User Profile */}
              <div className="flex items-center gap-3">
                {/* Theme Toggle (Candy Light ↔ Candy Dark) */}
                <button
                  type="button"
                  onClick={handleToggleTheme}
                  title={isDark ? "Switch to Candy Light Mode" : "Switch to Candy Dark Mode"}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    isDark
                      ? "bg-slate-900 border-rose-500/30 text-rose-300 hover:bg-slate-800 hover:border-rose-400"
                      : "bg-pink-50 border-pink-200 text-rose-700 hover:bg-pink-100"
                  }`}
                >
                  {isDark ? (
                    <>
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      <span className="hidden sm:inline font-mono text-[11px]">Candy Light</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-3.5 h-3.5 text-rose-500" />
                      <span className="hidden sm:inline font-mono text-[11px]">Candy Dark</span>
                    </>
                  )}
                </button>

                {/* User Profile: Dr. Elena Vance */}
                <div
                  className={`flex items-center gap-2.5 pl-3 border-l ${
                    isDark ? "border-slate-800" : "border-pink-200"
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-pink-400 p-0.5 shrink-0 shadow-sm">
                    <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center font-bold text-xs text-rose-500 font-mono">
                      EV
                    </div>
                  </div>

                  <div className="text-left hidden md:block">
                    <div
                      className={`text-xs font-bold leading-tight ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      Dr. Elena Vance
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                      Senior Cognitive Reviewer
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main View Area */}
          <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex-1">
            {activeTab === "home" && (
              <HomeDashboard
                sessions={sessions}
                onSelectSession={handleSelectSession}
                onNavigateTab={setActiveTab}
                theme={theme}
                onToggleTheme={handleToggleTheme}
              />
            )}

            {activeTab === "new_analysis" && (
              <NewAnalysisView onSessionCreated={handleSessionCreated} />
            )}

            {activeTab === "live_mode" && <LiveAnalysisView />}

            {activeTab === "smart_glasses" && <SmartGlassesView />}

            {activeTab === "results" && (
              <ResultsDetailView
                session={selectedSession}
                onOpenReviewModal={() => setActiveTab("reports")}
              />
            )}

            {activeTab === "cue_breakdown" && <CueBreakdownView />}

            {activeTab === "reports" && (
              <ReportsReviewerView
                sessions={sessions}
                onSignOffSession={handleSignOffSession}
              />
            )}

            {activeTab === "profit_model" && <ProfitModelView />}

            {activeTab === "calibration" && <EvaluationCalibrationView />}

            {activeTab === "model_center" && <ModelCenterView />}

            {activeTab === "governance" && <DatasetGovernanceView />}

            {activeTab === "settings" && <SettingsComplianceView />}
          </main>
        </div>
      </div>
    </div>
  );
}
