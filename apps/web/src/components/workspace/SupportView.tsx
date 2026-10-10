"use client";

import React from "react";
import {
  PhoneCall,
  ShieldAlert,
  LifeBuoy,
  MapPinned,
  BookOpen,
  CalendarCheck2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { SectionHeader, StatusBadge } from "./primitives";

const HOTLINES = [
  {
    name: "National Suicide & Crisis Lifeline",
    contact: "Call or text 988",
    note: "24/7 · free · confidential",
  },
  {
    name: "National Domestic Violence Hotline",
    contact: "Call 1-800-799-7233 · text START to 88788",
    note: "24/7 · free · confidential",
  },
  {
    name: "Emergency services",
    contact: "Call 911",
    note: "Immediate danger to life or safety",
  },
];

const SELF_HELP = [
  {
    icon: MapPinned,
    title: "Court self-help centers",
    desc: "Most courthouses operate a free self-help center where staff explain procedures and forms. Ask the clerk of court for the center serving your courthouse.",
  },
  {
    icon: BookOpen,
    title: "Law Library",
    desc: "Statutes, court rules, and precedent for your filings, with citations you can verify yourself.",
    href: "/library",
  },
  {
    icon: LifeBuoy,
    title: "Counsel Directory",
    desc: "Neutral, non-promoted pro bono, legal aid, and public defender contacts — no ranking or AI recommendation.",
    href: "/directory",
  },
  {
    icon: CalendarCheck2,
    title: "Deadlines & court rules",
    desc: "Deterministic rule math for statutory cutoffs and filing windows — never model guesses.",
    href: "/tasks",
  },
];

function HotlineCard({
  name,
  contact,
  note,
}: {
  name: string;
  contact: string;
  note: string;
}) {
  return (
    <div className="bg-[#141519] border border-[#272830] hover:border-teal-700/50 rounded-xl p-5 transition-colors">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-teal-950/50 border border-teal-800/40 flex items-center justify-center shrink-0">
          <PhoneCall className="w-4 h-4 text-teal-300" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-white">{name}</h3>
          <p className="text-sm font-medium text-teal-300 mt-1">{contact}</p>
          <p className="text-xs text-neutral-400 mt-0.5">{note}</p>
        </div>
      </div>
    </div>
  );
}

export function SupportView() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <SectionHeader
        eyebrow="Support & Crisis Resources"
        title="Help is available — you are not alone in this"
        description="Crisis hotlines, court self-help centers, and legal aid options for self-represented litigants."
        actions={<StatusBadge variant="info">Node 12</StatusBadge>}
      />

      {/* Crisis hotlines — calm, non-alarming presentation */}
      <section aria-label="Crisis hotlines" className="space-y-3">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-teal-400" aria-hidden="true" />
          Crisis & safety hotlines
        </h2>
        <p className="text-xs text-neutral-400 max-w-2xl leading-relaxed">
          If you or someone you know is in immediate danger, call 911. For emotional crisis, suicidal
          thoughts, or domestic violence, the confidential hotlines below are free and available around
          the clock.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {HOTLINES.map((h) => (
            <HotlineCard key={h.name} {...h} />
          ))}
        </div>
      </section>

      {/* Self-help guidance */}
      <section aria-label="Self-help guidance" className="space-y-3">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <MapPinned className="w-4 h-4 text-[#D4AF37]" aria-hidden="true" />
          Free & low-cost legal help
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SELF_HELP.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                className="bg-[#141519] border border-[#272830] hover:border-[#D4AF37]/30 rounded-xl p-4 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-[#D4AF37]" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium text-white">{s.title}</h3>
                    <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{s.desc}</p>
                    {s.href && (
                      <Link
                        href={s.href}
                        className="inline-flex items-center gap-1 text-xs font-medium text-[#D4AF37] hover:text-[#E6C65A] mt-2 transition-colors"
                      >
                        Open module
                        <ExternalLink className="w-3 h-3" aria-hidden="true" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Plain-words reassurance */}
      <div className="bg-[#101114] border border-[#23242B] rounded-lg p-4 flex items-start gap-3 text-xs text-neutral-400 leading-relaxed">
        <LifeBuoy className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" aria-hidden="true" />
        <span>
          Representing yourself is hard, and asking for help is a normal part of it. Court staff cannot
          give legal advice, but they can explain procedures — and the resources above can connect you
          with people who can advise you on your specific situation.
        </span>
      </div>
    </div>
  );
}
