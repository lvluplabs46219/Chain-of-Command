import React, { useState, useEffect } from 'react';
import { CommandPalette } from './CommandPalette';
import { TelemetryWidget } from './TelemetryWidget';

export default function WorkspaceLayout() {
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [activeNode, setActiveNode] = useState('01');

  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      // 1. Toggle command palette via Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
      }

      // 2. Direct Hotkey Jumps (1-9) when not typing inside an input field
      if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        if (e.key >= '1' && e.key <= '9') {
          const paddedNodeId = `0${e.key}`;
          setActiveNode(paddedNodeId);
          console.log(`Fuzzy jumping directly to node ${paddedNodeId}`);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleBehavior);
  }, []);

  return (
    <div className="min-h-screen bg-[#090A0F] text-white">
      {/* Top Header Row containing your brand and live telemetry */}
      <header className="flex justify-between items-center px-6 py-4 border-b border-neutral-900 bg-black/20">
        <div className="flex items-center gap-4">
          <h1 className="font-serif font-extrabold text-lg tracking-tight">CHAIN OF COMMAND</h1>
          <button 
            onClick={() => setIsPaletteOpen(true)}
            className="text-[10px] font-mono bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 px-2 py-1 rounded transition-all"
          >
            Quick Jump ⌘K
          </button>
        </div>
        
        {/* Rendered Telemetry Status Monitor */}
        <TelemetryWidget />
      </header>

      {/* Main Workspace Frame */}
      <main className="p-6">
        <p className="font-mono text-xs text-neutral-500">Active Node Frame Matrix: {activeNode}</p>
        {/* Your 3D spiral navigation deck and metrics components render beneath */}
      </main>

      {/* Mounted Command Palette Portal Overlay */}
      <CommandPalette 
        isOpen={isPaletteOpen} 
        onClose={() => setIsPaletteOpen(false)} 
        onSelectNode={(nodeId) => setActiveNode(nodeId)} 
      />
    </div>
  );
}
