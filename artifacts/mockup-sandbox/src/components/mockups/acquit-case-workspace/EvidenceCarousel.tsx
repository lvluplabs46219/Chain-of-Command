import React, { useRef } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Image as ImageIcon, ChevronLeft, ChevronRight, Play } from "lucide-react";

const evidenceItems = [
  { id: 1, type: "pdf", name: "Exhibit 01.pdf" },
  { id: 2, type: "video", name: "Dashcam.mp4" },
  { id: 3, type: "pdf", name: "Police_Report.pdf" },
  { id: 4, type: "image", name: "Scene_Photo.jpg" },
  { id: 5, type: "pdf", name: "Witness_Statement.pdf" },
  { id: 6, type: "image", name: "Scene_Photo_2.jpg" },
  { id: 7, type: "video", name: "Bodycam_04.mp4" },
];

export function EvidenceCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-2xl p-5 backdrop-blur-xl flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[10px] font-bold tracking-widest text-white/50 uppercase">Evidence Gallery</h2>
        <div className="flex gap-1">
          <button 
            onClick={scrollLeft}
            className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition"
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            onClick={scrollRight}
            className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex w-full space-x-4 overflow-x-auto scrollbar-hide snap-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {evidenceItems.map((item) => (
          <Card
            key={item.id}
            className="w-[140px] h-[100px] bg-black/40 border-white/10 flex-shrink-0 cursor-pointer group hover:border-[#D4AF37]/50 transition-colors snap-start"
          >
            <CardContent className="flex flex-col items-center justify-center p-0 h-full gap-2">
              {item.type === "pdf" ? (
                <FileText
                  size={24}
                  className="text-white/20 group-hover:text-[#D4AF37] transition-colors"
                />
              ) : item.type === "video" ? (
                 <Play
                  size={24}
                  className="text-white/20 group-hover:text-[#D4AF37] transition-colors"
                />
              ) : (
                <ImageIcon
                  size={24}
                  className="text-white/20 group-hover:text-[#D4AF37] transition-colors"
                />
              )}
              <span className="text-[10px] text-white/40 group-hover:text-white/70 truncate w-full px-2 text-center">
                {item.name}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
