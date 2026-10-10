"use client";

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type NavFeatureItem = {
  href: string;
  title: string;
  subtitle: string;
  badge?: string;
};

const DEFAULT_FEATURES: NavFeatureItem[] = [
  {
    href: "/chambers",
    title: "Chambers",
    subtitle: "AI legal team conference room",
    badge: "AI",
  },
  {
    href: "/docket",
    title: "The Docket",
    subtitle: "Active matters & case files",
    badge: "Core",
  },
  {
    href: "/timeline",
    title: "Chronology",
    subtitle: "Case events & deadlines",
  },
  {
    href: "/library",
    title: "Law Library",
    subtitle: "Search the stacks",
  },
  {
    href: "/investigations",
    title: "Investigations",
    subtitle: "Evidence locker & research",
  },
  {
    href: "/draft-desk",
    title: "Draft Desk",
    subtitle: "Motions & filing prep",
  },
  {
    href: "/court-watch",
    title: "Court Watch",
    subtitle: "Hearings & docket activity",
  },
  {
    href: "/archive",
    title: "Design Archive",
    subtitle: "UI blueprint & screen map",
    badge: "Ref",
  },
];

interface NavFeatureCarouselProps {
  items?: NavFeatureItem[];
  className?: string;
}

export function NavFeatureCarousel({
  items = DEFAULT_FEATURES,
  className = "",
}: NavFeatureCarouselProps) {
  const [isHovered, setIsHovered] = useState(false);
  const autoplay = React.useRef(
    Autoplay({ delay: 4500, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", skipSnaps: false },
    [autoplay.current]
  );

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    if (isHovered) {
      autoplay.current.stop();
    } else {
      autoplay.current.play();
    }
  }, [isHovered, emblaApi]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      scrollPrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      scrollNext();
    }
  };

  return (
    <div
      className={`relative flex items-center gap-1.5 min-w-0 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={onKeyDown}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured workspace modules"
    >
      <button
        type="button"
        onClick={scrollPrev}
        aria-label="Previous featured item"
        className="shrink-0 p-1.5 min-w-[32px] min-h-[32px] rounded-md border border-white/15 text-neutral-300 hover:text-[#D4AF37] hover:border-[#D4AF37]/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] flex items-center justify-center"
      >
        <ChevronLeft className="w-4 h-4" aria-hidden />
        <span className="sr-only">Previous</span>
      </button>

      {/* Wider track so full titles (e.g. Design Archive) never ellipsis */}
      <div className="overflow-hidden flex-1 min-w-0 max-w-[320px] sm:max-w-[400px] md:max-w-[480px]" ref={emblaRef}>
        <div className="flex">
          {items.map((item) => (
            <div
              key={item.href}
              className="min-w-0 shrink-0 grow-0 basis-full pl-0"
              role="group"
              aria-roledescription="slide"
            >
              <Link
                href={item.href}
                className="flex flex-col px-4 py-3 rounded-md border border-[#D4AF37]/30 bg-[#D4AF37]/5 hover:border-[#D4AF37]/55 hover:bg-[#D4AF37]/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
              >
                <span className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[12px] font-semibold text-[#D4AF37] whitespace-nowrap">
                    {item.title}
                  </span>
                  {item.badge && (
                    <span className="text-[9px] font-mono uppercase tracking-wider text-emerald-300 bg-emerald-950/50 border border-emerald-500/30 px-1 rounded shrink-0">
                      {item.badge}
                    </span>
                  )}
                </span>
                <span className="text-[11px] text-neutral-400 whitespace-nowrap overflow-hidden text-ellipsis">
                  {item.subtitle}
                </span>
              </Link>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={scrollNext}
        aria-label="Next featured item"
        className="shrink-0 p-1.5 min-w-[32px] min-h-[32px] rounded-md border border-white/15 text-neutral-300 hover:text-[#D4AF37] hover:border-[#D4AF37]/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] flex items-center justify-center"
      >
        <ChevronRight className="w-4 h-4" aria-hidden />
        <span className="sr-only">Next</span>
      </button>
    </div>
  );
}
