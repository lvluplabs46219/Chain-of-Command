import React, { useState } from 'react';
import { 
  FileText, ShieldCheck, FileCheck2, Scale, 
  ArrowRight, Check, X, AlertTriangle, Building2,
  Database, Gavel, Cpu, ScrollText, Play, ChevronRight,
  UserCheck
} from 'lucide-react';

export function FilingCenter() {
  const [reviewed, setReviewed] = useState(false);
  const [proSe, setProSe] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [filingState, setFilingState] = useState<'pending' | 'submitting' | 'success'>('pending');

  const canFile = reviewed && proSe && authorized;

  const handleFile = () => {
    if (!canFile) return;
    setFilingState('submitting');
    setTimeout(() => {
      setFilingState('success');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Infrastructure Pipeline Visualization */}
      <div className="bg-[rgba(255,255,255,0.03)] rounded-2xl p-5 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[13px] font-bold text-white/70 uppercase tracking-widest flex items-center gap-2">
            <Database size={16} /> Data & Authorization Pipeline
          </h3>
          <span className="text-[10px] font-mono text-white/70 bg-[rgba(255,255,255,0.03)] px-2 py-1 rounded">AUDIT LOGGING ACTIVE</span>
        </div>
        
        <div className="grid grid-cols-5 gap-3">
          <div className="bg-white/5 rounded-lg p-3 border border-white/10 text-center shadow-sm">
            <Building2 size={20} className="mx-auto mb-2 text-white/70" />
            <p className="text-[11px] font-bold text-white/70">1. Court</p>
            <p className="text-[9px] text-white/70 mt-1">MyCase.gov IN</p>
          </div>
          <div className="flex items-center justify-center text-white/70">
            <ChevronRight size={20} />
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10 text-center shadow-sm">
            <Database size={20} className="mx-auto mb-2 text-white/70" />
            <p className="text-[11px] font-bold text-white/70">2. Workspace</p>
            <p className="text-[9px] text-white/70 mt-1">PostgreSQL Sync</p>
          </div>
          <div className="flex items-center justify-center text-white/70">
            <ChevronRight size={20} />
          </div>
          <div className="bg-[rgba(255,255,255,0.03)] rounded-lg p-3 border border-white/10 text-center shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <Cpu size={20} className="mx-auto mb-2 text-white/70" />
            <p className="text-[11px] font-bold text-white">3. AI Team</p>
            <p className="text-[9px] text-white/70 mt-1">Analysis & Draft</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: AI Draft & Audit Trail */}
        <div className="space-y-5">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-serif text-[22px] font-semibold text-white/70">Motion for Discovery</h2>
                <p className="text-[13px] text-white/70 mt-1">Drafted by Acquit AI based on Docket Entry 18</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-[rgba(255,255,255,0.03)] flex items-center justify-center border border-white/10">
                <FileText size={20} className="text-white/70" />
              </div>
            </div>

            <div className="bg-[rgba(255,255,255,0.03)] rounded-xl p-4 border border-white/10 mb-5">
              <div className="flex items-center gap-2 mb-2 text-[11px] font-bold uppercase tracking-wider text-white/70">
                <Check size={14} className="text-white/70" /> AI Agent Execution Log
              </div>
              <ul className="space-y-2 font-mono text-[11px] text-white/70">
                <li className="flex items-center gap-2"><span className="text-white/70">✓</span> <span>getCase("IN-MAR-24-0187")</span></li>
                <li className="flex items-center gap-2"><span className="text-white/70">✓</span> <span>getDocket()</span></li>
                <li className="flex items-center gap-2"><span className="text-white/70">✓</span> <span>summarizeDocument("State's discovery response")</span></li>
                <li className="flex items-center gap-2"><span className="text-white/70">✓</span> <span>draftDocument("Motion for Discovery")</span></li>
                <li className="flex items-center gap-2 text-white/70 bg-[rgba(255,255,255,0.03)] py-1 px-2 rounded -ml-2">
                  <X size={13} className="text-white/70" /> 
                  <span className="font-bold">submitFiling() BLOCKED:</span> 
                  <span className="opacity-80">Requires HUMAN_ACTION tool</span>
                </li>
              </ul>
            </div>

            <button className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 py-3 text-[13px] font-bold text-white/70 hover:bg-[rgba(255,255,255,0.03)] transition">
              <ScrollText size={16} /> Review Full Document Draft
            </button>
          </section>
        </div>

        {/* Right Column: Human Gate */}
        <div>
          <section className="rounded-2xl border-2 border-white/10 bg-[rgba(255,255,255,0.03)] p-6 shadow-md relative overflow-hidden h-full flex flex-col">
            <div className="absolute top-0 left-0 w-full h-1 bg-[rgba(255,255,255,0.03)]"></div>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-full bg-[rgba(255,255,255,0.03)] flex items-center justify-center text-white">
                <UserCheck size={20} />
              </div>
              <div>
                <h2 className="font-serif text-[22px] font-semibold text-white/70">Human Authorization Gate</h2>
                <p className="text-[12px] text-white/70">Strict boundary for external court actions</p>
              </div>
            </div>

            {filingState === 'success' ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                <div className="h-20 w-20 rounded-full bg-[rgba(255,255,255,0.03)] flex items-center justify-center mb-2">
                  <Check size={40} className="text-white/70" />
                </div>
                <h3 className="font-serif text-2xl text-white/70 font-semibold">Filing Submitted</h3>
                <p className="text-sm text-white/70 max-w-[250px]">
                  Authorized by Alex Thompson. The court connector has securely transmitted the document.
                </p>
                <div className="bg-[rgba(255,255,255,0.03)] text-white/70 font-mono text-[10px] p-2 rounded border border-white/10">
                  TX_ID: {Math.random().toString(36).substring(2, 12).toUpperCase()}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                <div className="space-y-4 mb-8 flex-1">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center pt-0.5">
                      <input 
                        type="checkbox" 
                        className="peer sr-only"
                        checked={reviewed}
                        onChange={(e) => setReviewed(e.target.checked)}
                        disabled={filingState === 'submitting'}
                      />
                      <div className="w-5 h-5 rounded border-2 border-white/10 peer-checked:border-white/10 peer-checked:bg-[rgba(255,255,255,0.03)] transition-all"></div>
                      <Check size={14} className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                    <span className="text-[13px] text-white/70 font-medium leading-relaxed group-hover:text-white/70 transition-colors">
                      I have carefully reviewed this document for accuracy and completeness. I understand AI drafts require human verification.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center pt-0.5">
                      <input 
                        type="checkbox" 
                        className="peer sr-only"
                        checked={proSe}
                        onChange={(e) => setProSe(e.target.checked)}
                        disabled={filingState === 'submitting'}
                      />
                      <div className="w-5 h-5 rounded border-2 border-white/10 peer-checked:border-white/10 peer-checked:bg-[rgba(255,255,255,0.03)] transition-all"></div>
                      <Check size={14} className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                    <span className="text-[13px] text-white/70 font-medium leading-relaxed group-hover:text-white/70 transition-colors">
                      I am self-represented and acting on my own behalf. I understand Acquit.ai is not a law firm and does not represent me.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center pt-0.5">
                      <input 
                        type="checkbox" 
                        className="peer sr-only"
                        checked={authorized}
                        onChange={(e) => setAuthorized(e.target.checked)}
                        disabled={filingState === 'submitting'}
                      />
                      <div className="w-5 h-5 rounded border-2 border-white/10 peer-checked:border-white/10 peer-checked:bg-[rgba(255,255,255,0.03)] transition-all"></div>
                      <Check size={14} className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                    <span className="text-[13px] text-white/70 font-medium leading-relaxed group-hover:text-white/70 transition-colors">
                      I explicitly authorize Acquit.ai to transmit this document to the Indiana E-Filing System using the Court Connector SDK.
                    </span>
                  </label>
                </div>

                <div className="bg-[rgba(255,255,255,0.03)] rounded-xl p-4 border border-white/10 mb-6 flex gap-3 items-start">
                  <AlertTriangle size={18} className="text-white/70 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-white/70 leading-relaxed">
                    <strong>Legal action warning:</strong> Submitting this document will file it with the court. You are legally responsible for its contents. Once submitted, this action cannot be undone by the AI.
                  </p>
                </div>

                <button 
                  onClick={handleFile}
                  disabled={!canFile || filingState === 'submitting'}
                  className={`w-full py-4 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all duration-300 ${
                    canFile 
                      ? 'bg-[rgba(255,255,255,0.03)] text-white hover:bg-[rgba(255,255,255,0.03)] shadow-[0_4px_20px_rgba(23,78,72,0.3)] hover:-translate-y-0.5' 
                      : 'bg-[rgba(255,255,255,0.03)] text-white/70 cursor-not-allowed'
                  }`}
                >
                  {filingState === 'submitting' ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Transmitting via Court Connector...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Scale size={18} /> E-File with Court
                    </span>
                  )}
                </button>
              </div>
            )}
          </section>
        </div>

      </div>
    </div>
  );
}
