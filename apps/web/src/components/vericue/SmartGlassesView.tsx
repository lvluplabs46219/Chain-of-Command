"use client";

import React, { useState } from "react";
import {
  Glasses,
  Battery,
  Wifi,
  ShieldCheck,
  AlertTriangle,
  Radio,
  Eye,
  Sliders,
  Bell,
  Lock,
  Volume2,
  CheckCircle2,
  Cpu,
} from "lucide-react";
import { SCORE_BANDS, getBandForScore, DEFAULT_GLASSES_DEVICE } from "@/lib/vericue-data";
import { SmartGlassesDevice } from "@/lib/vericue-types";
import { MANDATORY_GLASSES_DISCLOSURE } from "@/lib/sanitizer";

export function SmartGlassesView() {
  const [device, setDevice] = useState<SmartGlassesDevice>(DEFAULT_GLASSES_DEVICE);
  const [hapticTriggered, setHapticTriggered] = useState(false);
  const [hudViewMode, setHudViewMode] = useState<"optical_visor" | "phone_companion">("optical_visor");

  // Current active statement in the HUD
  const [currentScore, setCurrentScore] = useState<number>(68);
  const [isIndeterminate, setIsIndeterminate] = useState<boolean>(false);
  const [currentStatement, setCurrentStatement] = useState<string>(
    "Statement: 'I was home all night after 7:30 PM.'"
  );

  const activeBand = getBandForScore(currentScore);

  const handleTriggerHaptic = () => {
    setHapticTriggered(true);
    setTimeout(() => setHapticTriggered(false), 1200);
  };

  const handleSimulateLow = () => {
    setCurrentScore(22);
    setIsIndeterminate(false);
    setCurrentStatement("Statement: 'I signed the warehouse visitor ledger at 5:45 PM.'");
  };

  const handleSimulateElevated = () => {
    setCurrentScore(74);
    setIsIndeterminate(false);
    setCurrentStatement("Statement: 'Nobody turned the main shutoff valve off prior to the breach.'");
    handleTriggerHaptic();
  };

  const handleSimulateIndeterminate = () => {
    setCurrentScore(48);
    setIsIndeterminate(true);
    setCurrentStatement("Statement: 'The records were kept in the truck drawer.'");
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 text-[#E1E2E5]">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono tracking-wider uppercase text-indigo-400 font-semibold px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
            Wearable Companion HUD (Blueprint §5 Page 11 & 12)
          </span>
          <span className="text-xs text-neutral-400">Minimalist Non-Disruptive Overlay</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
          Smart Glasses HUD & Device Integration
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Real-time wearable telemetry. Minimal floating optical overlay shows probability bands ONLY after complete statements. Zero "LIAR" labels.
        </p>
      </div>

      {/* Mandatory Regulatory Warning */}
      <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200/90 leading-relaxed">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <span>
          <strong>Mandatory Smart-Glasses Disclosure (§9):</strong> {MANDATORY_GLASSES_DISCLOSURE}
        </span>
      </div>

      {/* Two Column Layout: Device Controls vs Visor Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Device Pairing & Privacy Settings (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#12141D] border border-[#232636] rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-white border-b border-[#202330] pb-2 flex items-center justify-between">
              <span>Hardware Pairing Status</span>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Connected BLE 5.3
              </span>
            </h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#161924] border border-[#262A3C]">
                <div className="flex items-center gap-2.5">
                  <Glasses className="w-4 h-4 text-indigo-400" />
                  <div>
                    <div className="text-xs font-semibold text-white">{device.modelName}</div>
                    <div className="text-[10px] text-neutral-400 font-mono">ID: {device.id}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <Battery className="w-4 h-4 text-emerald-400" />
                  <span>{device.batteryPercent}%</span>
                </div>
              </div>

              {/* Privacy Mode Switch */}
              <div className="p-3 rounded-xl bg-[#161924] border border-[#262A3C] flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-white flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Local Privacy Mode</span>
                  </div>
                  <div className="text-[10px] text-neutral-400">
                    Process cues strictly on-device; no cloud streaming.
                  </div>
                </div>
                <button
                  onClick={() => setDevice((p) => ({ ...p, privacyModeEnabled: !p.privacyModeEnabled }))}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    device.privacyModeEnabled
                      ? "bg-amber-500 text-neutral-950 font-bold"
                      : "bg-[#222638] text-neutral-300"
                  }`}
                >
                  {device.privacyModeEnabled ? "Active" : "Disabled"}
                </button>
              </div>

              {/* Haptic Alert Toggle */}
              <div className="p-3 rounded-xl bg-[#161924] border border-[#262A3C] flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-white flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Temple Haptic Pulse</span>
                  </div>
                  <div className="text-[10px] text-neutral-400">
                    Vibrates on Elevated or High risk cue detection.
                  </div>
                </div>
                <button
                  onClick={handleTriggerHaptic}
                  className="px-2.5 py-1 rounded-lg bg-[#222638] text-neutral-200 text-xs hover:bg-[#2b3046] transition-colors cursor-pointer"
                >
                  Test Haptic
                </button>
              </div>
            </div>

            {/* Test Stimulus Buttons */}
            <div className="pt-2 border-t border-[#202330] space-y-2">
              <span className="text-[11px] font-mono text-neutral-400 block">
                Simulate Statement Transitions:
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={handleSimulateLow}
                  className="px-2 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-medium hover:bg-emerald-500/20 cursor-pointer"
                >
                  Low Risk (22%)
                </button>
                <button
                  onClick={handleSimulateIndeterminate}
                  className="px-2 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-medium hover:bg-amber-500/20 cursor-pointer"
                >
                  Indeterminate
                </button>
                <button
                  onClick={handleSimulateElevated}
                  className="px-2 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[11px] font-medium hover:bg-orange-500/20 cursor-pointer"
                >
                  Elevated (74%)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visor HUD Optical Simulation (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-neutral-400">
              Optical Display Simulation (Wearer Field of View)
            </span>
            <div className="flex rounded-lg bg-[#141722] p-0.5 border border-[#242838]">
              <button
                onClick={() => setHudViewMode("optical_visor")}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  hudViewMode === "optical_visor"
                    ? "bg-[#22273A] text-white"
                    : "text-neutral-400"
                }`}
              >
                Optical Visor
              </button>
              <button
                onClick={() => setHudViewMode("phone_companion")}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  hudViewMode === "phone_companion"
                    ? "bg-[#22273A] text-white"
                    : "text-neutral-400"
                }`}
              >
                Phone Companion
              </button>
            </div>
          </div>

          {/* Visor Screen Mockup */}
          <div
            className={`relative rounded-2xl border transition-all duration-300 overflow-hidden shadow-2xl flex flex-col justify-between p-6 ${
              hapticTriggered
                ? "border-amber-400 ring-2 ring-amber-400/40"
                : "border-[#2D334A]"
            } ${
              hudViewMode === "optical_visor"
                ? "bg-gradient-to-b from-[#090B10]/95 via-[#0D1017]/90 to-[#090B10]/95 min-h-[380px]"
                : "bg-[#141722] min-h-[380px]"
            }`}
          >
            {/* Background Simulated Grid Line (AR illusion) */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e2436_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />

            {/* Top HUD Bar: Recording LED + Battery/Ping */}
            <div className="relative z-10 flex items-center justify-between font-mono text-[11px]">
              {/* Mandatory Visible Recording LED (§10) */}
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-rose-950/40 border border-rose-500/40 text-rose-300">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span className="text-[10px] font-bold uppercase tracking-wider">REC · CONSENT ACTIVE</span>
              </div>

              {/* Status Pings */}
              <div className="flex items-center gap-3 text-neutral-400">
                <span className="flex items-center gap-1 text-[10px]">
                  <Wifi className="w-3 h-3 text-emerald-400" />
                  32ms
                </span>
                <span className="flex items-center gap-1 text-[10px]">
                  <Battery className="w-3.5 h-3.5 text-neutral-300" />
                  84%
                </span>
              </div>
            </div>

            {/* Center Area: Subject Crosshair Indicator */}
            <div className="relative z-10 text-center space-y-1 my-auto">
              <div className="w-16 h-16 border border-dashed border-neutral-600/40 rounded-full mx-auto flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-amber-400/50" />
              </div>
              <p className="text-[11px] font-mono text-neutral-400">
                Target: Arthur Vance (Calibrated 154 WPM Baseline)
              </p>
              <p className="text-xs text-neutral-200 italic max-w-md mx-auto">
                {currentStatement}
              </p>
            </div>

            {/* Bottom Floating Minimal Pill (Zero "LIAR" Labels!) */}
            <div className="relative z-10 flex justify-center">
              {isIndeterminate ? (
                <div className="px-4 py-2 rounded-xl bg-amber-950/80 border border-amber-500/40 backdrop-blur-md text-amber-300 text-xs font-mono flex items-center gap-2 shadow-xl">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>INDETERMINATE — LOW AUDIO SNR (CONF: 0.42)</span>
                </div>
              ) : (
                <div
                  className={`px-4 py-2.5 rounded-xl border backdrop-blur-md flex items-center gap-3 shadow-xl transition-all ${
                    currentScore <= 30
                      ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-300"
                      : currentScore <= 60
                      ? "bg-amber-950/80 border-amber-500/40 text-amber-300"
                      : "bg-orange-950/80 border-orange-500/40 text-orange-300"
                  }`}
                >
                  <div className="font-mono text-sm font-bold">
                    {currentScore}%
                  </div>
                  <div className="text-xs font-semibold">
                    {activeBand.label}
                  </div>
                  <div className="text-[10px] font-mono opacity-80 border-l border-current/30 pl-2">
                    Conf: 84% · p95: 380ms
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
