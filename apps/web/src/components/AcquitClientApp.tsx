"use client";

import React, { useEffect, useState } from "react";
import App from "../App";

export default function AcquitClientApp() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#111214] flex items-center justify-center text-[#d4af37]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono tracking-wider uppercase text-[#c5c6ca]">Initializing Acquit Legal OS...</span>
        </div>
      </div>
    );
  }

  return <App />;
}
