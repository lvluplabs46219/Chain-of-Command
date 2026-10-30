"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles, Scale, ArrowLeft } from "lucide-react";
import { ALL_AVAILABLE_AI_AGENTS, type AIAgent } from "@/lib/workspace-data";

/**
 * 3D fluid rolodex carousel of legal AI agents / skills.
 * Pure CSS 3D transforms — no Three.js dependency.
 * Educational / pro se assist only — not legal advice.
 */
export function AgentRolodex3D({
  agents,
  variant = "page",
  onClose,
}: {
  agents?: AIAgent[];
  variant?: "page" | "overlay";
  onClose?: () => void;
}) {
  const roster = agents?.length ? agents : ALL_AVAILABLE_AI_AGENTS;
  const [index, setIndex] = useState(0);
  const n = roster.length;
  const active = roster[index];

  const theta = n > 0 ? 360 / n : 0;
  const radius = Math.max(220, Math.min(320, 40 + n * 18));

  const go = (dir: number) => setIndex((i) => (i + dir + n) % n);

  const cards = useMemo(() => roster, [roster]);

  return (
    <div
      className={
        variant === "overlay"
          ? "h-full max-h-[min(92vh,900px)] bg-[#0C0D10] text-[#E1E2E5] flex flex-col rounded-2xl overflow-hidden border border-[#2A2B35] shadow-2xl"
          : "min-h-screen bg-[#0C0D10] text-[#E1E2E5] flex flex-col"
      }
    >
      <header className="flex items-center justify-between gap-3 border-b border-[#2A2B35] px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href="/directory"
            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-[#D4AF37]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Directory
          </Link>
          <span className="text-neutral-600">|</span>
          <h1 className="text-sm font-bold tracking-wide text-white flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#D4AF37]" />
            AI Lawyer Rolodex
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-[10px] font-mono text-neutral-500">NOT LEGAL ADVICE · AI WORKERS & SKILLS</p>
          {variant === "overlay" && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[#2A2B35] px-3 py-1 text-[11px] font-semibold text-neutral-300 hover:border-[#D4AF37] hover:text-[#D4AF37]"
            >
              Close
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 p-4 md:p-8 max-w-6xl mx-auto w-full">
        {/* Stage */}
        <div className="flex-1 flex flex-col items-center justify-center min-h-[380px]">
          <div
            className="relative w-full max-w-xl h-[340px]"
            style={{ perspective: "1100px" }}
          >
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                transformStyle: "preserve-3d",
                transform: `rotateY(${-index * theta}deg)`,
                transition: "transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              {cards.map((agent, i) => {
                const rot = i * theta;
                const isActive = i === index;
                return (
                  <button
                    key={agent.id}
                    type="button"
                    onClick={() => setIndex(i)}
                    className="absolute w-[200px] md:w-[220px] h-[280px] rounded-2xl border text-left p-4 shadow-2xl outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
                    style={{
                      transform: `rotateY(${rot}deg) translateZ(${radius}px)`,
                      background: isActive
                        ? "linear-gradient(160deg, #2a1535 0%, #141018 100%)"
                        : "#141519",
                      borderColor: isActive ? "#D4AF37" : "#2A2B35",
                      opacity: isActive ? 1 : 0.55,
                      boxShadow: isActive
                        ? "0 20px 50px rgba(212,175,55,0.18)"
                        : "0 10px 30px rgba(0,0,0,0.4)",
                    }}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl border flex items-center justify-center text-sm font-bold mb-3 ${agent.avatarBg}`}
                    >
                      {agent.name
                        .split(" ")
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-[#D4AF37] mb-1">
                      {agent.category || agent.role}
                    </div>
                    <div className="text-sm font-bold text-white leading-snug mb-1">{agent.name}</div>
                    <div className="text-[11px] text-neutral-400 line-clamp-3">{agent.specialty}</div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {agent.capabilities.slice(0, 2).map((cap) => (
                        <span
                          key={cap}
                          className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-neutral-300 border border-white/10"
                        >
                          {cap}
                        </span>
                      ))}
                    </div>
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[10px]">
                      <span
                        className={
                          agent.status === "Active"
                            ? "text-emerald-400"
                            : "text-neutral-500"
                        }
                      >
                        ● {agent.status}
                      </span>
                      <span className="text-neutral-600">{i + 1}/{n}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <button
              type="button"
              onClick={() => go(-1)}
              className="p-2 rounded-full border border-[#2A2B35] hover:border-[#D4AF37] text-neutral-300"
              aria-label="Previous agent"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-xs font-mono text-neutral-500">
              {index + 1} / {n}
            </span>
            <button
              type="button"
              onClick={() => go(1)}
              className="p-2 rounded-full border border-[#2A2B35] hover:border-[#D4AF37] text-neutral-300"
              aria-label="Next agent"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Detail panel */}
        {active && (
          <aside className="lg:w-[360px] shrink-0 rounded-2xl border border-[#2A2B35] bg-[#141519] p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div
                className={`w-14 h-14 rounded-xl border flex items-center justify-center text-base font-bold ${active.avatarBg}`}
              >
                {active.name
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{active.name}</h2>
                <p className="text-xs text-[#D4AF37]">{active.role}</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  {active.experienceLevel || active.category}
                </p>
              </div>
            </div>
            <p className="text-sm text-neutral-300 leading-relaxed">{active.specialty}</p>

            <div>
              <h3 className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Skills
              </h3>
              <ul className="space-y-2">
                {(active.detailedSkills || [])
                  .slice(0, 5)
                  .map((s) => (
                    <li
                      key={s.name}
                      className="rounded-lg border border-[#2A2B35] bg-[#101114] px-3 py-2"
                    >
                      <div className="text-xs font-semibold text-white">{s.name}</div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">{s.summary}</div>
                    </li>
                  ))}
                {!active.detailedSkills?.length &&
                  active.capabilities.map((c) => (
                    <li key={c} className="text-xs text-neutral-300">
                      • {c}
                    </li>
                  ))}
              </ul>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Link
                href="/chambers"
                className="w-full text-center py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#c49f27] text-neutral-950 text-sm font-bold"
              >
                Open in AI Lawyer
              </Link>
              <Link
                href="/directory"
                className="w-full text-center py-2.5 rounded-xl border border-[#2A2B35] text-neutral-300 hover:border-[#D4AF37]/50 text-sm font-semibold"
              >
                Full Agent Directory
              </Link>
            </div>
            <p className="text-[10px] text-neutral-600 leading-relaxed">
              AI workers assist with research and organization. They do not create an
              attorney-client relationship and are not a substitute for licensed counsel.
            </p>
          </aside>
        )}
      </div>
    </div>
  );
}
