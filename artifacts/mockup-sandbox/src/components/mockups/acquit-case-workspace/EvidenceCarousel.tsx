import React, { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  FileText, 
  Image as ImageIcon, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Eye, 
  ShieldCheck, 
  FileCode,
  Hash,
  X
} from "lucide-react";

export interface EvidenceItem {
  id: number;
  type: "pdf" | "video" | "image";
  name: string;
  size: string;
  sha256: string;
  ocrStatus: "Verified" | "Extracted" | "Pending";
  description: string;
  timestamp: string;
}

export const defaultEvidenceItems: EvidenceItem[] = [
  { 
    id: 1, 
    type: "pdf", 
    name: "Exhibit_01_Dashcam_Log.pdf",
    size: "2.4 MB",
    sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    ocrStatus: "Verified",
    description: "Cruiser patrol telemetry and speed radar timestamp sync log.",
    timestamp: "2024-05-12 23:45:10 EST"
  },
  { 
    id: 2, 
    type: "video", 
    name: "Dashcam_RearView.mp4",
    size: "148 MB",
    sha256: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
    ocrStatus: "Extracted",
    description: "High-definition cruiser dashcam video showing road center line.",
    timestamp: "2024-05-12 23:44:00 EST"
  },
  { 
    id: 3, 
    type: "pdf", 
    name: "Police_Narrative_Report.pdf",
    size: "1.1 MB",
    sha256: "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb",
    ocrStatus: "Verified",
    description: "Arresting officer's sworn narrative affidavit filed with Marion Superior.",
    timestamp: "2024-05-13 02:15:00 EST"
  },
  { 
    id: 4, 
    type: "image", 
    name: "Intersection_Scene_Photo.jpg",
    size: "4.8 MB",
    sha256: "185f8db32271fe25f561a6fc938b2e264306ec304eda518007d1764826381969",
    ocrStatus: "Extracted",
    description: "Streetlight illumination and lane divider weather photo at stop.",
    timestamp: "2024-05-13 00:30:22 EST"
  },
  { 
    id: 5, 
    type: "pdf", 
    name: "Witness_Affidavit_JaneDoe.pdf",
    size: "820 KB",
    sha256: "3c59dc048e8850243be8079a5c74d079abb2b8c617da51120e747da4f124f34f",
    ocrStatus: "Verified",
    description: "Sworn bystander deposition regarding vehicle movement.",
    timestamp: "2024-05-14 14:20:00 EST"
  },
  { 
    id: 6, 
    type: "image", 
    name: "Radar_Calibration_Sticker.jpg",
    size: "2.1 MB",
    sha256: "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
    ocrStatus: "Verified",
    description: "Equipment calibration decal showing 45-day inspection lapse.",
    timestamp: "2024-05-15 10:15:00 EST"
  },
  { 
    id: 7, 
    type: "video", 
    name: "Bodycam_Officer_04.mp4",
    size: "312 MB",
    sha256: "ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d",
    ocrStatus: "Extracted",
    description: "Full audio/video of field sobriety instructions and response.",
    timestamp: "2024-05-12 23:46:18 EST"
  },
];

interface EvidenceCarouselProps {
  onSelectEvidence?: (item: EvidenceItem) => void;
  selectedId?: number;
}

export function EvidenceCarousel({ onSelectEvidence, selectedId }: EvidenceCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeItem, setActiveItem] = useState<EvidenceItem>(defaultEvidenceItems[0]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftPos(scrollRef.current.scrollLeft);
  };

  const handleMouseLeaveOrUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeftPos - walk;
  };

  const handleSelect = (item: EvidenceItem) => {
    setActiveItem(item);
    if (onSelectEvidence) {
      onSelectEvidence(item);
    }
  };

  const currentSelectedId = selectedId ?? activeItem.id;

  return (
    <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-5 backdrop-blur-xl flex flex-col w-full overflow-hidden shadow-2xl relative">
      {/* Header with Navigation Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#D4AF37] animate-pulse" />
          <h2 className="text-[11px] font-bold tracking-widest text-white/70 uppercase">
            Interactive Evidence Gallery ({defaultEvidenceItems.length})
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => scroll('left')}
            aria-label="Scroll left"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition active:scale-95 cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            onClick={() => scroll('right')}
            aria-label="Scroll right"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition active:scale-95 cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      
      {/* Swiper / Scrollable Carousel Container */}
      <div 
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeaveOrUp}
        onMouseUp={handleMouseLeaveOrUp}
        onMouseMove={handleMouseMove}
        className={`flex w-full space-x-3 overflow-x-auto pb-2 select-none cursor-grab ${
          isDragging ? 'cursor-grabbing' : ''
        }`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {defaultEvidenceItems.map((item) => {
          const isSelected = item.id === currentSelectedId;
          return (
            <Card
              key={item.id}
              onClick={() => handleSelect(item)}
              className={`w-[160px] h-[115px] shrink-0 cursor-pointer rounded-xl border transition-all duration-200 ${
                isSelected 
                  ? 'bg-[#174E48]/40 border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.25)] ring-1 ring-[#D4AF37]/50 -translate-y-0.5' 
                  : 'bg-black/60 border-white/10 hover:border-white/30 hover:bg-white/5'
              }`}
            >
              <CardContent className="flex flex-col justify-between p-3 h-full">
                <div className="flex items-center justify-between">
                  <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'bg-white/5 text-white/40'}`}>
                    {item.type === "pdf" ? (
                      <FileText size={16} />
                    ) : item.type === "video" ? (
                      <Play size={16} />
                    ) : (
                      <ImageIcon size={16} />
                    )}
                  </div>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                    item.ocrStatus === "Verified" 
                      ? "border-emerald-500/30 text-emerald-400 bg-emerald-950/40"
                      : "border-[#D4AF37]/30 text-[#D4AF37] bg-[#D4AF37]/10"
                  }`}>
                    {item.ocrStatus}
                  </span>
                </div>

                <div className="mt-1">
                  <p className="text-[11px] font-semibold text-white/90 truncate">
                    {item.name}
                  </p>
                  <p className="text-[9px] text-white/40 font-mono mt-0.5">
                    {item.size} • {item.type.toUpperCase()}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected Evidence Detail Bar */}
      {activeItem && (
        <div className="mt-3 pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-white/[0.02] p-3 rounded-xl">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 rounded-lg bg-[#174E48]/30 border border-[#174E48] text-[#D4AF37] shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white truncate">{activeItem.name}</span>
                <span className="text-[10px] text-white/40 font-mono">({activeItem.size})</span>
              </div>
              <p className="text-[10px] text-white/60 truncate mt-0.5 font-sans">
                {activeItem.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowDetailModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[#D4AF37] text-[11px] font-semibold transition cursor-pointer"
            >
              <Eye size={13} /> Inspect Metadata
            </button>
          </div>
        </div>
      )}

      {/* Document Inspector Modal */}
      {showDetailModal && activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="max-w-lg w-full rounded-2xl border border-white/20 bg-[#0E0E0E] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#174E48] text-[#D4AF37]">
                  <FileCode size={20} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-white text-base truncate max-w-[280px]">
                    {activeItem.name}
                  </h3>
                  <p className="text-xs text-white/50 font-mono">{activeItem.timestamp}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-white/40 block text-[10px] uppercase tracking-wider font-bold mb-1">
                  Evidence Description
                </span>
                <p className="text-white/80 bg-black/50 p-3 rounded-xl border border-white/10 leading-relaxed font-sans">
                  {activeItem.description}
                </p>
              </div>

              <div>
                <span className="text-white/40 block text-[10px] uppercase tracking-wider font-bold mb-1">
                  Cryptographic SHA-256 Checksum
                </span>
                <div className="flex items-center gap-2 bg-black/50 p-3 rounded-xl border border-white/10 font-mono text-[10px] text-[#D4AF37] break-all">
                  <Hash size={14} className="shrink-0 text-white/40" />
                  {activeItem.sha256}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-black/40 border border-white/10 p-2.5 rounded-xl">
                  <span className="text-[9px] text-white/40 uppercase block">OCR Ingestion</span>
                  <span className="text-emerald-400 font-semibold text-xs mt-0.5 block flex items-center gap-1">
                    <ShieldCheck size={12} /> {activeItem.ocrStatus}
                  </span>
                </div>
                <div className="bg-black/40 border border-white/10 p-2.5 rounded-xl">
                  <span className="text-[9px] text-white/40 uppercase block">Chain of Custody</span>
                  <span className="text-[#D4AF37] font-semibold text-xs mt-0.5 block">
                    Verified Sovereign
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="py-2 px-5 rounded-xl bg-[#174E48] hover:bg-[#1f665e] text-[#D4AF37] text-xs font-semibold shadow-lg transition cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
