"use client";

import React, { useState } from "react";
import { AttorneyListing, INDEPENDENT_ATTORNEY_DIRECTORY } from "@/lib/workspace-data";
import {
  UserCheck,
  Search,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { SectionHeader, StatusBadge } from "./primitives";

export function DirectoryView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [stateFilter, setStateFilter] = useState("All");

  const filteredAttorneys = INDEPENDENT_ATTORNEY_DIRECTORY.filter((att) => {
    const matchesSearch =
      att.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      att.firm.toLowerCase().includes(searchQuery.toLowerCase()) ||
      att.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      att.practiceAreas.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = typeFilter === "All" || att.representationType === typeFilter;
    const matchesState = stateFilter === "All" || att.state === stateFilter;

    return matchesSearch && matchesType && matchesState;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <SectionHeader
        eyebrow="Independent Public Resource"
        title="Independent Attorney & Legal Aid Directory"
        description="Find licensed criminal defense counsel, pro bono legal aid societies, and public defender contact registries."
      />

      <div className="p-4 bg-[#181612] border border-amber-900/40 rounded-xl text-xs text-amber-200/90 leading-relaxed flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold block text-amber-300 mb-0.5">Neutral Directory Policy — No AI Recommendations</span>
          Chain of Command does NOT endorse, rate, recommend, or rank individual attorneys. This directory is provided purely as an independent public information index. No attorney has paid for favorable positioning or recommendation. You are solely responsible for interviewing and selecting your own counsel.
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, firm, practice, or city..."
            className="w-full bg-[#141519] border border-[#272830] rounded-lg pl-9 pr-3.5 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="bg-[#141519] border border-[#272830] text-xs text-neutral-300 rounded-lg px-2.5 py-2 focus:outline-none focus:border-[#D4AF37]"
          >
            <option value="All">All States</option>
            <option value="Indiana">Indiana</option>
            <option value="California">California</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[#141519] border border-[#272830] text-xs text-neutral-300 rounded-lg px-2.5 py-2 focus:outline-none focus:border-[#D4AF37]"
          >
            <option value="All">All Representation Types</option>
            <option value="Pro Bono / Legal Aid">Pro Bono / Legal Aid</option>
            <option value="Sliding Scale">Sliding Scale</option>
            <option value="Private Retainer">Private Retainer</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAttorneys.map((att) => (
          <div
            key={att.id}
            className="bg-[#141519] border border-[#272830] hover:border-[#D4AF37]/40 rounded-xl p-5 flex flex-col justify-between transition-all"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-mono text-[#D4AF37] uppercase">{att.barNumber}</span>
                <StatusBadge
                  variant={att.representationType === "Pro Bono / Legal Aid" ? "success" : "info"}
                >
                  {att.representationType}
                </StatusBadge>
              </div>

              <h3 className="font-serif font-bold text-white text-base mb-0.5">{att.name}</h3>
              <p className="text-xs text-neutral-400 font-medium mb-3">{att.firm}</p>

              <div className="space-y-1.5 text-xs text-neutral-300 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{att.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="font-mono">{att.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="font-mono text-neutral-400">{att.email}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {att.practiceAreas.map((area, i) => (
                  <span
                    key={i}
                    className="text-[10px] bg-neutral-900 border border-neutral-800 text-neutral-300 px-2 py-0.5 rounded"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#23242B] flex items-center justify-between text-[11px] text-neutral-500 font-mono">
              <StatusBadge variant="success">{att.verifiedSource}</StatusBadge>
              <a
                href={`tel:${att.phone}`}
                className="text-[#D4AF37] hover:underline flex items-center gap-1 font-sans font-medium"
              >
                <span>Contact Office</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
