import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';

const INITIAL_CARDS = [
  { id: '01', title: 'Police Report', type: 'EVIDENCE • INCIDENT', cid: 'bafybeihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku', status: 'GROUNDED', lines: ['CASE #2024-1847', 'OFFICER J. REYES', 'INCIDENT AT 22:47'] },
  { id: '02', title: 'Incident Report', type: 'EVIDENCE • FIELD', cid: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi', status: 'VERIFIED', lines: ['LOCATION REDACTED', 'WITNESS A / B', 'TIMELINE LOG'] },
  { id: '03', title: 'Affidavit', type: 'SWORN • NOTARIZED', cid: 'bafybeihx7r2p7k6q5a9z8l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d', status: 'ATTESTED', lines: ['STATE OF CALIFORNIA', 'SS. COUNTY OF LOS', 'DEPONENT: ██████'] },
  { id: '04', title: 'Motion to Dismiss', type: 'PLEADING • 12(b)(6)', cid: 'bafybeie5g5h6j7k8l9m0n1o2p3q4r5s6t7u8v9w0x1y2z3a4b5c6d7e8f9', status: 'PINNED', lines: ['MEMORANDUM OF POINTS', 'AUTHORITIES CITED', 'RELIEF REQUESTED'] },
  { id: '05', title: 'Answer', type: 'PLEADING • RESPONSE', cid: 'bafybeic3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e', status: 'GROUNDED', lines: ['GENERAL DENIAL', 'AFFIRMATIVE DEFENSES', 'PRAYER FOR RELIEF'] },
  { id: '06', title: 'Exhibit A', type: 'EXHIBIT • CONTRACT', cid: 'bafybeif1g2h3i4j5k6l7m8n9o0p1q2r3s4t5u6v7w8x9y0z1a2b3c4d5e6', status: 'VERIFIED', lines: ['EXHIBIT STAMP', 'EXECUTED 03.12.24', 'PAGE 1 OF 14'] },
  { id: '07', title: 'Exhibit B', type: 'EXHIBIT • PHOTO LOG', cid: 'bafybeig7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2', status: 'GROUNDED', lines: ['CHAIN OF CUSTODY', 'IMG_8847.CR2', 'HASH: a3f9...9c2d'] },
  { id: '08', title: 'Discovery', type: 'REQUEST • RFP', cid: 'bafybeih9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3', status: 'PINNED', lines: ['REQUEST NO. 1-27', 'PRIVILEGE LOG', 'PRODUCTION DUE'] },
  { id: '09', title: 'Subpoena', type: 'PROCESS • DUCES TECUM', cid: 'bafybeia1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5', status: 'ATTESTED', lines: ['YOU ARE COMMANDED', 'TO APPEAR & PRODUCE', 'FAIL NOT AT PERIL'] },
  { id: '10', title: 'Deposition', type: 'TESTIMONY • TRANSCRIPT', cid: 'bafybeib2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3', status: 'VERIFIED', lines: ['VOLUME I - PAGES 1-189', 'WITNESS: ██████', 'CERTIFIED COPY'] },
  { id: '11', title: 'Court Order', type: 'ORDER • SIGNED', cid: 'bafybeic3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2', status: 'GROUNDED', lines: ['IT IS HEREBY ORDERED', 'JUDGE M. HOLLOWAY', 'ENTERED 04.02.25'] },
  { id: '12', title: 'Filing Receipt', type: 'CLERK • E-FILED', cid: 'bafybeid4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5', status: 'PINNED', lines: ['E-FILING ID 8847291', 'FEE PAID $435.00', 'TIMESTAMP UTC'] }
];

export function SovereignCylinder() {
  const [mode, setMode] = useState("CYLINDER");
  const [cards, setCards] = useState(INITIAL_CARDS);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus("Extracting & Analyzing...");
    
    const formData = new FormData();
    formData.append("document", file);
    formData.append("caseId", "demo-case-123");

    try {
      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      
      if (res.ok) {
        setUploadStatus("Ingestion Complete");
        setTimeout(() => setUploadStatus(""), 2000);
        
        const newCard = {
          id: `0${cards.length + 1}`.slice(-2),
          title: file.name.substring(0, 18),
          type: "USER • UPLOADED",
          cid: data.documentId || `doc-${Date.now()}`,
          status: "INDEXED",
          lines: [
            `CHUNKS: ${data.chunksProcessed}`,
            data.analysis ? data.analysis.substring(0, 20) : "ANALYSIS DONE",
            "VECTOR RAG READY"
          ]
        };
        setCards(prev => [...prev, newCard]);
      } else {
        setUploadStatus("Error: " + data.error);
        setTimeout(() => setUploadStatus(""), 3000);
      }
    } catch (err) {
      console.error(err);
      setUploadStatus("Network Error");
      setTimeout(() => setUploadStatus(""), 3000);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };
  const [rotation, setRotation] = useState(-10);
  const [autoplay, setAutoplay] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef(rotation);
  const velocityRef = useRef(0);
  const lastXRef = useRef(0);
  const inertiaRafRef = useRef<number>(0);
  const autoplayRafRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    rotationRef.current = rotation;
  }, [rotation]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    
    let width = canvas.width = window.innerWidth * (window.devicePixelRatio || 1);
    let height = canvas.height = window.innerHeight * (window.devicePixelRatio || 1);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    
    const dpr = window.devicePixelRatio || 1;
    const particles = Array.from({ length: isMobile ? 70 : 140 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.4 + 0.2,
      vx: (Math.random() - 0.5) * 0.12 * dpr,
      vy: (Math.random() - 0.5) * 0.18 * dpr,
      a: Math.random() * 0.6 + 0.15,
      tw: Math.random() * Math.PI * 2
    }));
    
    let animationId = 0;
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      for (let p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.tw += 0.012;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        
        const alpha = p.a * (0.6 + Math.sin(p.tw) * 0.4);
        ctx.beginPath();
        ctx.fillStyle = `rgba(212,175,55,${alpha})`;
        ctx.shadowBlur = 6 * dpr;
        ctx.shadowColor = "rgba(212,175,55,0.8)";
        ctx.arc(p.x, p.y, p.r * dpr, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      animationId = requestAnimationFrame(render);
    };
    render();
    
    const handleResize = () => {
      width = canvas.width = window.innerWidth * dpr;
      height = canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
    };
    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, [isMobile]);

  const snapToNearest = () => {
    cancelAnimationFrame(inertiaRafRef.current);
    const loop = () => {
      velocityRef.current *= 0.94;
      if (Math.abs(velocityRef.current) < 0.02) {
        const step = 360 / cards.length;
        const target = Math.round(rotationRef.current / step) * step;
        const diff = target - rotationRef.current;
        if (Math.abs(diff) < 0.05) {
          setRotation(target);
          rotationRef.current = target;
          return;
        }
        rotationRef.current += diff * 0.15;
        setRotation(rotationRef.current);
        inertiaRafRef.current = requestAnimationFrame(loop);
        return;
      }
      rotationRef.current += velocityRef.current;
      setRotation(rotationRef.current);
      inertiaRafRef.current = requestAnimationFrame(loop);
    };
    inertiaRafRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    if (!autoplay || isDragging) return;
    let lastTime = performance.now();
    const loop = (time: number) => {
      const dt = Math.min(32, time - lastTime) / 16.666;
      lastTime = time;
      if (mode === "CYLINDER" || mode === "HELIX") {
        rotationRef.current += 0.18 * dt;
        setRotation(rotationRef.current);
      }
      autoplayRafRef.current = requestAnimationFrame(loop);
    };
    autoplayRafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(autoplayRafRef.current);
  }, [autoplay, isDragging, mode]);

  const activeIndex = useMemo(() => {
    const step = 360 / cards.length;
    let idx = Math.round(-rotation / step) % cards.length;
    if (idx < 0) idx += cards.length;
    return idx;
  }, [rotation]);

  const activeCard = JUSTICE_CARDS[activeIndex];

  const handlePointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    cancelAnimationFrame(inertiaRafRef.current);
    cancelAnimationFrame(autoplayRafRef.current);
    lastXRef.current = e.clientX;
    velocityRef.current = 0;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - lastXRef.current;
    lastXRef.current = e.clientX;
    const friction = isMobile ? 0.45 : 0.35;
    velocityRef.current = dx * friction;
    rotationRef.current += dx * friction;
    setRotation(rotationRef.current);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
    setIsDragging(false);
    snapToNearest();
  };

  const handleWheel = (e: React.WheelEvent) => {
    const dy = e.deltaY * 0.08;
    rotationRef.current += dy;
    setRotation(rotationRef.current);
    velocityRef.current = dy;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        rotationRef.current += 30;
        setRotation(rotationRef.current);
        velocityRef.current = 0;
      }
      if (e.key === "ArrowRight") {
        rotationRef.current -= 30;
        setRotation(rotationRef.current);
        velocityRef.current = 0;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const Z_DISTANCE = isMobile ? 240 : 420;
  const PERSPECTIVE = isMobile ? 900 : 1200;

  const getDistanceToFront = (idx: number) => {
    const step = 360 / cards.length;
    const angle = ((idx * step + rotation) % 360 + 540) % 360 - 180;
    return Math.abs(angle);
  };

  return (
    <div className="relative min-h-[800px] w-full overflow-hidden bg-[rgba(255,255,255,0.03)] text-white selection:bg-[rgba(255,255,255,0.03)]/30" style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}>
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-0 opacity-[0.9]" />
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(212,175,55,0.12),transparent_60%),radial-gradient(40%_40%_at_90%_80%,rgba(96,120,255,0.07),transparent),radial-gradient(50%_50%_at_10%_90%,rgba(212,175,55,0.06),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(10,10,10,0.2),rgba(10,10,10,0.9))]" />
      </div>

      <header className="relative z-20 w-full px-4 sm:px-8 pt-4 sm:pt-6">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[16px] font-serif text-white/70">ACQUIT.AI</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="grid h-9 w-9 place-items-center rounded-full bg-[rgba(255,255,255,0.08)] ring-1 ring-white/10 text-[14px]">…</button>
          </div>
        </div>

        <div className="mx-auto mt-6 sm:mt-8 flex max-w-[1600px] flex-col gap-5">
          {/* Document Intelligence Pipeline Upload */}
          <div className="flex justify-between items-center w-full">
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.doc,.docx,.txt" />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2 bg-[rgba(255,255,255,0.03)]/10 hover:bg-[rgba(255,255,255,0.03)]/20 border border-white/10/30 text-white/70 px-4 py-2 rounded-full text-xs font-semibold tracking-wider transition-all disabled:opacity-50"
            >
              {isUploading ? (
                <><span className="animate-pulse">●</span> {uploadStatus}</>
              ) : (
                <>+ INGEST DOCUMENT</>
              )}
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-[10px] bg-[rgba(255,255,255,0.03)] text-black grid place-items-center font-black text-[14px] shadow-[0_0_20px_rgba(212,175,55,0.35)]">A</div>
            <span className="text-[11px] sm:text-[12px] tracking-[0.18em] text-white/50">ACQUIT.AI — SOVEREIGN</span>
            <div className="h-px w-6 bg-white/5/10 hidden sm:block" />
            <div className="flex flex-wrap items-baseline gap-2 text-[18px] sm:text-[22px] leading-none tracking-[-0.02em]" style={{ fontFamily: "'Instrument Serif','Playfair Display', Georgia, serif" }}>
              <span className="text-white/70 font-[500]">EVIDENCE LAB</span>
              <span className="text-white/90 font-light">—</span>
              <span className="text-white/70 font-light italic">Pick Your Hero</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {["CYLINDER", "COVERFLOW", "HELIX", "STACK"].map(m => (
              <button 
                key={m} 
                onClick={() => setMode(m)} 
                className={`rounded-full px-4 sm:px-5 py-[7px] text-[11px] tracking-[0.14em] transition-all duration-300 ring-1 ${mode === m ? "bg-[rgba(255,255,255,0.03)] text-black ring-[#D4AF37] shadow-[0_0_30px_rgba(212,175,55,0.35)]" : "bg-[rgba(255,255,255,0.06)] text-white/60 ring-white/10 hover:text-white/90 hover:bg-white/5/10"}`}
              >
                {m}
              </button>
            ))}
            <div className="ml-1 sm:ml-3 inline-flex items-center rounded-full border border-[rgba(212,175,55,0.25)] bg-[rgba(212,175,55,0.08)] px-3 sm:px-4 py-[6px] text-[10px] tracking-[0.14em] text-white/70/90 backdrop-blur">
              PREMIUM • 12 DOCUMENTS • 60FPS GPU
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button onClick={() => setAutoplay(!autoplay)} className={`rounded-full px-3 py-1.5 text-[10px] tracking-widest ring-1 transition ${autoplay ? "bg-white/5 text-black ring-white" : "bg-white/5/10 text-white/60 ring-white/10"}`}>
                {autoplay ? "AUTOPLAY ON" : "AUTOPLAY OFF"}
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className="relative z-10 mx-auto mt-6 sm:mt-10 w-full max-w-[1600px] select-none" style={{ touchAction: "pan-y" }}>
        <div ref={containerRef} className="relative mx-auto h-[520px] sm:h-[640px] w-full overflow-visible" style={{ perspective: `${PERSPECTIVE}px`, perspectiveOrigin: "50% 46%" }} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp} onWheel={handleWheel}>
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[1px] w-[86%] -translate-x-1/2 -translate-y-[180px] bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent blur-[0.5px]" />
          
          <div className="absolute left-1/2 top-[46%] will-change-transform" style={{ transformStyle: "preserve-3d", transform: mode === "CYLINDER" || mode === "HELIX" ? `translate3d(-50%,-50%, -${Z_DISTANCE}px) rotateY(${rotation}deg)` : "translate3d(-50%,-50%,0px)", transition: isDragging ? "none" : "transform 600ms cubic-bezier(0.16,1,0.3,1)" }}>
            {cards.map((card, idx) => {
              const dist = getDistanceToFront(idx);
              const isFront = dist < 18;
              const isNear = dist < 45;
              
              let scale = 0.82;
              let opacity = 0.58;
              let blur = 1;
              let brightness = 0.9;
              let yOffset = 0;

              if (isFront) {
                scale = 1.15; opacity = 1; blur = 0; brightness = 1.12; yOffset = 40;
              } else if (isNear) {
                const ratio = 1 - dist / 60;
                scale = 0.82 + ratio * 0.28;
                opacity = 0.58 + ratio * 0.42;
                blur = (1 - ratio) * 1;
                brightness = 0.9 + ratio * 0.18;
              }

              let transformStr = "";
              const angleStep = 360 / cards.length;

              if (mode === "CYLINDER") {
                transformStr = `rotateY(${idx * angleStep}deg) translateZ(${Z_DISTANCE}px) translate3d(0,0,${yOffset}px)`;
              } else if (mode === "COVERFLOW") {
                let offsetIdx = idx - activeIndex;
                if (offsetIdx > cards.length / 2) offsetIdx -= cards.length;
                if (offsetIdx < -cards.length / 2) offsetIdx += cards.length;
                
                const tx = offsetIdx * (isMobile ? 150 : 210);
                const tz = -Math.abs(offsetIdx) * (isMobile ? 70 : 110) + (isFront ? 120 : 0);
                const ry = -offsetIdx * 28;
                transformStr = `translate3d(${tx}px,0,${tz}px) rotateY(${ry}deg)`;
              } else if (mode === "HELIX") {
                const ty = (idx - cards.length / 2) * 34;
                transformStr = `rotateY(${idx * angleStep}deg) translateZ(${isMobile ? 260 : 380}px) translateY(${ty}px)`;
              } else {
                const tz = (cards.length - idx) * -14 + (isFront ? 100 : 0);
                const tx = (idx % 3) * 7;
                const ty = (idx % 2) * 6;
                const rz = (idx - 6) * 0.9;
                transformStr = `translate3d(${tx}px,${ty}px,${tz}px) rotateZ(${rz}deg)`;
              }

              return (
                <div key={card.id} className="absolute left-0 top-0 will-change-transform" style={{ transformStyle: "preserve-3d", transform: `${transformStr} scale(${scale})`, opacity, filter: `blur(${blur}px) brightness(${brightness})`, transition: isDragging ? "none" : "transform 650ms cubic-bezier(0.16,1,0.3,1), opacity 400ms, filter 400ms" }}>
                  <div className="relative" style={{ width: isMobile ? 190 : 220, height: isMobile ? 300 : 340, marginLeft: isMobile ? -95 : -110, marginTop: isMobile ? -150 : -170, borderRadius: 16, background: "rgba(255,255,255,0.06)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(212,175,55,0.30)", boxShadow: isFront ? "0 0 40px rgba(212,175,55,0.40), inset 0 1px 0 rgba(255,255,255,0.18), inset 0 0 30px rgba(212,175,55,0.12)" : "inset 0 1px 0 rgba(255,255,255,0.12), 0 10px 30px rgba(0,0,0,0.6)", overflow: "hidden", transform: "translateZ(0)" }}>
                    <div className="pointer-events-none absolute inset-[8px] rounded-[10px]" style={{ border: "1px solid rgba(212,175,55,0.40)", boxShadow: "inset 0 0 0 1px rgba(212,175,55,0.08)" }} />
                    <div className="pointer-events-none absolute left-[12px] top-[12px] h-[5px] w-[5px] rotate-45 bg-[rgba(255,255,255,0.03)]/60" />
                    <div className="pointer-events-none absolute right-[12px] top-[12px] h-[5px] w-[5px] rotate-45 bg-[rgba(255,255,255,0.03)]/60" />
                    <div className="pointer-events-none absolute left-[12px] bottom-[12px] h-[5px] w-[5px] rotate-45 bg-[rgba(255,255,255,0.03)]/60" />
                    <div className="pointer-events-none absolute right-[12px] bottom-[12px] h-[5px] w-[5px] rotate-45 bg-[rgba(255,255,255,0.03)]/60" />
                    
                    <div className="absolute left-0 right-0 top-[16px] flex justify-center">
                      <div className="grid h-[28px] w-[28px] place-items-center rounded-full bg-[rgba(212,175,55,0.10)] ring-1 ring-[#D4AF37]/30">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-white/70">
                          <path d="M12 3v18M12 7L5 9l2 7h10l2-7-7-2zM5 9H3l2 7h2M19 9h2l-2 7h-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                          <circle cx="12" cy="3" r="1.2" fill="currentColor" />
                        </svg>
                      </div>
                    </div>

                    <div className="absolute left-1/2 top-[46%] h-[150px] w-[120px] -translate-x-1/2 -translate-y-1/2">
                      {[0, 1, 2].map((layer) => (
                        <div key={layer} className="absolute left-0 top-0 h-[124px] w-[96px] rounded-[4px] bg-white/5/90 shadow-[0_4px_18px_rgba(0,0,0,0.35)]" style={{ transform: `rotate(${(layer - 1) * 4.5}deg) translate(${layer * 8}px, ${layer * 6}px)`, opacity: 0.92 - layer * 0.14 }}>
                          <div className="p-[8px] space-y-[5px]">
                            <div className="h-[2px] w-[70%] bg-black/20 rounded" />
                            <div className="h-[2px] w-[90%] bg-black/15 rounded" />
                            <div className="h-[2px] w-[82%] bg-black/15 rounded" />
                            <div className="h-[2px] w-[58%] bg-black/10 rounded" />
                            <div className="mt-2 h-[1px] w-full bg-black/10" />
                            <div className="space-y-[3px] pt-1">
                              {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="h-[1.5px] bg-black/12 rounded" style={{ width: `${72 + Math.sin(i) * 18}%` }} />
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="pointer-events-none absolute -right-6 -top-2 h-20 w-20 rounded-full bg-[radial-gradient(60%_60%_at_50%_50%,rgba(96,140,255,0.18),transparent_70%)] blur-[1px]" />
                    </div>

                    <div className="absolute bottom-[44px] left-1/2 -translate-x-1/2">
                      <div className="grid h-[44px] w-[44px] place-items-center rounded-full" style={{ background: "radial-gradient(70% 70% at 35% 30%, #F3D07A 0%, #D4AF37 32%, #8C6A10 78%, #5A4308 100%)", boxShadow: "0 2px 10px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.6), inset 0 -2px 4px rgba(0,0,0,0.4)", border: "1px solid rgba(90,67,8,0.8)" }}>
                        <span className="text-[11px] font-black tracking-widest text-white/70">A</span>
                      </div>
                      <div className="mx-auto mt-[2px] h-[8px] w-[28px] rounded-full bg-black/30 blur-[2px]" />
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 flex h-[36px] items-center justify-center border-t border-[rgba(212,175,55,0.18)] bg-[rgba(10,10,10,0.55)] backdrop-blur">
                      <span className="text-[10px] tracking-[0.16em] text-white/70">{card.title.toUpperCase()}</span>
                    </div>

                    {isFront && <div className="pointer-events-none absolute inset-0 rounded-[16px] shadow-[inset_0_0_40px_rgba(212,175,55,0.18)]" />}
                  </div>

                  <div className="pointer-events-none absolute left-1/2 top-[100%] h-[120px] w-[200px] -translate-x-1/2" style={{ background: "linear-gradient(to bottom, rgba(212,175,55,0.18), transparent 70%)", filter: "blur(6px)", transform: "scaleY(-0.55) translateY(-10px)", opacity: isFront ? 0.35 : 0.12, maskImage: "linear-gradient(to bottom, black 0%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 100%)", borderRadius: 16 }} />
                </div>
              );
            })}
          </div>
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="h-[420px] w-[1px] bg-gradient-to-b from-transparent via-white/5 to-transparent" />
          </div>
          <div className="pointer-events-none absolute bottom-[56px] left-1/2 -translate-x-1/2 text-[10px] tracking-[0.2em] text-white/25">
            ← DRAG / WHEEL / ARROWS →
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-[1600px] px-4 sm:px-8 pb-10 sm:pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-4 sm:gap-5">
          <div className="relative overflow-hidden rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.06)] p-4 sm:p-6 backdrop-blur-[20px]" style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)" }}>
            <div className="absolute inset-0 opacity-[0.35]" style={{ background: "radial-gradient(60% 80% at 10% 0%, rgba(212,175,55,0.18), transparent 60%)" }} />
            <div className="relative flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-[rgba(255,255,255,0.03)] shadow-[0_0_12px_rgba(212,175,55,0.8)]" />
                  <span className="text-[11px] tracking-[0.18em] text-white/50">CENTERED • {String(activeIndex + 1).padStart(2, '0')} / 12</span>
                </div>
                <h3 className="mt-3 text-[28px] sm:text-[34px] leading-none tracking-[-0.02em] text-white" style={{ fontFamily: "'Instrument Serif','Playfair Display', Georgia, serif" }}>{activeCard.title}</h3>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[rgba(255,255,255,0.03)] px-3 py-1 text-[10px] font-bold tracking-widest text-black">{activeCard.type}</span>
                  <span className={`rounded-full px-3 py-1 text-[10px] tracking-widest ring-1 ${activeCard.status === "GROUNDED" ? "bg-emerald-500/15 text-emerald-300 ring-emerald-400/20" : activeCard.status === "VERIFIED" ? "bg-sky-500/15 text-sky-300 ring-sky-400/20" : activeCard.status === "ATTESTED" ? "bg-[rgba(255,255,255,0.03)]/15 text-white/70 ring-[#D4AF37]/20" : "bg-white/5/10 text-white/60 ring-white/10"}`}>
                    {activeCard.status} • PINATA IPFS
                  </span>
                </div>
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                  <div className="rounded-[12px] bg-black/40 p-3 ring-1 ring-white/10">
                    <div className="text-[9px] tracking-widest text-white/40">CID</div>
                    <div className="mt-1 break-all font-mono text-[11px] leading-[1.4] text-white/70">{activeCard.cid}</div>
                  </div>
                  <div className="rounded-[12px] bg-black/40 p-3 ring-1 ring-white/10">
                    <div className="text-[9px] tracking-widest text-white/40">GROUNDING</div>
                    <div className="mt-1 text-[11px] leading-[1.5] text-white/70">Source anchored • SHA-256 verified • Merkle proof available. Sovereign attestation via Aquit.ai enclave. No hallucination risk.</div>
                    <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/5/10">
                      <div className="h-full w-[92%] rounded-full bg-[rgba(255,255,255,0.03)]" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="min-w-[200px]">
                <div className="rounded-[14px] bg-[rgba(10,10,10,0.7)] p-3 ring-1 ring-white/10">
                  <div className="text-[10px] tracking-widest text-white/40">PREVIEW • OCR LINES</div>
                  <div className="mt-2 space-y-1.5">
                    {activeCard.lines.map((line, i) => (
                      <div key={i} className="text-[11px] tracking-[0.02em] text-white/60">› {line}</div>
                    ))}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <div className="h-6 w-6 rounded bg-white/5/90" />
                    <div className="h-6 w-6 rounded bg-[rgba(255,255,255,0.03)]/80" />
                    <div className="h-6 w-6 rounded bg-white/5/60" />
                  </div>
                </div>
                <button className="mt-3 w-full rounded-full bg-white/5 py-2.5 text-[11px] font-bold tracking-[0.16em] text-black hover:bg-[rgba(255,255,255,0.03)] transition">OPEN DOCUMENT →</button>
              </div>
            </div>
          </div>

          <div className="grid grid-rows-2 gap-4 sm:gap-5">
            <div className="rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.04)] p-4 backdrop-blur-[16px]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] tracking-widest text-white/40">PERFORMANCE</span>
                <span className="text-[10px] text-white/70">60FPS GPU</span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-[20px] font-light text-white">{Math.round(Math.abs(velocityRef.current * 8) + 58)}<span className="text-[12px]">fps</span></div>
                  <div className="text-[9px] text-white/30 tracking-widest">RENDER</div>
                </div>
                <div>
                  <div className="text-[20px] font-light text-white">{mode === "CYLINDER" ? Z_DISTANCE : mode === "HELIX" ? 380 : 0}<span className="text-[12px]">px</span></div>
                  <div className="text-[9px] text-white/30 tracking-widest">RADIUS</div>
                </div>
                <div>
                  <div className="text-[20px] font-light text-white">{PERSPECTIVE}</div>
                  <div className="text-[9px] text-white/30 tracking-widest">PERSPECTIVE</div>
                </div>
              </div>
              <div className="mt-4 h-px w-full bg-white/5/10" />
              <div className="mt-3 flex items-center gap-2 text-[10px] text-white/40">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> transform3d • will-change • pointer capture • touch-action: pan-y
              </div>
            </div>
            <div className="rounded-[18px] border border-[rgba(212,175,55,0.20)] bg-[rgba(212,175,55,0.06)] p-4 backdrop-blur-[16px]">
              <div className="text-[10px] tracking-[0.18em] text-white/70">AQUIT.AI — SOVEREIGN • LUXURY OS</div>
              <div className="mt-2 text-[12px] leading-[1.6] text-white/70/70">Operating system for AI law firms. Glass morphism, baroque gold, diamond-cut shadows, blue smoke hints. Cylinder of justice — pick your hero evidence.</div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {["IPFS", "PINATA", "ATTESTATION", "ENCLAVE", "C2PA"].map(tag => (
                  <span key={tag} className="rounded-full bg-black/40 px-2.5 py-1 text-[9px] tracking-widest text-white/50 ring-1 ring-white/10">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-[10px] tracking-widest text-white/25">
          <span>© 2026 ACQUIT.AI • SOVEREIGN LAB • BUILT FOR LUXP LABS AESTHETIC</span>
          <span className="text-white/70/60">12 CARDS • {mode} MODE • GPU ACCELERATED</span>
        </div>
      </section>
    </div>
  );
}
