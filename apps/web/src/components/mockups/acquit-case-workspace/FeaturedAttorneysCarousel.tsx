"use client";

import React, { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight, MapPin, Award } from "lucide-react";

/** Minimal listing shape — avoids hard fail if AttorneyDirectory types drift. */
export interface LawyerListing {
  id: string;
  name: string;
  firmName: string;
  practiceAreas: string[];
  counties: string[];
  states: string[];
  listingTier: "premium" | "featured" | "standard" | string;
}

const DEFAULT_LAWYERS: LawyerListing[] = [
  {
    id: "atty-1",
    name: "Maya Chen",
    firmName: "Chen & Sovereign Defense",
    practiceAreas: ["Criminal Defense", "Appeals", "Civil Rights"],
    counties: ["San Francisco"],
    states: ["CA"],
    listingTier: "premium",
  },
  {
    id: "atty-2",
    name: "Jordan Hale",
    firmName: "Hale Litigation Group",
    practiceAreas: ["Family Law", "Custody"],
    counties: ["Alameda"],
    states: ["CA"],
    listingTier: "featured",
  },
  {
    id: "atty-3",
    name: "Sam Okonkwo",
    firmName: "Okonkwo & Partners",
    practiceAreas: ["Immigration", "Asylum"],
    counties: ["Santa Clara"],
    states: ["CA"],
    listingTier: "premium",
  },
  {
    id: "atty-4",
    name: "Riley Park",
    firmName: "Park Pro Se Advisors",
    practiceAreas: ["Landlord-Tenant", "Small Claims"],
    counties: ["Los Angeles"],
    states: ["CA"],
    listingTier: "featured",
  },
];

interface Props {
  lawyers?: LawyerListing[];
}

export function FeaturedAttorneysCarousel({ lawyers }: Props) {
  const source = lawyers && lawyers.length > 0 ? lawyers : DEFAULT_LAWYERS;
  const featured = source.filter(
    (l) => l.listingTier === "premium" || l.listingTier === "featured",
  );
  const slides = featured.length > 0 ? featured : source;

  const canLoop = slides.length >= 3;
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: canLoop, align: "start", dragFree: false },
    canLoop
      ? [Autoplay({ delay: 6000, stopOnInteraction: true, stopOnMouseEnter: true })]
      : [],
  );

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (slides.length === 0) {
    return (
      <div className="mb-8 rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-6 text-center text-sm text-white/50">
        No featured attorneys available.
      </div>
    );
  }

  return (
    <div
      className="mb-8"
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured Attorneys"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-white/70">
          Featured Independent Professionals
        </h3>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={scrollPrev}
            aria-label="Previous slide"
            className="cursor-pointer rounded-md p-1 transition hover:bg-white/10"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            aria-label="Next slide"
            className="cursor-pointer rounded-md p-1 transition hover:bg-white/10"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex space-x-4 pb-4">
          {slides.map((lawyer, index) => {
            const areas = Array.isArray(lawyer.practiceAreas)
              ? lawyer.practiceAreas
              : [];
            const counties = Array.isArray(lawyer.counties) ? lawyer.counties : [];
            const states = Array.isArray(lawyer.states) ? lawyer.states : [];

            return (
              <div
                key={lawyer.id}
                className="min-w-0 flex-[0_0_100%] sm:flex-[0_0_50%] md:flex-[0_0_33.333%]"
                aria-roledescription="slide"
              >
                <div className="sr-only">
                  Slide {index + 1} of {slides.length}
                </div>
                <div className="group flex h-full flex-col rounded-2xl border border-[#D4AF37]/30 bg-gradient-to-b from-[#D4AF37]/10 to-transparent p-5 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-[#D4AF37]/5">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#D4AF37]/30 bg-black/40">
                      <span className="text-sm font-bold text-[#D4AF37]">
                        {(lawyer.name || "?").charAt(0)}
                      </span>
                    </div>
                    {lawyer.listingTier === "premium" && (
                      <div className="flex items-center gap-1 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
                        <Award size={10} /> Premium
                      </div>
                    )}
                  </div>

                  <h4 className="font-['Fraunces'] text-lg font-semibold text-white transition-colors group-hover:text-[#D4AF37]">
                    {lawyer.name}
                  </h4>
                  <p className="mb-3 text-xs text-white/60">{lawyer.firmName}</p>

                  <div className="mb-4 mt-auto flex flex-wrap gap-1.5">
                    {areas.slice(0, 2).map((area) => (
                      <span
                        key={area}
                        className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/70"
                      >
                        {area}
                      </span>
                    ))}
                    {areas.length > 2 && (
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/70">
                        +{areas.length - 2}
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex items-center gap-1.5 text-[10px] text-white/50">
                    <MapPin size={12} />
                    <span>
                      {counties[0] || "—"} • {states[0] || "—"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default FeaturedAttorneysCarousel;
