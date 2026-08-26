import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, ShieldCheck, FileCheck2, Scale, 
  ArrowRight, Check, X, AlertTriangle, Building2,
  Database, Gavel, Cpu, ScrollText, Play, ChevronRight,
  UserCheck, Key, Lock, Copy, CheckCircle2
} from 'lucide-react';

export function FilingCenter() {
  const [reviewed, setReviewed] = useState(false);
  const [proSe, setProSe] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [filingState, setFilingState] = useState<'pending' | 'signing' | 'submitting' | 'success'>('pending');
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [hmacToken, setHmacToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const canFile = reviewed && proSe && authorized;

  // Lock body scroll when modal is open and handle escape key
  useEffect(() => {
    if (showDraftModal) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setShowDraftModal(false);
      };
      window.addEventListener('keydown', handleKeyDown);
          } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      if (typeof handleKeyDown !== 'undefined') window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showDraftModal]);

  const handleFile = () => {
    if (!canFile) return;
    setFilingState('signing');
    
    // Simulate HMAC SHA-256 token generation and submission
    setTimeout(() => {
      const generatedToken = `hmac_sha256_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
      setHmacToken(generatedToken);
      setFilingState('submitting');

      setTimeout(() => {
        setFilingState('success');
      }, 1200);
    }, 1000);
  };

  const copyToken = () => {
    if (hmacToken) {
      navigator.clipboard.writeText(hmacToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Infrastructure Pipeline Visualization */}
      <div className="bg-[#0A0A0A] rounded-2xl p-5 border border-white/10 shadow-xl backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[12px] font-bold text-white/80 uppercase tracking-widest flex items-center gap-2">
            <Database size={16} className="text-[#D4AF37]" /> Data & Authorization Pipeline
          </h3>
          <span className="text-[10px] font-mono text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-1 rounded-full border border-[#D4AF37]/20 flex items-center gap-1.5 font-semibold">
            <ShieldCheck size={12} /> AUDIT LOGGING ACTIVE
          </span>
        </div>
        
        <div className="grid grid-cols-5 gap-3">
          <div className="bg-white/[0.03] rounded-xl p-3.5 border border-white/10 text-center shadow-sm">
            <Building2 size={20} className="mx-auto mb-2 text-[#D4AF37]" />
            <p className="text-[11px] font-bold text-white">1. Court</p>
            <p className="text-[10px] text-white/50 mt-0.5">MyCase.gov IN</p>
          </div>
          <div className="flex items-center justify-center text-white/30">
            <ChevronRight size={20} />
          </div>
          <div className="bg-white/[0.03] rounded-xl p-3.5 border border-white/10 text-center shadow-sm">
            <Database size={20} className="mx-auto mb-2 text-[#D4AF37]" />
            <p className="text-[11px] font-bold text-white">2. Workspace</p>
            <p className="text-[10px] text-white/50 mt-0.5">PostgreSQL Sync</p>
          </div>
          <div className="flex items-center justify-center text-white/30">
            <ChevronRight size={20} />
          </div>
          <div className="bg-[#174E48]/30 rounded-xl p-3.5 border border-[#174E48] text-center shadow-sm">
            <Cpu size={20} className="mx-auto mb-2 text-[#D4AF37]" />
            <p className="text-[11px] font-bold text-[#D4AF37]">3. AI Team</p>
            <p className="text-[10px] text-white/60 mt-0.5">Analysis & Draft</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: AI Draft & Audit Trail */}
        <div className="space-y-5">
          <section className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37] block mb-1">
                  Court Pleading Draft
                </span>
                <h2 className="font-serif text-[22px] font-semibold text-white">
                  Motion for Discovery & Inspection
                </h2>
                <p className="text-[13px] text-white/60 mt-1">
                  Drafted by Acquit AI based on Marion County Docket Entry #18
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-[#174E48]/30 flex items-center justify-center border border-[#174E48] text-[#D4AF37] shrink-0">
                <FileText size={20} />
              </div>
            </div>

            <div className="bg-black/50 rounded-xl p-4 border border-white/10 mb-5">
              <div className="flex items-center gap-2 mb-2 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                <Check size={14} /> AI Agent Execution Log
              </div>
              <ul className="space-y-2 font-mono text-[11px] text-white/70">
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> <span>getCase("IN-MAR-24-0187")</span></li>
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> <span>getDocket()</span></li>
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> <span>extractCitations("Ind. R. Crim. P. 2.5")</span></li>
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> <span>draftDocument("Motion for Discovery")</span></li>
                <li className="flex items-center gap-2 text-rose-400 bg-rose-950/30 border border-rose-800/30 py-1.5 px-2.5 rounded-lg -ml-1">
                  <X size={13} className="shrink-0" /> 
                  <span className="font-bold">submitFiling() BLOCKED:</span> 
                  <span className="opacity-90">Requires Cryptographic Human Authorization</span>
                </li>
              </ul>
            </div>

            <button 
              onClick={() => setShowDraftModal(true)}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 py-3 text-[13px] font-bold text-white transition cursor-pointer"
            >
              <ScrollText size={16} className="text-[#D4AF37]" /> Review Full Document Draft & Citations
            </button>
          </section>
        </div>

        {/* Right Column: Human Gate */}
        <div>
          <section className="rounded-2xl border-2 border-white/10 bg-[#0A0A0A] p-6 shadow-xl relative overflow-hidden h-full flex flex-col backdrop-blur-xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></div>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-[#174E48] flex items-center justify-center text-[#D4AF37] shrink-0">
                <UserCheck size={20} />
              </div>
              <div>
                <h2 className="font-serif text-[22px] font-semibold text-white">
                  Human Authorization Gate
                </h2>
                <p className="text-[12px] text-white/50 font-sans">
                  Mandatory cryptographic verification for court transmission
                </p>
              </div>
            </div>

            {filingState === 'success' ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-6">
                <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 size={36} />
                </div>
                <div>
                  <h3 className="font-serif text-2xl text-white font-semibold">
                    Filing Authorized & Transmitted
                  </h3>
                  <p className="text-xs text-white/60 max-w-[320px] mt-1 font-sans">
                    Consent signature verified with HMAC SHA-256. Court connector has queued transmission for Marion Superior Court.
                  </p>
                </div>

                {hmacToken && (
                  <div className="w-full bg-black/60 border border-white/10 p-3 rounded-xl flex items-center justify-between text-left">
                    <div className="overflow-hidden">
                      <span className="text-[9px] uppercase tracking-wider text-white/40 block font-bold">
                        Consent Signature Token
                      </span>
                      <span className="font-mono text-[10px] text-[#D4AF37] truncate block">
                        {hmacToken}
                      </span>
                    </div>
                    <button
                      onClick={copyToken}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition shrink-0 ml-2 cursor-pointer"
                      title="Copy Token"
                    >
                      {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                )}

                <button
                  onClick={() => {
                    setFilingState('pending');
                    setReviewed(false);
                    setProSe(false);
                    setAuthorized(false);
                  }}
                  className="py-2.5 px-5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition cursor-pointer"
                >
                  Prepare Another Filing
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                <div className="space-y-4 mb-6 flex-1">
                  {/* Checkbox 1 */}
                  <label className="flex items-start gap-3.5 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 transition cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="mt-0.5 h-4 w-4 rounded border-white/20 text-[#174E48] focus:ring-[#D4AF37] focus:ring-offset-0 bg-black cursor-pointer"
                      checked={reviewed}
                      onChange={(e) => setReviewed(e.target.checked)}
                      disabled={filingState !== 'pending'}
                    />
                    <span className="text-[12px] text-white/80 font-sans leading-relaxed group-hover:text-white transition-colors">
                      <strong className="text-white block font-mono text-[11px] mb-0.5">1. Accuracy Review</strong>
                      I have carefully reviewed this document draft for factual accuracy. I understand AI drafts require explicit human verification.
                    </span>
                  </label>

                  {/* Checkbox 2 */}
                  <label className="flex items-start gap-3.5 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 transition cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="mt-0.5 h-4 w-4 rounded border-white/20 text-[#174E48] focus:ring-[#D4AF37] focus:ring-offset-0 bg-black cursor-pointer"
                      checked={proSe}
                      onChange={(e) => setProSe(e.target.checked)}
                      disabled={filingState !== 'pending'}
                    />
                    <span className="text-[12px] text-white/80 font-sans leading-relaxed group-hover:text-white transition-colors">
                      <strong className="text-white block font-mono text-[11px] mb-0.5">2. Self-Represented Status</strong>
                      I am acting Pro Se on my own behalf. I acknowledge Acquit.ai is a legal software tool and does not provide legal representation.
                    </span>
                  </label>

                  {/* Checkbox 3 */}
                  <label className="flex items-start gap-3.5 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 transition cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="mt-0.5 h-4 w-4 rounded border-white/20 text-[#174E48] focus:ring-[#D4AF37] focus:ring-offset-0 bg-black cursor-pointer"
                      checked={authorized}
                      onChange={(e) => setAuthorized(e.target.checked)}
                      disabled={filingState !== 'pending'}
                    />
                    <span className="text-[12px] text-white/80 font-sans leading-relaxed group-hover:text-white transition-colors">
                      <strong className="text-white block font-mono text-[11px] mb-0.5">3. Transmission Authorization</strong>
                      I explicitly authorize the generation of an HMAC-SHA256 signature to transmit this pleading to the court filing gateway.
                    </span>
                  </label>
                </div>

                <div className="bg-[#D4AF37]/10 rounded-xl p-3.5 border border-[#D4AF37]/20 mb-6 flex gap-3 items-start">
                  <AlertTriangle size={18} className="text-[#D4AF37] shrink-0 mt-0.5" />
                  <p className="text-[11px] text-[#EFE6D0] leading-relaxed font-sans">
                    <strong>Statutory Warning:</strong> Once signed and filed, you are legally responsible for all pleadings submitted. This action is permanently logged in the audit trail.
                  </p>
                </div>

                <button 
                  onClick={handleFile}
                  disabled={!canFile || filingState !== 'pending'}
                  className={`w-full py-3.5 rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 transition-all duration-300 ${
                    canFile && filingState === 'pending'
                      ? 'bg-[#174E48] text-[#D4AF37] hover:bg-[#1f665e] shadow-[0_4px_20px_rgba(23,78,72,0.4)] cursor-pointer' 
                      : 'bg-white/5 text-white/30 border border-white/5 cursor-not-allowed'
                  }`}
                >
                  {filingState === 'signing' ? (
                    <span className="flex items-center gap-2 font-mono text-xs">
                      <div className="h-4 w-4 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
                      Signing Authorization Token via HMAC SHA-256...
                    </span>
                  ) : filingState === 'submitting' ? (
                    <span className="flex items-center gap-2 font-mono text-xs">
                      <div className="h-4 w-4 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
                      Transmitting via Court Connector SDK...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Scale size={18} /> Sign & Authorize E-Filing
                    </span>
                  )}
                </button>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Document Review Modal with Focus Trap & Backdrop */}
      {showDraftModal && (
        <div 
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div 
            ref={modalRef}
            className="max-w-2xl w-full max-h-[85vh] flex flex-col rounded-2xl border border-white/20 bg-[#0E0E0E] p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#174E48] text-[#D4AF37]">
                  <ScrollText size={20} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-white text-lg">
                    Motion for Discovery & Inspection (Draft)
                  </h3>
                  <p className="text-xs text-white/50 font-mono">Cause No. 49D01-2405-CM-0187</p>
                </div>
              </div>
              <button
                onClick={() => setShowDraftModal(false)}
                className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 text-xs font-serif bg-black/40 p-4 rounded-xl border border-white/10 leading-relaxed text-white/90">
              <div className="text-center font-bold tracking-widest uppercase border-b border-white/10 pb-3 font-mono text-[11px] text-[#D4AF37]">
                STATE OF INDIANA • MARION COUNTY SUPERIOR COURT
              </div>
              <p>
                <strong>STATE OF INDIANA</strong>, Plaintiff, <br />
                v. <br />
                <strong>ALEX THOMPSON</strong>, Defendant.
              </p>
              <p className="font-bold text-center uppercase tracking-wider py-1 font-mono text-white">
                DEFENDANT'S PRO SE MOTION FOR PRODUCTION OF RADAR CALIBRATION AND DASHCAM TELEMETRY
              </p>
              <p>
                Comes now the Defendant, Alex Thompson, Pro Se, and respectfully moves this Honorable Court pursuant to Indiana Rules of Criminal Procedure, Rule 2.5, for an Order directing the Marion County Prosecutor to produce:
              </p>
              <ol className="list-decimal pl-5 space-y-1 font-sans text-[11px] text-white/80">
                <li>Complete calibration and certification records for the Stalker DSR 2X Radar unit used on May 12, 2024.</li>
                <li>Unedited digital audio and video recordings from cruiser Unit #402 from 23:30 to 24:00 EST.</li>
                <li>All radio transmission dispatch transcripts pertaining to CAD Incident #24-09812.</li>
              </ol>
              <p className="font-sans text-[11px] text-white/70 italic">
                MEMORANDUM OF LAW: Under Ind. R. Crim. P. 2.5 and Brady v. Maryland, 373 U.S. 83 (1963), the State is required to disclose all exculpatory and impeachment material relevant to vehicle trajectory.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <span className="text-[11px] text-white/40 font-mono">
                Status: Self-Represented Litigant Draft
              </span>
              <button
                onClick={() => setShowDraftModal(false)}
                className="py-2 px-5 rounded-xl bg-[#174E48] hover:bg-[#1f665e] text-[#D4AF37] text-xs font-semibold shadow-lg transition cursor-pointer"
              >
                Close Document Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
