"use client";

import React, { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight, PlayCircle, Clock } from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  progress: number;
  badge: string;
}

const DEFAULT_COURSES: Course[] = [
  {
    id: "course-1",
    title: "Motion Practice for Pro Se",
    description:
      "Draft, serve, and calendar dispositive motions without counsel — templates and court-rule checklists.",
    duration: "42 min",
    progress: 0,
    badge: "Core",
  },
  {
    id: "course-2",
    title: "Evidence Preservation 101",
    description:
      "Chain-of-custody, hash verification, and exhibit packaging that survives discovery challenges.",
    duration: "28 min",
    progress: 15,
    badge: "Evidence",
  },
  {
    id: "course-3",
    title: "Reading a Docket Like Counsel",
    description:
      "Decode entries, deadlines, and clerk notations so nothing critical slips past calendar control.",
    duration: "35 min",
    progress: 0,
    badge: "Docket",
  },
  {
    id: "course-4",
    title: "Hearing Room Protocol",
    description:
      "What to say, when to stand, and how to address the bench without formal bar admission.",
    duration: "22 min",
    progress: 0,
    badge: "Court",
  },
];

interface Props {
  courses?: Course[];
  onSelect?: (id: string) => void;
}

export function FeaturedCoursesCarousel({
  courses,
  onSelect = () => {},
}: Props) {
  const slides = courses && courses.length > 0 ? courses : DEFAULT_COURSES;

  const canLoop = slides.length >= 3;
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: canLoop, align: "start" },
    canLoop
      ? [Autoplay({ delay: 6000, stopOnInteraction: true, stopOnMouseEnter: true })]
      : [],
  );

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (slides.length === 0) {
    return (
      <div className="mb-8 rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-6 text-center text-sm text-white/50">
        No masterclasses scheduled.
      </div>
    );
  }

  return (
    <div
      className="mb-8"
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured Masterclasses"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-white/70">
          Featured Masterclasses
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
          {slides.map((course, index) => (
            <div
              key={course.id}
              className="min-w-0 flex-[0_0_100%] sm:flex-[0_0_66.666%] lg:flex-[0_0_50%]"
              aria-roledescription="slide"
            >
              <div className="sr-only">
                Slide {index + 1} of {slides.length}
              </div>
              <div
                role="button"
                tabIndex={0}
                onClick={() => onSelect(course.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(course.id);
                  }
                }}
                className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-6 transition hover:border-white/20 hover:bg-white/5"
              >
                <div className="pointer-events-none absolute -bottom-10 -right-10 opacity-5 transition-opacity group-hover:opacity-10">
                  <PlayCircle size={160} />
                </div>

                <div className="mb-3 flex items-center gap-2">
                  <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
                    {course.badge}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-white/50">
                    <Clock size={12} /> {course.duration}
                  </div>
                </div>

                <h4 className="mb-2 font-['Fraunces'] text-xl font-semibold text-white">
                  {course.title}
                </h4>
                <p className="mb-6 flex-1 text-sm leading-relaxed text-white/60">
                  {course.description}
                </p>

                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#D4AF37] transition-transform group-hover:translate-x-1">
                    <PlayCircle size={16} /> Start Masterclass
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FeaturedCoursesCarousel;
