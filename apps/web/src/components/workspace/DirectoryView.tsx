"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  Bot,
  UserCheck,
  Search,
  Filter,
  ShieldCheck,
  CheckCircle2,
  Plus,
  Trash2,
  MessageSquare,
  Sparkles,
  Info,
  Scale,
  ExternalLink,
  ChevronRight,
  BookOpen,
  Award,
  Zap,
  Cpu,
  MapPin,
  X,
  FileText,
  AlertCircle,
} from "lucide-react";
import {
  AIAgent,
  AIAgentSkill,
  ALL_AVAILABLE_AI_AGENTS,
  SpecialistAgent,
  AttorneyListing,
  INITIAL_ATTORNEYS,
  Matter,
} from "@/lib/workspace-data";
import { WorkspaceTab } from "./WorkspaceNavigation";

interface DirectoryViewProps {
  matter?: Matter;
  agents?: SpecialistAgent[];
  onAddAgent?: (agent: SpecialistAgent) => void;
  onRemoveAgent?: (agentId: string) => void;
  onNavigateTab?: (tab: WorkspaceTab) => void;
}

export function DirectoryView({
  matter,
  agents = [],
  onAddAgent,
  onRemoveAgent,
  onNavigateTab,
}: DirectoryViewProps) {
  // Primary directory mode: "ai_agents" (default) or "human_counsel"
  const [activeDirectoryTab, setActiveDirectoryTab] = useState<"ai_agents" | "human_counsel">("ai_agents");

  // AI Agent filter & search state
  const [agentSearch, setAgentSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filterTeamOnly, setFilterTeamOnly] = useState(false);
  const [inspectedAgent, setInspectedAgent] = useState<AIAgent | null>(null);
  const [hiredToast, setHiredToast] = useState<string | null>(null);

  // Human Attorney filter & search state
  const [attorneySearch, setAttorneySearch] = useState("");
  const [attorneyArea, setAttorneyArea] = useState("All");

  // Determine which agents are currently on the team
  const activeAgentIds = useMemo(() => {
    return new Set(agents.map((a) => a.id));
  }, [agents]);

  // Handle Hiring / Adding an agent to the active team
  const handleHireAgent = (agent: AIAgent) => {
    const specialist: SpecialistAgent = {
      ...agent,
      status: "Active",
      description: agent.specialty,
      disclaimerRequired: true,
      mustCiteMaterialClaims: true,
    };

    if (onAddAgent) {
      onAddAgent(specialist);
    }

    setHiredToast(`🎉 ${agent.name} hired and added to your legal team!`);
    setTimeout(() => setHiredToast(null), 3500);
  };

  // Handle Removing an agent from the active team
  const handleDismissAgent = (agentId: string, agentName: string) => {
    if (agentId === "agent-head") return; // Core anchor cannot be removed
    if (onRemoveAgent) {
      onRemoveAgent(agentId);
    }
    setHiredToast(`Removed ${agentName} from active team.`);
    setTimeout(() => setHiredToast(null), 3000);
  };

  const agentCategories = [
    "All",
    "Case Strategy",
    "Legal Research",
    "Constitutional Rights",
    "Evidence & Forensics",
    "Charges & Statutes",
    "Pleadings & Motions",
    "Trial & Hearing",
    "Family & Custody",
    "Sentencing & Relief",
    "Court Logistics",
  ];

  // Filtered AI Agents
  const filteredAgents = useMemo(() => {
    return ALL_AVAILABLE_AI_AGENTS.filter((agent) => {
      const isOnTeam = activeAgentIds.has(agent.id);
      if (filterTeamOnly && !isOnTeam) return false;

      const matchesCategory =
        selectedCategory === "All" || agent.category === selectedCategory;

      const searchLower = agentSearch.toLowerCase();
      const matchesSearch =
        agentSearch.trim() === "" ||
        agent.name.toLowerCase().includes(searchLower) ||
        agent.role.toLowerCase().includes(searchLower) ||
        agent.specialty.toLowerCase().includes(searchLower) ||
        agent.capabilities.some((c) => c.toLowerCase().includes(searchLower)) ||
        (agent.detailedSkills &&
          agent.detailedSkills.some(
            (s) =>
              s.name.toLowerCase().includes(searchLower) ||
              s.summary.toLowerCase().includes(searchLower)
          ));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, agentSearch, filterTeamOnly, activeAgentIds]);

  // Filtered Human Attorneys (Rule 18/19 compliance)
  const attorneyAreas = ["All", "Criminal Defense", "Constitutional Law", "Tenant Rights", "Public Defense"];
  const filteredAttorneys = useMemo(() => {
    return INITIAL_ATTORNEYS.filter((atty) => {
      const matchesSearch =
        atty.fullName.toLowerCase().includes(attorneySearch.toLowerCase()) ||
        atty.firmName.toLowerCase().includes(attorneySearch.toLowerCase()) ||
        atty.officeCity.toLowerCase().includes(attorneySearch.toLowerCase());

      const matchesArea =
        attorneyArea === "All" || atty.practiceAreas.some((a) => a.includes(attorneyArea));

      return matchesSearch && matchesArea;
    });
  }, [attorneySearch, attorneyArea]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-[#D4AF37]/30 bg-gradient-to-r from-[#2a1535]/80 to-[#141018] px-4 py-3">
        <div>
          <p className="text-sm font-bold text-white">3D AI Lawyer Rolodex</p>
          <p className="text-xs text-neutral-400">Spin through every legal AI worker, skill, and specialist on your team.</p>
        </div>
        <Link
          href="/directory/rolodex"
          className="shrink-0 inline-flex items-center justify-center rounded-full bg-[#D4AF37] px-4 py-2 text-xs font-bold text-neutral-950 hover:bg-[#c49f27]"
        >
          Open 3D Directory
        </Link>
      </div>
      {/* Top Notification Toast */}
      {hiredToast && (
        <div className="fixed top-20 right-6 z-50 bg-gradient-to-r from-[#e040a0] to-[#af0a78] text-white px-5 py-3 rounded-full shadow-2xl font-bold text-xs flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-white" />
          <span>{hiredToast}</span>
        </div>
      )}

      {/* Hero Banner with Candy Palette */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#f0d5e2] shadow-[0_8px_30px_rgba(224,64,160,0.06)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#ffd8e8]/50 via-[#fde7ff]/30 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffd8e8] text-[#8a005e] text-xs font-bold font-mono uppercase tracking-wide">
                <Bot className="w-3.5 h-3.5 text-[#af0a78]" />
                Counsel Directory · AI Legal Workers & Skills
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#efdbff] text-[#5b3188] text-xs font-semibold">
                <Award className="w-3.5 h-3.5 text-[#7c52aa]" />
                {ALL_AVAILABLE_AI_AGENTS.length} Specialized AI Workers Available
              </span>
              <Link
                href="/playground"
                className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-[#e040a0] to-[#af0a78] text-white text-xs font-bold shadow-md hover:scale-[1.02] transition-transform"
                title="The Wire — live AI lawyer and multi-agent swarm playground"
              >
                <span>⚡ The Wire — Swarm Playground</span>
              </Link>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#281330] tracking-tight">
              AI Legal Workers, Skills & Counsel Directory
            </h1>
            <p className="text-xs sm:text-sm text-[#604868] max-w-2xl leading-relaxed">
              Hire specialized AI agents and legal workers with verified skills to join your pro se defense team,
              or search the neutral bar-verified counsel directory. Test live agents on <span className="font-bold text-[#af0a78]">The Wire</span>.
            </p>
          </div>

          {/* Directory Mode Switcher (AI Workers vs Neutral Counsel) */}
          <div className="bg-[#fff7fb] border border-[#f0d5e2] p-1.5 rounded-full flex items-center shrink-0 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveDirectoryTab("ai_agents")}
              className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all ${
                activeDirectoryTab === "ai_agents"
                  ? "bg-gradient-to-r from-[#e040a0] to-[#af0a78] text-white shadow-[0_4px_16px_rgba(224,64,160,0.25)]"
                  : "text-[#604868] hover:text-[#281330]"
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>AI Legal Workers ({ALL_AVAILABLE_AI_AGENTS.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveDirectoryTab("human_counsel")}
              className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all ${
                activeDirectoryTab === "human_counsel"
                  ? "bg-gradient-to-r from-[#e040a0] to-[#af0a78] text-white shadow-[0_4px_16px_rgba(224,64,160,0.25)]"
                  : "text-[#604868] hover:text-[#281330]"
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Counsel Directory</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODE 1: AI LEGAL WORKERS & SKILLS DIRECTORY                     */}
      {/* ============================================================== */}
      {activeDirectoryTab === "ai_agents" && (
        <div className="space-y-6">
          {/* Controls: Search, Category Filters, and Team Filter */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative min-w-[280px] flex-1">
              <Search className="w-4 h-4 text-[#8a707b] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search AI legal workers by skill, specialty, or statute..."
                value={agentSearch}
                onChange={(e) => setAgentSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-full bg-white border border-[#ddbfca] text-xs text-[#281330] placeholder:text-[#8a707b] focus:outline-none focus:ring-2 focus:ring-[#e040a0]/30 focus:border-[#af0a78] shadow-sm"
              />
            </div>

            {/* Quick Filter: My Hired Team Only */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFilterTeamOnly(!filterTeamOnly)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all border flex items-center gap-1.5 ${
                  filterTeamOnly
                    ? "bg-[#ffd8e8] text-[#8a005e] border-[#ffafd5] shadow-sm"
                    : "bg-white text-[#604868] border-[#f0d5e2] hover:bg-[#fff7fb]"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#af0a78]" />
                <span>My Hired Team ({agents.length})</span>
              </button>

              {onNavigateTab && (
                <button
                  type="button"
                  onClick={() => onNavigateTab("chambers")}
                  className="px-4 py-2 rounded-full bg-white text-[#7c52aa] hover:bg-[#efdbff] border border-[#f0d5e2] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#7c52aa]" />
                  <span>Open Chambers Chat</span>
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {agentCategories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-[#e040a0] to-[#af0a78] text-white shadow-[0_4px_14px_rgba(224,64,160,0.22)] scale-[1.02]"
                    : "bg-white text-[#604868] border border-[#f0d5e2] hover:bg-[#fff7fb] hover:text-[#281330]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* AI Legal Worker Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAgents.map((worker) => {
              const isOnTeam = activeAgentIds.has(worker.id);
              const isHeadLead = worker.id === "agent-head";

              return (
                <div
                  key={worker.id}
                  className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all flex flex-col justify-between ${
                    isOnTeam
                      ? "border-[#ffafd5] shadow-[0_6px_24px_rgba(224,64,160,0.12)] ring-1 ring-[#ffd8e8]"
                      : "border-[#f0d5e2] hover:border-[#ddbfca] hover:shadow-md"
                  }`}
                >
                  <div className="space-y-4">
                    {/* Card Top: Badges & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#af0a78] to-[#e040a0] text-white flex items-center justify-center font-bold text-sm shadow-[0_4px_12px_rgba(175,10,120,0.25)] shrink-0">
                          <Bot className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-[#281330] text-base leading-tight">
                            {worker.name}
                          </h3>
                          <span className="text-xs text-[#7c52aa] font-semibold block mt-0.5">
                            {worker.role}
                          </span>
                        </div>
                      </div>

                      {/* Status Pill */}
                      {isOnTeam ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ecfdf5] text-[#059669] text-[10px] font-bold border border-[#a7f3d0]">
                          <CheckCircle2 className="w-3 h-3" />
                          On Team
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#fdf4ff] text-[#a21caf] text-[10px] font-bold border border-[#f5d0fe]">
                          Available
                        </span>
                      )}
                    </div>

                    {/* Specialty & Description */}
                    <p className="text-xs text-[#604868] leading-relaxed">
                      {worker.specialty}
                    </p>

                    {/* Meta info tags (Inference mode + Category + Pricing) */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#ffd8e8] text-[#8a005e] font-bold">
                        {worker.category || "Legal Specialty"}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#efdbff] text-[#5b3188] font-semibold">
                        {worker.model.includes("pro") ? "Deep Review" : "Fast Track"}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#e0f2fe] text-[#006388] font-semibold">
                        {worker.rateLabel || "Pro Se Plan"}
                      </span>
                    </div>

                    {/* Certified AI Skills List */}
                    <div className="space-y-1.5 pt-2 border-t border-[#f8e6ef]">
                      <div className="flex items-center justify-between text-[11px] font-bold text-[#281330]">
                        <span className="flex items-center gap-1 text-[#8a005e]">
                          <Zap className="w-3 h-3 text-[#af0a78]" />
                          Operational AI Skills:
                        </span>
                        <span className="text-[10px] text-[#8a707b] font-mono">
                          {worker.detailedSkills?.length || worker.capabilities.length} skills
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {(worker.detailedSkills || []).slice(0, 3).map((skill, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center text-[10px] bg-[#fff7fb] border border-[#f0d5e2] text-[#3e2846] px-2.5 py-0.5 rounded-full font-medium"
                          >
                            {skill.name}
                          </span>
                        ))}
                        {(worker.detailedSkills?.length || 0) > 3 && (
                          <span className="text-[10px] text-[#af0a78] font-bold px-1.5 py-0.5">
                            +{(worker.detailedSkills?.length || 0) - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom: Action Buttons */}
                  <div className="pt-4 mt-4 border-t border-[#f0d5e2] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setInspectedAgent(worker)}
                      className="px-3 py-1.5 rounded-full bg-[#fff7fb] hover:bg-[#ffd8e8] text-[#8a005e] border border-[#f0d5e2] text-xs font-bold transition-colors"
                    >
                      Inspect Skills
                    </button>

                    <div className="flex items-center gap-1.5">
                      {isOnTeam ? (
                        <>
                          {onNavigateTab && (
                            <button
                              type="button"
                              onClick={() => onNavigateTab("chambers")}
                              className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#e040a0] to-[#af0a78] text-white text-xs font-bold shadow-[0_3px_12px_rgba(224,64,160,0.25)] hover:scale-[1.02] transition-transform flex items-center gap-1"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>Consult</span>
                            </button>
                          )}
                          {!isHeadLead && (
                            <button
                              type="button"
                              onClick={() => handleDismissAgent(worker.id, worker.name)}
                              className="p-1.5 rounded-full bg-[#fff7fb] hover:bg-rose-50 text-neutral-400 hover:text-rose-600 border border-[#f0d5e2] transition-colors"
                              title="Remove from active legal team"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleHireAgent(worker)}
                          className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#e040a0] to-[#af0a78] text-white text-xs font-bold shadow-[0_4px_16px_rgba(224,64,160,0.25)] hover:scale-[1.02] transition-transform flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Hire & Add to Team</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredAgents.length === 0 && (
            <div className="p-12 text-center bg-white border border-[#f0d5e2] rounded-3xl space-y-3">
              <Bot className="w-8 h-8 text-[#af0a78] mx-auto opacity-70" />
              <h3 className="font-bold text-base text-[#281330]">No AI legal workers match this filter</h3>
              <p className="text-xs text-[#604868]">Try selecting "All" categories or clearing your search keywords.</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("All");
                  setAgentSearch("");
                  setFilterTeamOnly(false);
                }}
                className="px-4 py-1.5 rounded-full bg-[#ffd8e8] text-[#8a005e] font-bold text-xs"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* MODE 2: NEUTRAL HUMAN COUNSEL DIRECTORY (Rule 18/19 Mandatory) */}
      {/* ============================================================== */}
      {activeDirectoryTab === "human_counsel" && (
        <div className="space-y-6">
          {/* Directory Notice: Mandatory Disclaimer Banner */}
          <div className="bg-[#fff7fb] border border-[#f0d5e2] rounded-3xl p-5 text-xs text-[#281330] flex items-start gap-3.5 shadow-sm">
            <Info className="w-5 h-5 text-[#af0a78] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#af0a78] font-bold">
                Directory Notice
              </div>
              <h4 className="font-bold text-sm text-[#281330]">
                Neutral Bar Records & Independent Counsel
              </h4>
              <p className="text-[#604868] leading-relaxed">
                Chain of Command does not rank, recommend, score, or endorse individual attorneys.
                Listings are non-promotional and organized strictly by verified state bar admissions and practice focus.
                Paid placements cannot influence case analysis or search positioning. You independently choose your counsel.
              </p>
            </div>
          </div>

          {/* Narrow Your Search: Search & Area Filters */}
          <div className="space-y-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#8a707b] font-bold">
              Narrow Your Search
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-[#8a707b] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={attorneySearch}
                  onChange={(e) => setAttorneySearch(e.target.value)}
                  placeholder="Search attorneys by name, firm, or city (e.g. Indianapolis, Carmel)..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-full bg-white border border-[#ddbfca] text-xs text-[#281330] placeholder:text-[#8a707b] focus:outline-none focus:ring-2 focus:ring-[#e040a0]/30 focus:border-[#af0a78] shadow-sm"
                />
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
                {attorneyAreas.map((area) => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => setAttorneyArea(area)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                      attorneyArea === area
                        ? "bg-gradient-to-r from-[#e040a0] to-[#af0a78] text-white shadow-sm"
                        : "bg-white border border-[#f0d5e2] text-[#604868] hover:bg-[#fff7fb]"
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Counsel Listings Cards Grid */}
          <div className="space-y-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#8a707b] font-bold">
              Counsel Listings
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAttorneys.map((atty) => (
                <div
                  key={atty.id}
                  className="bg-white border border-[#f0d5e2] rounded-3xl p-5 sm:p-6 space-y-4 hover:border-[#ddbfca] hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-extrabold text-[#281330] text-base">{atty.fullName}</h3>
                      <p className="text-xs text-[#604868] mt-0.5">{atty.firmName}</p>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-3 py-1 rounded-full font-bold ${
                        atty.listingType === "VERIFIED_PUBLIC_DATA"
                          ? "bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]"
                          : "bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]"
                      }`}
                    >
                      {atty.listingType === "VERIFIED_PUBLIC_DATA" ? "Bar Verified" : "Featured Listing"}
                    </span>
                  </div>

                  <div className="text-xs text-[#3e2846] space-y-1">
                    <div className="flex items-center gap-1.5 text-[#604868]">
                      <MapPin className="w-3.5 h-3.5 text-[#7c52aa]" />
                      <span>{atty.officeCity} · {atty.jurisdiction}</span>
                    </div>
                    <div className="text-[#8a707b] text-[11px]">
                      Admitted: {atty.admittedYear} · Bar ID: {atty.barNumber}
                    </div>
                  </div>

                  {/* Practice Areas */}
                  <div className="flex flex-wrap gap-1.5">
                    {atty.practiceAreas.map((area, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#fff7fb] border border-[#f0d5e2] text-[#57414a]"
                      >
                        {area}
                      </span>
                    ))}
                  </div>

                  {/* Contact and Pro Bono Details */}
                  <div className="pt-3 border-t border-[#f0d5e2] flex items-center justify-between text-xs">
                    <span className="text-[11px] text-[#604868] font-medium">
                      {atty.publicDefenseEligible ? "Pro Bono & Legal Aid Eligible" : "Private Practice"}
                    </span>
                    <a
                      href={`mailto:${atty.contactEmail}`}
                      className="px-3.5 py-1.5 rounded-full bg-[#ffd8e8] text-[#8a005e] hover:bg-[#ffafd5] text-xs font-bold transition-colors"
                    >
                      Attorney Profile
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: INSPECT AI SKILLS & DIRECTIVES DOSSIER                  */}
      {/* ============================================================== */}
      {inspectedAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white border border-[#f0d5e2] rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setInspectedAgent(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#fff7fb] hover:bg-[#ffd8e8] text-[#8a005e] flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Dossier Header */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#af0a78] to-[#e040a0] text-white flex items-center justify-center font-bold text-lg shadow-lg shrink-0">
                <Bot className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#ffd8e8] text-[#8a005e]">
                    {inspectedAgent.category || "AI Legal Specialist"}
                  </span>
                  <span className="text-[10px] font-mono uppercase font-semibold text-[#7c52aa]">
                    {inspectedAgent.experienceLevel || "Specialist"}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-[#281330]">{inspectedAgent.name}</h3>
                <p className="text-xs text-[#7c52aa] font-semibold">{inspectedAgent.role}</p>
              </div>
            </div>

            {/* Specialty & System Directive */}
            <div className="p-4 rounded-2xl bg-[#fff7fb] border border-[#f0d5e2] space-y-2 text-xs">
              <div className="font-bold text-[#af0a78] uppercase font-mono text-[10px]">
                Operational Directive & Safe Boundaries
              </div>
              <p className="text-[#281330] leading-relaxed">
                {inspectedAgent.systemDirective}
              </p>
            </div>

            {/* Certified AI Skills Matrix */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-sm text-[#281330] flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#af0a78]" />
                Certified Operational AI Skills
              </h4>

              <div className="space-y-2.5">
                {((inspectedAgent.detailedSkills || inspectedAgent.capabilities.map((c): AIAgentSkill => ({ name: c, summary: "Operational execution capability." }))) as AIAgentSkill[]).map(
                  (skill, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-white border border-[#f0d5e2] text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#281330]">{skill.name}</span>
                        {skill.statutoryRef && (
                          <span className="text-[10px] font-mono text-[#7c52aa] bg-[#efdbff] px-2 py-0.5 rounded-full font-semibold">
                            {skill.statutoryRef}
                          </span>
                        )}
                      </div>
                      <p className="text-[#604868] text-[11px] leading-relaxed">{skill.summary}</p>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Sample Action Prompt */}
            {inspectedAgent.samplePrompt && (
              <div className="p-3.5 rounded-2xl bg-[#fdf4ff] border border-[#f5d0fe] text-xs space-y-1">
                <span className="text-[10px] uppercase font-mono font-bold text-[#a21caf]">
                  Example Case Dispatch Query:
                </span>
                <p className="italic text-[#4a044e]">"{inspectedAgent.samplePrompt}"</p>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="pt-2 flex items-center justify-between border-t border-[#f0d5e2]">
              <span className="text-xs text-[#8a707b]">
                {activeAgentIds.has(inspectedAgent.id) ? "Already active on your team" : "Ready for immediate deployment"}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInspectedAgent(null)}
                  className="px-4 py-2 rounded-full bg-[#fff7fb] hover:bg-[#ffd8e8] text-[#8a005e] text-xs font-bold transition-colors"
                >
                  Close
                </button>

                {activeAgentIds.has(inspectedAgent.id) ? (
                  onNavigateTab && (
                    <button
                      type="button"
                      onClick={() => {
                        setInspectedAgent(null);
                        onNavigateTab("chambers");
                      }}
                      className="px-5 py-2 rounded-full bg-gradient-to-r from-[#e040a0] to-[#af0a78] text-white text-xs font-bold shadow-[0_4px_16px_rgba(224,64,160,0.25)] hover:scale-[1.02] transition-transform"
                    >
                      Consult in Chambers
                    </button>
                  )
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      handleHireAgent(inspectedAgent);
                      setInspectedAgent(null);
                    }}
                    className="px-5 py-2 rounded-full bg-gradient-to-r from-[#e040a0] to-[#af0a78] text-white text-xs font-bold shadow-[0_4px_16px_rgba(224,64,160,0.25)] hover:scale-[1.02] transition-transform flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Hire & Add to Team</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
