"use client";

import React, { useState } from "react";
import {
  UserCheck,
  Search,
  Filter,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Info,
  Scale,
} from "lucide-react";
import { AttorneyListing, INITIAL_ATTORNEYS } from "@/lib/workspace-data";

export function DirectoryView() {
  const [search, setSearch] = useState("");
  const [filterArea, setFilterArea] = useState("All");

  const areas = ["All", "Criminal Defense", "Constitutional Law", "Tenant Rights", "Public Defense"];

  const filteredAttorneys = INITIAL_ATTORNEYS.filter((atty) => {
    const matchesSearch =
      atty.fullName.toLowerCase().includes(search.toLowerCase()) ||
      atty.firmName.toLowerCase().includes(search.toLowerCase()) ||
      atty.officeCity.toLowerCase().includes(search.toLowerCase());

    const matchesArea =
      filterArea === "All" || atty.practiceAreas.some((a) => a.includes(filterArea));

    return matchesSearch && matchesArea;
  });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="pb-4 border-b border-[#272830]">
        <span className="text-xs font-mono uppercase text-[#D4AF37] font-semibold">
          Independent Counsel Directory
        </span>
        <h1 className="text-2xl font-bold text-white mt-1">Neutral Attorney Directory</h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Chain of Command does not rank, recommend, or endorse individual attorneys. You choose your counsel.
        </p>
      </div>

      {/* Mandatory Directory Disclaimer Banner */}
      <div className="bg-[#181923] border border-[#2B2D3D] rounded-xl p-4 text-xs text-neutral-300 flex items-start gap-3">
        <Info className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-white">Neutral Directory Policy: </strong>
          Listings are non-promotional and organized strictly by verified state bar admissions and practice focus.
          Paid advertising cannot alter search placement or AI case analysis.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by attorney name, firm, or city (e.g. Indianapolis, Carmel)..."
            className="w-full bg-[#14151C] border border-[#272938] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#D4AF37]"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
          {areas.map((area) => (
            <button
              key={area}
              onClick={() => setFilterArea(area)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                filterArea === area
                  ? "bg-[#D4AF37] text-neutral-950 font-bold"
                  : "bg-[#161720] border border-[#272935] text-neutral-300 hover:bg-[#1C1E27]"
              }`}
            >
              {area}
            </button>
          ))}
        </div>
      </div>

      {/* Attorney Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAttorneys.map((atty) => (
          <div
            key={atty.id}
            className="bg-[#14151C] border border-[#262835] hover:border-[#D4AF37]/40 rounded-xl p-5 space-y-4 transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-white text-base">{atty.fullName}</h3>
                <p className="text-xs text-neutral-400 mt-0.5">{atty.firmName}</p>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  atty.listingType === "VERIFIED_PUBLIC_DATA"
                    ? "bg-emerald-950/40 text-emerald-300 border border-emerald-800/40"
                    : "bg-sky-950/40 text-sky-300 border border-sky-800/40"
                }`}
              >
                {atty.listingType === "VERIFIED_PUBLIC_DATA" ? "Verified Bar Record" : "Attorney-Provided"}
              </span>
            </div>

            <div className="text-xs text-neutral-300 space-y-1">
              <div className="flex items-center gap-1.5 text-neutral-400">
                <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                <span>{atty.officeCity} · {atty.jurisdiction}</span>
              </div>
              <div className="text-neutral-400 text-[11px]">
                Admitted: {atty.admittedYear} · Bar ID: {atty.barNumber}
              </div>
            </div>

            {/* Practice Areas */}
            <div className="flex flex-wrap gap-1.5">
              {atty.practiceAreas.map((pa, idx) => (
                <span
                  key={idx}
                  className="text-[10px] px-2 py-0.5 rounded bg-[#1B1D28] text-neutral-300 border border-[#2B2D3C]"
                >
                  {pa}
                </span>
              ))}
              {atty.slidingScaleFee && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/30 text-emerald-300 border border-emerald-800/30">
                  Sliding-Scale Available
                </span>
              )}
            </div>

            {/* Contact details */}
            <div className="pt-3 border-t border-[#20222E] flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-3 text-neutral-400">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#D4AF37]" />
                  {atty.phone}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-[#D4AF37]" />
                  {atty.contactEmail}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
