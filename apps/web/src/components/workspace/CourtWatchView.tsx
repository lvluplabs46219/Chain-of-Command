"use client";

import React, { useState } from "react";
import {
  Eye,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Shield,
  MapPin,
  Clock,
  Volume2,
} from "lucide-react";
import { Matter } from "@/lib/workspace-data";

interface CourtWatchViewProps {
  matter: Matter;
}

export function CourtWatchView({ matter }: CourtWatchViewProps) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const CHECKLIST = [
    {
      id: "chk-1",
      title: "Confirm Hearing Location & Division",
      desc: `${matter.court} · Hon. ${matter.judge}. Arrive at least 30 minutes before 9:00 AM calendar call.`,
      category: "Logistics",
    },
    {
      id: "chk-2",
      title: "Courtroom Attire & Appearance",
      desc: "Wear clean, professional business-casual clothing (collared shirt, slacks). No hats, sunglasses, or graphic tees allowed past security.",
      category: "Etiquette",
    },
    {
      id: "chk-3",
      title: "Security & Electronics Checkpoint",
      desc: "Turn off or silent all cell phones before passing metal detector. Recording audio or video inside Indiana courtrooms is strictly prohibited by judicial conduct rules.",
      category: "Security",
    },
    {
      id: "chk-4",
      title: "Addressing the Bench with Due Respect",
      desc: "Always stand when addressing the bench. Address the judge as 'Your Honor'. Never interrupt the prosecutor or the judge while speaking.",
      category: "Etiquette",
    },
    {
      id: "chk-5",
      title: "Paper Documents & Pen in Folder",
      desc: "Bring 3 printed physical copies of your Motion to Suppress, Discovery Receipts, and Exhibit BWC log (one for Judge, one for State, one for yourself).",
      category: "Preparation",
    },
    {
      id: "chk-6",
      title: "Language Interpreter / ADA Accommodation Request",
      desc: "If you need an interpreter or disability accommodation, the clerk must be notified at least 5 business days in advance.",
      category: "Accessibility",
    },
  ];

  const ROLES = [
    {
      role: "The Judge (Hon. Angela Chambers)",
      desc: "The neutral arbiter of law and procedure. The judge decides what evidence is admissible and enforces courtroom rules.",
    },
    {
      role: "The Prosecutor (Dep. Pros. R. Torres)",
      desc: "Represents the State of Indiana. The prosecutor bears the burden of proving each statutory element beyond a reasonable doubt.",
    },
    {
      role: "The Court Clerk",
      desc: "Maintains the official record of proceedings, handles evidence marking, administers oaths, and enters minutes into the docket.",
    },
    {
      role: "The Bailiff / Sheriff Deputy",
      desc: "Maintains physical order and security in the courtroom. Follow their instructions regarding where to sit and when to approach.",
    },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="pb-4 border-b border-[#272830]">
        <span className="text-xs font-mono uppercase text-[#D4AF37] font-semibold">
          Courtroom Readiness & Logistics
        </span>
        <h1 className="text-2xl font-bold text-white mt-1">Court Watch & Anxiety Reduction</h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Prepare for your hearing with procedural clarity, protocol checklists, and courtroom etiquette.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Logistics Checklist */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
            <span>Hearing Day Logistics Checklist</span>
          </h2>

          <div className="space-y-3">
            {CHECKLIST.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  checkedItems[item.id]
                    ? "bg-[#13171F] border-emerald-800/40 opacity-80"
                    : "bg-[#14151C] border-[#262835] hover:border-[#D4AF37]/30"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md border mt-0.5 flex items-center justify-center shrink-0 ${
                    checkedItems[item.id]
                      ? "bg-emerald-600 border-emerald-500 text-white"
                      : "border-neutral-600 bg-neutral-900"
                  }`}
                >
                  {checkedItems[item.id] && <CheckCircle2 className="w-4 h-4" />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">{item.title}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Courtroom Roles Guide */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#D4AF37]" />
            <span>Understanding Courtroom Roles</span>
          </h2>

          <div className="space-y-3">
            {ROLES.map((r, i) => (
              <div
                key={i}
                className="bg-[#14151C] border border-[#262835] rounded-xl p-4 space-y-1.5"
              >
                <h4 className="font-bold text-white text-xs text-[#D4AF37]">{r.role}</h4>
                <p className="text-xs text-neutral-300 leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-[#181923] border border-[#282A37] rounded-xl p-4 text-xs text-neutral-300 space-y-2">
            <div className="font-bold text-white flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-[#D4AF37]" />
              <span>Right to Standby Counsel:</span>
            </div>
            <p className="leading-relaxed text-[11px] text-neutral-400">
              Under Faretta v. California, self-represented litigants may request the appointment of standby counsel to
              assist with procedural mechanics during hearings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
