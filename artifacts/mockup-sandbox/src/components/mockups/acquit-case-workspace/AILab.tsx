import React, { useState } from "react";
import { EvidenceCarousel } from "./EvidenceCarousel";
import {
  ShieldAlert,
  BookOpen,
  Download,
  AlertTriangle,
  BadgeCheck,
  XCircle,
  Search,
  MessageSquare,
  FileText,
  Calendar,
  Clock,
  Plus,
  ChevronRight,
  ChevronLeft,
  Image as ImageIcon,
  Paperclip,
  Mic,
  Send
} from "lucide-react";

export function AILab() {
  const [activeTab, setActiveTab] = useState("AI Simulation");
  const [prompt, setPrompt] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);

  const handleSimulate = async () => {
    setIsSimulating(true);
    setTimeout(() => {
      setSimulationResult({
        whatWeKnow: [
          "The traffic stop occurred at 11:45 PM on standard patrol.",
          "Dashcam footage shows minor lane deviation.",
        ],
        whatWeDontKnow: [
          "Whether the officer's radar gun was calibrated within the required 30-day window.",
          "If the weather conditions (rain) impacted visibility.",
        ],
        potentialConsiderations: [
          "Indiana Code § 9-21-8-24 requires vehicles to be driven 'as nearly as practicable' within a single lane.",
          "State v. Quirk (Ind. 2006) discusses prolonged detentions.",
        ],
        questionsForAttorney: [
          "Should we file a motion for discovery specifically for radar calibration logs?",
          "How does the local judge typically rule on 'practicable' lane deviations?",
        ],
        citations: [
          {
            id: "cid-94821",
            title: "State v. Quirk",
            citation: "842 N.E.2d 334",
            verifiedAt: new Date().toISOString(),
            trustBadge: "gold",
          },
        ],
        confidenceScore: "High"
      });
      setIsSimulating(false);
    }, 1500);
  };

  const renderTrustBadge = (badge: string) => {
    switch (badge) {
      case "gold":
        return (
          <span className="bg-emerald-900/40 text-emerald-400 text-[10px] uppercase tracking-widest px-2 py-1 rounded-full flex items-center gap-1 font-semibold border border-emerald-500/20">
            <BadgeCheck size={12} /> Primary Authority
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6 text-white font-sans animate-in fade-in duration-500">
      
      {/* Quick Actions Toolbar */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-serif text-white tracking-tight flex items-center gap-3">
          <ShieldAlert className="text-white/70" size={20} />
          AI Simulation Lab
        </h1>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5/5 px-4 py-2 text-[10px] font-bold tracking-widest text-white hover:bg-white/5/10 transition backdrop-blur-md">
            <Plus size={14} className="text-white/70" /> ADD EVIDENCE
          </button>
          <button className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5/5 px-4 py-2 text-[10px] font-bold tracking-widest text-white hover:bg-white/5/10 transition backdrop-blur-md">
            <Calendar size={14} className="text-white/70" /> SCHEDULE HEARING
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evidence Carousel */}
        <EvidenceCarousel />

        {/* Timeline Carousel */}
        <div className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-2xl p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold tracking-widest text-white/50 uppercase">Case Timeline</h2>
            <div className="flex gap-1">
              <button className="p-1 rounded bg-white/5/5 hover:bg-white/5/10 text-white/40"><ChevronLeft size={16} /></button>
              <button className="p-1 rounded bg-white/5/5 hover:bg-white/5/10 text-white/40"><ChevronRight size={16} /></button>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
            {['Arrest', 'Arraignment', 'Discovery', 'Pre-Trial'].map((event, i) => (
              <div key={i} className="min-w-[160px] bg-black/40 border border-white/10 rounded-xl p-4 hover:border-emerald-500/50 transition cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <Clock size={14} className="text-white/70" />
                  <span className="text-[10px] text-white/30">May 0{i+1}</span>
                </div>
                <h3 className="text-sm font-semibold text-white">{event}</h3>
                <div className="mt-2 h-1 w-full bg-white/5/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500/50 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabbed Interface */}
      <div className="flex-1 flex flex-col bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-2xl backdrop-blur-xl overflow-hidden min-h-[500px]">
        <div className="flex border-b border-white/10 bg-black/20">
          <button 
            onClick={() => setActiveTab("AI Simulation")}
            className={`px-6 py-4 text-xs font-bold tracking-widest transition border-b-2 ${activeTab === "AI Simulation" ? "border-white/10 text-white/70" : "border-transparent text-white/40 hover:text-white/70"}`}
          >
            <span className="flex items-center gap-2"><ShieldAlert size={14} /> AI SIMULATION</span>
          </button>
          <button 
            onClick={() => setActiveTab("Chat")}
            className={`px-6 py-4 text-xs font-bold tracking-widest transition border-b-2 ${activeTab === "Chat" ? "border-white/10 text-white/70" : "border-transparent text-white/40 hover:text-white/70"}`}
          >
            <span className="flex items-center gap-2"><MessageSquare size={14} /> TEAM CHAT</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "AI Simulation" ? (
            <div className="space-y-6">
              <div className="bg-black/40 border border-white/10 rounded-xl p-6 shadow-xl">
                <h2 className="text-xs font-bold tracking-widest text-white/50 uppercase mb-4 flex items-center gap-2">
                  <Search size={14} className="text-white/70" /> Strategy Prompt
                </h2>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the incident, the evidence, and the legal theory you wish to test..."
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-4 text-sm text-white focus:outline-none focus:border-white/10 transition min-h-[100px] placeholder:text-white/20"
                />
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleSimulate}
                    disabled={!prompt || isSimulating}
                    className="bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.03)] text-black disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2 rounded-lg text-xs font-bold tracking-widest transition shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                  >
                    {isSimulating ? "RUNNING..." : "RUN SIMULATION"}
                  </button>
                </div>
              </div>

              {simulationResult && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-black/40 border border-white/10 rounded-xl p-5 shadow-lg border-l-2 border-l-emerald-500">
                        <h3 className="text-xs font-bold tracking-widest text-white/70 mb-3 uppercase">What We Know</h3>
                        <ul className="list-disc pl-4 space-y-2 text-sm text-white/60">
                          {simulationResult.whatWeKnow.map((item: string, i: number) => <li key={i}>{item}</li>)}
                        </ul>
                      </div>
                      <div className="bg-black/40 border border-white/10 rounded-xl p-5 shadow-lg border-l-2 border-l-rose-500">
                        <h3 className="text-xs font-bold tracking-widest text-white/70 mb-3 uppercase">Uncertainties</h3>
                        <ul className="list-disc pl-4 space-y-2 text-sm text-white/60">
                          {simulationResult.whatWeDontKnow.map((item: string, i: number) => <li key={i}>{item}</li>)}
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="lg:col-span-1 space-y-6">
                    <div className="bg-black/40 border border-white/10 rounded-xl p-5 shadow-lg">
                      <h3 className="text-xs font-bold tracking-widest text-white/70 mb-4 uppercase">Citation Inspector</h3>
                      <div className="space-y-4">
                        {simulationResult.citations.map((cite: any, i: number) => (
                          <div key={i} className="bg-white/5/5 border border-white/10 p-3 rounded-lg text-sm">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-semibold text-white/90">{cite.title}</span>
                              {renderTrustBadge(cite.trustBadge)}
                            </div>
                            <p className="text-white/70 text-xs font-mono">{cite.citation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col h-full h-[400px]">
              <div className="flex-1 overflow-y-auto space-y-4 pr-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-[rgba(255,255,255,0.03)] text-black flex items-center justify-center font-bold text-xs shrink-0">AI</div>
                  <div className="bg-white/5/5 border border-white/10 rounded-2xl rounded-tl-none p-4 text-sm text-white/80">
                    Hello. I've reviewed the initial case file. The dashcam footage seems to contradict the officer's written narrative regarding the lane deviation. Would you like me to draft a cross-examination outline?
                  </div>
                </div>
              </div>
              <div className="mt-4 relative">
                <input 
                  type="text" 
                  placeholder="Ask the legal team..." 
                  className="w-full bg-black/50 border border-white/10 rounded-full pl-12 pr-12 py-4 text-sm text-white focus:outline-none focus:border-white/10 transition placeholder:text-white/30"
                />
                <Paperclip size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition cursor-pointer" />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-[rgba(255,255,255,0.03)] rounded-full text-black hover:scale-105 transition">
                  <Send size={14} className="ml-0.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
