import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Cpu } from 'lucide-react';

const LINKS = [
  { to: '/', label: 'Home', tag: '01' },
  { to: '/workspace', label: 'Case Workspace', tag: '02' },
  { to: '/ai-lab', label: 'AI Lab', tag: '03' },
  { to: '/directory', label: 'Attorney Directory', tag: '04' },
  { to: '/academy', label: 'Command Academy', tag: '05' },
  { to: '/filing', label: 'Filing Center', tag: '06' },
  { to: '/library', label: 'Law Library', tag: '07' },
  { to: '/editor', label: 'Document Editor', tag: '08' },
  { to: '/timeline', label: 'Timeline', tag: '09' },
  { to: '/evidence', label: 'Evidence', tag: '10' },
  { to: '/cylinder', label: 'Sovereign Cylinder', tag: '11' },
  { to: '/stitch', label: 'Stitch OS', tag: '12' },
  { to: '/google', label: 'Google Workspace', tag: '13' },
  { to: '/rag', label: 'RAG Viewer', tag: '14' },
  { to: '/chain-of-command', label: 'Chain of Command', tag: '15' },
];

export function Navigation() {
  const location = useLocation();
  const carouselRef = useRef<HTMLDivElement>(null);
  const activeLinkRef = useRef<HTMLAnchorElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);

  const updateScrollState = useCallback(() => {
    if (!carouselRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
  }, []);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [updateScrollState]);

  useEffect(() => {
    if (activeLinkRef.current && carouselRef.current) {
      const container = carouselRef.current;
      const target = activeLinkRef.current;
      const offset =
        target.offsetLeft -
        container.offsetLeft -
        (container.clientWidth / 2 - target.clientWidth / 2);

      container.scrollTo({
        left: Math.max(0, offset),
        behavior: 'smooth',
      });
    }
  }, [location.pathname]);

  const scrollByDelta = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const delta = direction === 'left' ? -260 : 260;
    carouselRef.current.scrollBy({ left: delta, behavior: 'smooth' });
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!carouselRef.current) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      carouselRef.current.scrollLeft += e.deltaY * 0.9;
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!carouselRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - carouselRef.current.offsetLeft;
    scrollLeftStart.current = carouselRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging.current || !carouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.4;
    carouselRef.current.scrollLeft = scrollLeftStart.current - walk;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const activeIndex = Math.max(
    0,
    LINKS.findIndex((link) => link.to === location.pathname)
  );

  return (
    <nav
      aria-label="Chain of Command 2D Web3 Navigation Carousel"
      className="bg-[#090A0D]/95 border-b border-[#1E2028] backdrop-blur-md sticky top-0 w-full z-50 select-none"
    >
      {/* HUD Telemetry Strip */}
      <div className="flex items-center justify-between px-3 md:px-4 py-1 border-b border-white/[0.04] bg-[#0C0D12]/70 text-[10px] font-mono tracking-wider">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#174E48]/30 border border-[#174E48]/60 text-[#34D399]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
            <span className="font-semibold uppercase">0xCHAIN // 2D CAROUSEL</span>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-neutral-500">
            <Cpu className="w-3 h-3 text-[#D4AF37]" />
            <span>SURFACE:</span>
            <span className="text-[#D4AF37] font-semibold">{LINKS[activeIndex]?.label.toUpperCase()}</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => scrollByDelta('left')}
            disabled={!canScrollLeft}
            aria-label="Carousel Left"
            className={`p-1 rounded border transition-all ${
              canScrollLeft
                ? 'border-[#D4AF37]/40 bg-[#161820] text-[#D4AF37] hover:bg-[#D4AF37]/20 hover:border-[#D4AF37] cursor-pointer'
                : 'border-white/5 bg-transparent text-neutral-600 cursor-not-allowed opacity-40'
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => scrollByDelta('right')}
            disabled={!canScrollRight}
            aria-label="Carousel Right"
            className={`p-1 rounded border transition-all ${
              canScrollRight
                ? 'border-[#D4AF37]/40 bg-[#161820] text-[#D4AF37] hover:bg-[#D4AF37]/20 hover:border-[#D4AF37] cursor-pointer'
                : 'border-white/5 bg-transparent text-neutral-600 cursor-not-allowed opacity-40'
            }`}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2D Carousel Slider Track - No Scrollbars */}
      <div
        ref={carouselRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="flex items-center gap-2 overflow-x-auto whitespace-nowrap hide-scrollbar no-scrollbar py-2 px-3 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {LINKS.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              ref={isActive ? activeLinkRef : undefined}
              className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-[#D4AF37]/20 via-[#1A1813] to-[#121318] border-[#D4AF37] text-white shadow-[0_0_18px_rgba(212,175,55,0.25)] ring-1 ring-[#D4AF37]/30'
                  : 'bg-[#111217]/85 border-[#20222B] text-neutral-400 hover:text-neutral-100 hover:border-[#D4AF37]/40 hover:bg-[#161820]'
              }`}
            >
              <span className={`text-[9px] ${isActive ? 'text-[#D4AF37] font-bold' : 'text-neutral-500'}`}>
                {link.tag}
              </span>
              <span>{link.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_6px_#D4AF37] animate-ping" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
