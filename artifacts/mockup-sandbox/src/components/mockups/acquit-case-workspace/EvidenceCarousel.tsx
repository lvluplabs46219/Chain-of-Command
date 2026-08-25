import React, { useCallback, useEffect, useState, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
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
  id: number | string;
  type: "pdf" | "video" | "image" | string;
  name: string;
  size?: string;
  sha256?: string;
  ocrStatus?: "Verified" | "Extracted" | "Pending" | string;
  description?: string;
  timestamp?: string;
  claim?: string;
  sourceUrl?: string;
  sourceArtifactId?: string;
  sourceLocator?: {
    sheetName?: string;
    page?: number;
    row?: number;
    column?: number;
  };
  thumbUrl?: string;
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
  items?: EvidenceItem[];
  onSelectEvidence?: (item: EvidenceItem) => void;
  selectedId?: number | string;
}

export function EvidenceCarousel({ items = defaultEvidenceItems, onSelectEvidence, selectedId }: EvidenceCarouselProps) {
  if (!items) return null;

  if (items.length === 0) {
    return (
      <div className="text-center p-8 text-white/50 border border-white/10 border-dashed rounded-xl w-full bg-[#0A0A0A]">
        <p>No evidence yet. Upload to see carousel.</p>
      </div>
    );
  }

  const canLoop = items.length >= 3;
  
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: canLoop, align: "start" },
    canLoop ? [Autoplay({ delay: 6000, stopOnInteraction: true, stopOnMouseEnter: true })] : []
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const [activeItem, setActiveItem] = useState<EvidenceItem>(items[0]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  const handleSelect = (item: EvidenceItem) => {
    setActiveItem(item);
    if (onSelectEvidence) {
      onSelectEvidence(item);
    }
  };

  const handleOpenSource = (item: EvidenceItem) => {
    if (item.sourceUrl) {
      window.open(item.sourceUrl, "_blank", "noopener,noreferrer");
    }
  };

  const currentSelectedId = selectedId ?? activeItem.id;

  return (
    <div 
      className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-5 backdrop-blur-xl flex flex-col w-full shadow-2xl relative"
      role="region"
      aria-roledescription="carousel"
      aria-label="Evidence gallery"
    >
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {`Slide ${selectedIndex + 1} of ${items.length}`}
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#D4AF37] animate-pulse" />
          <h2 className="text-[11px] font-bold tracking-widest text-white/70 uppercase">
            Interactive Evidence Gallery ({items.length})
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={scrollPrev}
            aria-label="Previous slide"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            onClick={scrollNext}
            aria-label="Next slide"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex space-x-3 pb-2 touch-pan-y">
          {items.map((item) => {
            const isSelected = item.id === currentSelectedId;
            return (
              <div 
                key={item.id} 
                className="flex-[0_0_100%] sm:flex-[0_0_50%] md:flex-[0_0_33.333%] lg:flex-[0_0_25%] min-w-0"
              >
                <Card
                  onClick={() => handleSelect(item)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelect(item);
                    }
                  }}
                  className={`h-[125px] w-full shrink-0 cursor-pointer rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] ${
                    isSelected 
                      ? 'bg-[#174E48]/40 border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.25)] ring-1 ring-[#D4AF37]/50 -translate-y-0.5' 
                      : 'bg-black/60 border-white/10 hover:border-white/30 hover:bg-white/5'
                  }`}
                >
                  <CardContent className="flex flex-col justify-between p-3 h-full relative overflow-hidden">
                    {item.thumbUrl && (
                      <div className="absolute inset-0 z-0 opacity-20">
                        <img 
                          src={item.thumbUrl} 
                          alt="" 
                          loading="lazy" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-between relative z-10">
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
                        {item.ocrStatus || "Pending"}
                      </span>
                    </div>

                    <div className="mt-1 relative z-10">
                      <p className="text-[11px] font-semibold text-white/90 truncate">
                        {item.name}
                      </p>
                      <p className="text-[9px] text-white/40 font-mono mt-0.5">
                        {item.size || "Unknown Size"} • {(item.type || "unknown").toUpperCase()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

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
                {activeItem.claim || activeItem.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowDetailModal(true)}
              aria-haspopup="dialog"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[#D4AF37] text-[11px] font-semibold transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            >
              <Eye size={13} /> Inspect
            </button>
            {activeItem.sourceUrl && (
              <button
                onClick={() => handleOpenSource(activeItem)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#174E48] hover:bg-[#1f665e] border border-transparent text-[#D4AF37] text-[11px] font-semibold transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
              >
                Source View
              </button>
            )}
          </div>
        </div>
      )}

      {showDetailModal && activeItem && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="max-w-lg w-full rounded-2xl border border-white/20 bg-[#0E0E0E] p-6 shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#174E48] text-[#D4AF37]">
                  <FileCode size={20} />
                </div>
                <div>
                  <h3 id="modal-title" className="font-serif font-bold text-white text-base truncate max-w-[280px]">
                    {activeItem.name}
                  </h3>
                  <p className="text-xs text-white/50 font-mono">{activeItem.timestamp || "No timestamp"}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                aria-label="Close dialog"
                className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50"
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
                  {activeItem.claim || activeItem.description}
                </p>
              </div>

              {activeItem.sha256 && (
                <div>
                  <span className="text-white/40 block text-[10px] uppercase tracking-wider font-bold mb-1">
                    Cryptographic SHA-256 Checksum
                  </span>
                  <div className="flex items-center gap-2 bg-black/50 p-3 rounded-xl border border-white/10 font-mono text-[10px] text-[#D4AF37] break-all">
                    <Hash size={14} className="shrink-0 text-white/40" />
                    {activeItem.sha256}
                  </div>
                </div>
              )}

              {activeItem.sourceLocator && (
                <div>
                  <span className="text-white/40 block text-[10px] uppercase tracking-wider font-bold mb-1">
                    Source Locator
                  </span>
                  <div className="flex items-center gap-2 bg-black/50 p-3 rounded-xl border border-white/10 font-mono text-[10px] text-white/80">
                    {activeItem.sourceLocator.sheetName && `Sheet: ${activeItem.sourceLocator.sheetName}`}
                    {activeItem.sourceLocator.page !== undefined && ` | Page: ${activeItem.sourceLocator.page}`}
                    {activeItem.sourceLocator.row !== undefined && ` | Row: ${activeItem.sourceLocator.row}`}
                    {activeItem.sourceLocator.column !== undefined && ` | Col: ${activeItem.sourceLocator.column}`}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-black/40 border border-white/10 p-2.5 rounded-xl">
                  <span className="text-[9px] text-white/40 uppercase block">OCR Ingestion</span>
                  <span className="text-emerald-400 font-semibold text-xs mt-0.5 block flex items-center gap-1">
                    <ShieldCheck size={12} /> {activeItem.ocrStatus || "Pending"}
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

            <div className="pt-2 flex justify-end gap-3">
              {activeItem.sourceUrl && (
                <button
                  onClick={() => handleOpenSource(activeItem)}
                  className="py-2 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition cursor-pointer"
                >
                  Open Source URL
                </button>
              )}
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
