"use client";

import React, { useCallback, useEffect, useState } from "react";
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
  X,
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
    timestamp: "2024-05-12 23:45:10 EST",
  },
  {
    id: 2,
    type: "video",
    name: "Dashcam_RearView.mp4",
    size: "148 MB",
    sha256: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
    ocrStatus: "Extracted",
    description: "High-definition cruiser dashcam video showing road center line.",
    timestamp: "2024-05-12 23:44:00 EST",
  },
  {
    id: 3,
    type: "pdf",
    name: "Police_Narrative_Report.pdf",
    size: "1.1 MB",
    sha256: "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb",
    ocrStatus: "Verified",
    description: "Arresting officer's sworn narrative affidavit filed with Marion Superior.",
    timestamp: "2024-05-13 02:15:00 EST",
  },
  {
    id: 4,
    type: "image",
    name: "Intersection_Scene_Photo.jpg",
    size: "4.8 MB",
    sha256: "185f8db32271fe25f561a6fc938b2e264306ec304eda518007d1764826381969",
    ocrStatus: "Extracted",
    description: "Streetlight illumination and lane divider weather photo at stop.",
    timestamp: "2024-05-13 00:30:22 EST",
  },
  {
    id: 5,
    type: "pdf",
    name: "Witness_Affidavit_JaneDoe.pdf",
    size: "820 KB",
    sha256: "3c59dc048e8850243be8079a5c74d079abb2b8c617da51120e747da4f124f34f",
    ocrStatus: "Verified",
    description: "Sworn bystander deposition regarding vehicle movement.",
    timestamp: "2024-05-14 14:20:00 EST",
  },
  {
    id: 6,
    type: "image",
    name: "Radar_Calibration_Sticker.jpg",
    size: "2.1 MB",
    sha256: "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
    ocrStatus: "Verified",
    description: "Equipment calibration decal showing 45-day inspection lapse.",
    timestamp: "2024-05-15 10:15:00 EST",
  },
  {
    id: 7,
    type: "video",
    name: "Bodycam_Officer_04.mp4",
    size: "312 MB",
    sha256: "ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d",
    ocrStatus: "Extracted",
    description: "Full audio/video of field sobriety instructions and response.",
    timestamp: "2024-05-12 23:46:18 EST",
  },
];

interface EvidenceCarouselProps {
  items?: EvidenceItem[];
  onSelectEvidence?: (item: EvidenceItem) => void;
  selectedId?: number | string;
}

export function EvidenceCarousel({
  items = defaultEvidenceItems,
  onSelectEvidence,
  selectedId,
}: EvidenceCarouselProps) {
  const safeItems = items ?? defaultEvidenceItems;
  const canLoop = safeItems.length >= 3;

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: canLoop, align: "start" },
    canLoop
      ? [Autoplay({ delay: 6000, stopOnInteraction: true, stopOnMouseEnter: true })]
      : [],
  );

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const [activeItem, setActiveItem] = useState<EvidenceItem | null>(
    safeItems[0] ?? null,
  );
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

  if (safeItems.length === 0) {
    return (
      <div className="w-full rounded-xl border border-dashed border-white/10 bg-[#0A0A0A] p-8 text-center text-white/50">
        <p>No evidence yet. Upload to see carousel.</p>
      </div>
    );
  }

  const handleSelect = (item: EvidenceItem) => {
    setActiveItem(item);
    onSelectEvidence?.(item);
  };

  const handleOpenSource = (item: EvidenceItem) => {
    if (item.sourceUrl) {
      window.open(item.sourceUrl, "_blank", "noopener,noreferrer");
    }
  };

  const currentSelectedId = selectedId ?? activeItem?.id;

  return (
    <div
      className="relative flex w-full flex-col rounded-2xl border border-white/10 bg-[#0A0A0A] p-5 shadow-2xl backdrop-blur-xl"
      role="region"
      aria-roledescription="carousel"
      aria-label="Evidence gallery"
    >
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {`Slide ${selectedIndex + 1} of ${safeItems.length}`}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#D4AF37]" />
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-white/70">
            Interactive Evidence Gallery ({safeItems.length})
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={scrollPrev}
            aria-label="Previous slide"
            className="cursor-pointer rounded-lg border border-white/10 bg-white/5 p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] active:scale-95"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            aria-label="Next slide"
            className="cursor-pointer rounded-lg border border-white/10 bg-white/5 p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] active:scale-95"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-y space-x-3 pb-2">
          {safeItems.map((item) => {
            const isSelected = item.id === currentSelectedId;
            return (
              <div
                key={item.id}
                className="min-w-0 flex-[0_0_100%] sm:flex-[0_0_50%] md:flex-[0_0_33.333%] lg:flex-[0_0_25%]"
              >
                <Card
                  onClick={() => handleSelect(item)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSelect(item);
                    }
                  }}
                  className={`h-[125px] w-full shrink-0 cursor-pointer rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] ${
                    isSelected
                      ? "-translate-y-0.5 border-[#D4AF37] bg-[#174E48]/40 shadow-[0_0_15px_rgba(212,175,55,0.25)] ring-1 ring-[#D4AF37]/50"
                      : "border-white/10 bg-black/60 hover:border-white/30 hover:bg-white/5"
                  }`}
                >
                  <CardContent className="relative flex h-full flex-col justify-between overflow-hidden p-3">
                    {item.thumbUrl && (
                      <div className="absolute inset-0 z-0 opacity-20">
                        <img
                          src={item.thumbUrl}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div className="relative z-10 flex items-center justify-between">
                      <div
                        className={`rounded-lg p-1.5 ${
                          isSelected
                            ? "bg-[#D4AF37]/20 text-[#D4AF37]"
                            : "bg-white/5 text-white/40"
                        }`}
                      >
                        {item.type === "pdf" ? (
                          <FileText size={16} />
                        ) : item.type === "video" ? (
                          <Play size={16} />
                        ) : (
                          <ImageIcon size={16} />
                        )}
                      </div>
                      <span
                        className={`rounded border px-1.5 py-0.5 font-mono text-[9px] ${
                          item.ocrStatus === "Verified"
                            ? "border-emerald-500/30 bg-emerald-950/40 text-emerald-400"
                            : "border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37]"
                        }`}
                      >
                        {item.ocrStatus || "Pending"}
                      </span>
                    </div>

                    <div className="relative z-10 mt-1">
                      <p className="truncate text-[11px] font-semibold text-white/90">
                        {item.name}
                      </p>
                      <p className="mt-0.5 font-mono text-[9px] text-white/40">
                        {item.size || "Unknown Size"} •{" "}
                        {(item.type || "unknown").toUpperCase()}
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
        <div className="mt-3 flex flex-col justify-between gap-3 rounded-xl border-t border-white/10 bg-white/[0.02] p-3 pt-3 text-xs sm:flex-row sm:items-center">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="shrink-0 rounded-lg border border-[#174E48] bg-[#174E48]/30 p-2 text-[#D4AF37]">
              <ShieldCheck size={18} />
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-2">
                <span className="truncate font-semibold text-white">
                  {activeItem.name}
                </span>
                <span className="font-mono text-[10px] text-white/40">
                  ({activeItem.size})
                </span>
              </div>
              <p className="mt-0.5 truncate font-sans text-[10px] text-white/60">
                {activeItem.claim || activeItem.description}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setShowDetailModal(true)}
              aria-haspopup="dialog"
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-[#D4AF37] transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            >
              <Eye size={13} /> Inspect
            </button>
            {activeItem.sourceUrl && (
              <button
                type="button"
                onClick={() => handleOpenSource(activeItem)}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-transparent bg-[#174E48] px-3 py-1.5 text-[11px] font-semibold text-[#D4AF37] transition hover:bg-[#1f665e] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
              >
                Source View
              </button>
            )}
          </div>
        </div>
      )}

      {showDetailModal && activeItem && (
        <div
          className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/80 p-4 fade-in duration-200 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="relative w-full max-w-lg space-y-4 rounded-2xl border border-white/20 bg-[#0E0E0E] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#174E48] p-2 text-[#D4AF37]">
                  <FileCode size={20} />
                </div>
                <div>
                  <h3
                    id="modal-title"
                    className="max-w-[280px] truncate font-serif text-base font-bold text-white"
                  >
                    {activeItem.name}
                  </h3>
                  <p className="font-mono text-xs text-white/50">
                    {activeItem.timestamp || "No timestamp"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                aria-label="Close dialog"
                className="cursor-pointer rounded-lg p-1 text-white/50 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-white/40">
                  Evidence Description
                </span>
                <p className="rounded-xl border border-white/10 bg-black/50 p-3 font-sans leading-relaxed text-white/80">
                  {activeItem.claim || activeItem.description}
                </p>
              </div>

              {activeItem.sha256 && (
                <div>
                  <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-white/40">
                    Cryptographic SHA-256 Checksum
                  </span>
                  <div className="flex items-center gap-2 break-all rounded-xl border border-white/10 bg-black/50 p-3 font-mono text-[10px] text-[#D4AF37]">
                    <Hash size={14} className="shrink-0 text-white/40" />
                    {activeItem.sha256}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="rounded-xl border border-white/10 bg-black/40 p-2.5">
                  <span className="block text-[9px] uppercase text-white/40">
                    OCR Ingestion
                  </span>
                  <span className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-emerald-400">
                    <ShieldCheck size={12} /> {activeItem.ocrStatus || "Pending"}
                  </span>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/40 p-2.5">
                  <span className="block text-[9px] uppercase text-white/40">
                    Chain of Custody
                  </span>
                  <span className="mt-0.5 block text-xs font-semibold text-[#D4AF37]">
                    Verified Sovereign
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="cursor-pointer rounded-xl bg-[#174E48] px-5 py-2 text-xs font-semibold text-[#D4AF37] shadow-lg transition hover:bg-[#1f665e]"
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

export default EvidenceCarousel;
