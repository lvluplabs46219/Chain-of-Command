import React, { useState, useEffect } from 'react';

export const TelemetryWidget: React.FC = () => {
  const [latency, setLatency] = useState<number>(14);

  // Simulate subtle real-world network fluctuations for the cyber aesthetic
  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(() => Math.floor(Math.random() * (22 - 11 + 1)) + 11);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-3 px-3 py-1.5 bg-neutral-900/70 border border-neutral-800/80 rounded-md shadow-inner">
      {/* Network Pulse Core */}
      <div className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </div>

      {/* Cyber Readout Strings */}
      <div className="flex items-center gap-2 font-mono text-[10px] text-neutral-400 tracking-wider">
        <span className="font-bold text-neutral-200">PERSISTED</span>
        <span className="text-neutral-700">|</span>
        <span className="flex items-center gap-1 text-emerald-400">
          SYNC: <span className="font-extrabold">100%</span>
        </span>
        <span className="text-neutral-700">|</span>
        <span className="text-neutral-500">AES-256</span>
        <span className="text-neutral-700">|</span>
        <span className="text-neutral-500 hover:text-[#D4AF37] transition-colors cursor-help" title="Node Network Gateway Latency">
          {latency}ms
        </span>
      </div>
    </div>
  );
};
