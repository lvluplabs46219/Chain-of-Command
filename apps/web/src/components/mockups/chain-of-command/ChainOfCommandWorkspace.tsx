import { useState } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Link as LinkIcon, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Lock, 
  Database,
  Activity,
  ArrowRight,
  ChevronRight,
  Upload,
  Camera,
  Mic,
  FileSearch,
  Hash
} from 'lucide-react';

interface VerificationBarProps {
  label: string;
  value: number;
  status: string;
  colorClass: string;
}

function VerificationBar({ label, value, status, colorClass }: VerificationBarProps) {
  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs font-mono mb-1.5 uppercase tracking-wider">
        <span className="text-gray-400">{label}</span>
        <span className={colorClass.replace('bg-', 'text-')}>{status}</span>
      </div>
      <div className="h-1.5 w-full bg-[#1A1A1A] rounded-full overflow-hidden">
        <div 
          className={`h-full ${colorClass} transition-all duration-1000 ease-out`} 
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

interface LedgerNodeProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  isLast?: boolean;
  status?: 'verified' | 'warning' | 'pending';
}

function LedgerNode({ title, subtitle, icon, isLast, status = 'verified' }: LedgerNodeProps) {
  return (
    <div className="flex gap-4 relative">
      {!isLast && (
        <div className="absolute left-4 top-10 bottom-[-16px] w-px bg-[#2A2A2A]" />
      )}
      <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
        status === 'verified' ? 'bg-[#0E0E0E] border-[#34D399] text-[#34D399]' :
        status === 'warning' ? 'bg-[#0E0E0E] border-[#F59E0B] text-[#F59E0B]' :
        'bg-[#0E0E0E] border-[#3B82F6] text-[#3B82F6]'
      }`}>
        {icon}
      </div>
      <div className="pb-8 pt-1">
        <h4 className="text-sm font-medium text-gray-200">{title}</h4>
        <p className="text-xs text-gray-500 font-mono mt-1">{subtitle}</p>
      </div>
    </div>
  );
}

export function ChainOfCommandWorkspace() {
  const [activeTab, setActiveTab] = useState<'studio' | 'verification' | 'ledger'>('studio');

  return (
    <div className="min-h-[calc(100vh-45px)] bg-[#050505] text-gray-300 font-sans p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#1A1A1A] pb-6">
          <div>
            <div className="flex items-center gap-2 text-[#D4AF37] mb-2">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-sm font-mono tracking-widest uppercase">Chain of Command</span>
            </div>
            <h1 className="text-3xl font-serif text-white">Evidence & Verification</h1>
            <p className="text-gray-500 mt-2">Build the case. Verify the evidence. Know what changed.</p>
          </div>
          
          <div className="flex items-center gap-3 bg-[#0A0A0A] border border-[#1A1A1A] rounded-lg p-3">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 font-mono uppercase">Case Currentness</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </span>
                <span className="text-sm text-amber-500 font-medium">Needs Review</span>
              </div>
            </div>
            <div className="h-8 w-px bg-[#1A1A1A] mx-2" />
            <button className="text-xs bg-[#1A1A1A] hover:bg-[#252525] text-white px-3 py-1.5 rounded transition-colors">
              3 Updates Found
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 bg-[#0A0A0A] p-1 rounded-lg border border-[#1A1A1A] w-fit">
          <button 
            onClick={() => setActiveTab('studio')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'studio' ? 'bg-[#1A1A1A] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Evidence Studio
          </button>
          <button 
            onClick={() => setActiveTab('verification')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'verification' ? 'bg-[#1A1A1A] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Verification Engine
          </button>
          <button 
            onClick={() => setActiveTab('ledger')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'ledger' ? 'bg-[#1A1A1A] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Custody Ledger
          </button>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {activeTab === 'studio' && (
              <>
                {/* AI Gap Detection */}
                <div className="bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-amber-500/20 rounded-lg text-amber-500 mt-1">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-amber-500 font-medium">Evidence Gap Detected</h3>
                      <p className="text-gray-300 mt-2 leading-relaxed">
                        Your timeline says the vehicle was searched at <span className="text-white font-mono bg-black/30 px-1.5 py-0.5 rounded">10:42 PM</span>, but there is currently no evidence documenting when the search began.
                      </p>
                      <div className="mt-4 pt-4 border-t border-amber-500/20">
                        <p className="text-xs font-mono text-amber-500/70 uppercase mb-3">Potential Sources to Acquire</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="bg-black/40 border border-amber-500/30 text-amber-400/90 text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 cursor-pointer hover:bg-black/60 transition-colors">
                            <Camera className="w-3 h-3" /> Body-camera footage
                          </span>
                          <span className="bg-black/40 border border-amber-500/30 text-amber-400/90 text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 cursor-pointer hover:bg-black/60 transition-colors">
                            <Activity className="w-3 h-3" /> CAD dispatch records
                          </span>
                          <span className="bg-black/40 border border-amber-500/30 text-amber-400/90 text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 cursor-pointer hover:bg-black/60 transition-colors">
                            <FileText className="w-3 h-3" /> Officer report
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Evidence Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <button className="border border-dashed border-[#2A2A2A] rounded-xl p-6 flex flex-col items-center justify-center text-gray-500 hover:border-[#D4AF37] hover:text-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all group min-h-[160px]">
                    <Upload className="w-6 h-6 mb-3 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Add Evidence</span>
                  </button>
                  
                  <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl p-5 relative group overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#34D399]" />
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-[#1A1A1A] rounded-lg">
                        <FileText className="w-4 h-4 text-gray-300" />
                      </div>
                      <span className="text-[10px] font-mono text-[#34D399] bg-[#34D399]/10 px-2 py-1 rounded">VERIFIED</span>
                    </div>
                    <h4 className="text-white font-medium mb-1">Motion to Suppress</h4>
                    <p className="text-xs text-gray-500 font-mono">ID: EV-1042</p>
                  </div>

                  <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl p-5 relative group overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#F59E0B]" />
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-[#1A1A1A] rounded-lg">
                        <Mic className="w-4 h-4 text-gray-300" />
                      </div>
                      <span className="text-[10px] font-mono text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-1 rounded">REVIEW NEEDED</span>
                    </div>
                    <h4 className="text-white font-medium mb-1">Witness Audio Interview</h4>
                    <p className="text-xs text-gray-500 font-mono">ID: EV-1043</p>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'verification' && (
              <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl p-6">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-lg font-medium text-white mb-1">Legal Verification Engine</h2>
                    <p className="text-sm text-gray-500 font-mono">Document: Motion to Suppress (EV-1042)</p>
                  </div>
                  <div className="h-10 w-10 rounded-full border border-[#34D399] flex items-center justify-center bg-[#34D399]/10">
                    <ShieldCheck className="w-5 h-5 text-[#34D399]" />
                  </div>
                </div>

                <div className="space-y-6">
                  <VerificationBar label="Authenticity" value={100} status="VERIFIED" colorClass="bg-[#34D399]" />
                  <VerificationBar label="Integrity" value={100} status="VERIFIED" colorClass="bg-[#34D399]" />
                  <VerificationBar label="Source" value={100} status="VERIFIED" colorClass="bg-[#34D399]" />
                  <VerificationBar label="Chain of Custody" value={91} status="91%" colorClass="bg-[#34D399]" />
                  <VerificationBar label="Signature" value={100} status="VERIFIED" colorClass="bg-[#34D399]" />
                  <VerificationBar label="Currentness" value={40} status="REVIEW NEEDED" colorClass="bg-amber-500" />
                </div>
              </div>
            )}

            {activeTab === 'ledger' && (
              <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl p-6">
                <div className="mb-8">
                  <h2 className="text-lg font-medium text-white mb-1">Evidence Chain of Custody</h2>
                  <p className="text-sm text-gray-500 font-mono">Trace provenance and handoffs</p>
                </div>

                <div className="pl-2">
                  <LedgerNode 
                    title="SOURCE: PHOENIX PD" 
                    subtitle="Initial system entry" 
                    icon={<Database className="w-4 h-4" />} 
                  />
                  <LedgerNode 
                    title="COLLECTED" 
                    subtitle="Jun 12 · 10:42 PM" 
                    icon={<Camera className="w-4 h-4" />} 
                  />
                  <LedgerNode 
                    title="LOGGED" 
                    subtitle="Jun 12 · 11:31 PM" 
                    icon={<FileText className="w-4 h-4" />} 
                  />
                  <LedgerNode 
                    title="TRANSFERRED" 
                    subtitle="Custodian A → Jun 13 · 08:14 AM" 
                    icon={<ArrowRight className="w-4 h-4" />} 
                    status="warning"
                  />
                  <LedgerNode 
                    title="VERIFIED" 
                    subtitle="Hash ✓ Source ✓ Timeline ✓" 
                    icon={<ShieldCheck className="w-4 h-4" />} 
                    isLast
                  />
                </div>
                
                <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-3">
                   <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                   <div>
                     <h5 className="text-sm font-medium text-amber-500 mb-1">Chain Exception Detected</h5>
                     <p className="text-xs text-gray-400 font-mono">Expected: Custodian A → Custodian B<br/>Recorded: Custodian A → ??? → Custodian B</p>
                   </div>
                </div>
              </div>
            )}

          </div>

          {/* Sidebar Area: Trust Layer / Anchor */}
          <div className="space-y-6">
            <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4 text-gray-200">
                <Lock className="w-4 h-4" />
                <h3 className="font-medium">Trust Anchor</h3>
              </div>
              <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                Cryptographic commitments anchor this record to a public ledger, proving existence without exposing sensitive data.
              </p>
              
              <div className="space-y-4">
                <div>
                  <span className="block text-[10px] text-gray-500 font-mono uppercase mb-1">Document Hash (SHA-256)</span>
                  <div className="bg-black border border-[#1A1A1A] p-2 rounded text-xs font-mono text-gray-400 truncate flex items-center justify-between">
                    <span>e3b0c44298fc1c14...</span>
                    <Hash className="w-3 h-3 text-gray-600" />
                  </div>
                </div>
                <div>
                  <span className="block text-[10px] text-gray-500 font-mono uppercase mb-1">Merkle Root</span>
                  <div className="bg-black border border-[#1A1A1A] p-2 rounded text-xs font-mono text-gray-400 truncate flex items-center justify-between">
                    <span>0x9f86d081884c7d65...</span>
                    <LinkIcon className="w-3 h-3 text-gray-600" />
                  </div>
                </div>
                <div>
                  <span className="block text-[10px] text-gray-500 font-mono uppercase mb-1">Blockchain Verification</span>
                  <div className="flex items-center gap-2 mt-1">
                    <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
                    <span className="text-sm text-[#34D399]">Anchored to Block 8,492,113</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl p-5">
              <h3 className="text-sm font-medium text-gray-200 mb-4">CoC-1 Record Standard</h3>
              <div className="bg-black border border-[#1A1A1A] p-3 rounded-lg overflow-x-auto">
                <pre className="text-[10px] text-gray-400 font-mono leading-relaxed">
{`{
  "record_id": "coc_1f9...",
  "doc_hash": "e3b0c44...",
  "source": "AZ_SUPERIOR",
  "issuer": "CLERK_COURT",
  "jurisdiction": "AZ",
  "case_id": "CR2026-12",
  "created": "2026-06-12",
  "status": "VERIFIED"
}`}
                </pre>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
