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

interface Props {
  courses: Course[];
  onSelect: (id: string) => void;
}

export function FeaturedCoursesCarousel({ courses = [], onSelect = () => {} }: Props) {
  if (courses.length === 0) return null;
  
  const canLoop = courses.length >= 3;
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: canLoop, align: "start" },
    canLoop ? [Autoplay({ delay: 6000, stopOnInteraction: true, stopOnMouseEnter: true })] : []
  );

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <div className="mb-8" role="region" aria-roledescription="carousel" aria-label="Featured Masterclasses">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-white/70">Featured Masterclasses</h3>
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
          {courses.map((course, index) => (
            <div key={course.id} className="flex-[0_0_100%] sm:flex-[0_0_66.666%] lg:flex-[0_0_50%] min-w-0" aria-roledescription="slide">
              <div className="sr-only">Slide {index + 1} of {courses.length}</div>
              <div 
                onClick={() => onSelect(course.id)}
                className="h-full rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-6 transition hover:border-white/20 hover:bg-white/5 cursor-pointer group flex flex-col relative overflow-hidden"
              >
                <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:opacity-10 transition-opacity">
                  <PlayCircle size={160} />
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                  <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">{course.badge}</span>
                  <div className="flex items-center gap-1 text-[10px] text-white/50">
                    <Clock size={12} /> {course.duration}
                  </div>
                </div>
                
                <h4 className="font-['Fraunces'] text-xl font-semibold text-white mb-2">{course.title}</h4>
                <p className="text-sm text-white/60 mb-6 leading-relaxed flex-1">{course.description}</p>
                
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#D4AF37] group-hover:translate-x-1 transition-transform">
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
