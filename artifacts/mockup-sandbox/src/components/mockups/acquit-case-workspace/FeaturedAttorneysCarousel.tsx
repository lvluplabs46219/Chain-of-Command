import React, { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight, MapPin, Award, ExternalLink } from "lucide-react";
import type { LawyerListing } from "./AttorneyDirectory";

interface Props {
  lawyers: LawyerListing[];
}

export function FeaturedAttorneysCarousel({ lawyers = [] }: Props) {
  const featured = lawyers.filter(l => l.listingTier === "premium" || l.listingTier === "featured");
  
  if (featured.length === 0) return null;
  
  const canLoop = featured.length >= 3;
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: canLoop, align: "start" },
    canLoop ? [Autoplay({ delay: 6000, stopOnInteraction: true, stopOnMouseEnter: true })] : []
  );

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <div className="mb-8" role="region" aria-roledescription="carousel" aria-label="Featured Attorneys">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-white/70">Featured Independent Professionals</h3>
        <div className="flex gap-1.5">
          <button onClick={scrollPrev} aria-label="Previous slide" className="p-1 rounded-md hover:bg-white/10 transition cursor-pointer">
            <ChevronLeft size={16} />
          </button>
          <button onClick={scrollNext} aria-label="Next slide" className="p-1 rounded-md hover:bg-white/10 transition cursor-pointer">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex space-x-4 pb-4">
          {featured.map((lawyer, index) => (
            <div key={lawyer.id} className="flex-[0_0_100%] sm:flex-[0_0_50%] md:flex-[0_0_33.333%] min-w-0" aria-roledescription="slide">
              <div className="sr-only">Slide {index + 1} of {featured.length}</div>
              <div className="h-full rounded-2xl border border-[#D4AF37]/30 bg-gradient-to-b from-[#D4AF37]/10 to-transparent p-5 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-[#D4AF37]/5 flex flex-col group">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-12 w-12 rounded-full bg-black/40 border border-[#D4AF37]/30 flex items-center justify-center overflow-hidden shrink-0">
                    <span className="text-sm font-bold text-[#D4AF37]">{lawyer.name.charAt(0)}</span>
                  </div>
                  {lawyer.listingTier === "premium" && (
                    <div className="flex items-center gap-1 rounded-full bg-[#D4AF37]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] border border-[#D4AF37]/20">
                      <Award size={10} /> Premium
                    </div>
                  )}
                </div>
                
                <h4 className="font-['Fraunces'] text-lg font-semibold text-white group-hover:text-[#D4AF37] transition-colors">{lawyer.name}</h4>
                <p className="text-xs text-white/60 mb-3">{lawyer.firmName}</p>
                
                <div className="flex flex-wrap gap-1.5 mb-4 mt-auto">
                  {lawyer.practiceAreas.slice(0, 2).map((area) => (
                    <span key={area} className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] text-white/70">
                      {area}
                    </span>
                  ))}
                  {lawyer.practiceAreas.length > 2 && (
                    <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] text-white/70">
                      +{lawyer.practiceAreas.length - 2}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-1.5 text-[10px] text-white/50 mt-2">
                  <MapPin size={12} />
                  <span>{lawyer.counties[0]} • {lawyer.states[0]}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
