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
    href: "/playground",
    title: "The Wire",
    subtitle: "The Wire — AI Lawyer Swarm & Agent Playground",
    badge: "AI",
  },
  {
    href: "/vericue",
    title: "VeriCue AI",
    subtitle: "Candy Forensic Telemetry Console",
    badge: "CANDY",
  },
  {
    href: "/chambers",
    title: "Chambers",
    subtitle: "Counsel Roster, Conference Room & Brief Board",
    badge: "AI",
  },
  {
    href: "/docket",
    title: "The Docket",
    subtitle: "Docket Entries & Matter Status",
    badge: "Core",
  },
  {
    href: "/timeline",
    title: "Case Timeline",
    subtitle: "Chronology & Case Events",
  },
  {
    href: "/library",
    title: "Law Library",
    subtitle: "Search the Stacks & Open Volumes",
  },
  {
    href: "/investigations",
    title: "Investigations",
    subtitle: "Active Research & Evidence Locker",
  },
  {
    href: "/draft-desk",
    title: "Record Room",
    subtitle: "Filing Table & Draft Desk",
  },
  {
    href: "/court-watch",
    title: "Court Watch",
    subtitle: "Upcoming Appearances & Deadline Engine",
  },
  {
    href: "/directory",
    title: "Counsel Directory",
    subtitle: "Counsel Listings & AI Legal Workers",
  },
  {
    href: "/tasks",
    title: "Motions & Tasks",
    subtitle: "Motion Board & Action Items",
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
      className={`relative flex items-center gap-1 min-w-0 ${className}`}
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
        className="shrink-0 p-1 rounded border border-white/10 text-neutral-400 hover:text-[#D4AF37] hover:border-[#D4AF37]/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>

      <div className="overflow-hidden flex-1 min-w-0 max-w-[280px] sm:max-w-[360px] md:max-w-[420px]" ref={emblaRef}>
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
                className="flex flex-col px-4 py-3 rounded-md border border-[#D4AF37]/25 bg-[#D4AF37]/5 hover:border-[#D4AF37]/45 hover:bg-[#D4AF37]/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
              >
                <span className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-[#D4AF37] truncate">{item.title}</span>
                  {item.badge && (
                    <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-200 bg-zinc-900 border border-zinc-700 px-1 rounded font-semibold">
                      {item.badge}
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-zinc-300 truncate font-medium">{item.subtitle}</span>
              </Link>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={scrollNext}
        aria-label="Next featured item"
        className="shrink-0 p-1 rounded border border-white/10 text-neutral-400 hover:text-[#D4AF37] hover:border-[#D4AF37]/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
      >
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
