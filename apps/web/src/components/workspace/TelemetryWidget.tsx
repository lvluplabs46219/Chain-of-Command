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
    <div className="flex items-center gap-3 px-3 py-1.5 bg-neutral-900/90 border border-neutral-800 rounded-md">
      {/* Session State Indicator */}
      <div className="relative flex h-2 w-2">
        <span className="inline-flex rounded-full h-1.5 w-1.5 bg-zinc-300"></span>
      </div>

      {/* Security & Verification Metadata */}
      <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-300 tracking-wider">
        <span className="font-semibold text-white">PERSISTED</span>
        <span className="text-zinc-600">|</span>
        <span className="flex items-center gap-1 text-zinc-200">
          SYNC: <span className="font-bold text-white">100%</span>
        </span>
        <span className="text-zinc-600">|</span>
        <span className="text-zinc-300">AES-256</span>
        <span className="text-zinc-600">|</span>
        <span className="text-zinc-300 hover:text-[#D4AF37] transition-colors cursor-help" title="Node Network Gateway Latency">
          {latency}ms
        </span>
      </div>
    </div>
  );
};
