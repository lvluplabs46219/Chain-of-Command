import React, { useState, useEffect, useRef } from 'react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNode: (nodeId: string) => void;
}

const NAVIGATION_NODES = [
  { id: '01', name: 'Workspace', shortcut: '1' },
  { id: '02', name: 'Filings', shortcut: '2' },
  { id: '03', name: '6 Agents', shortcut: '3' },
  { id: '04', name: 'Authorities', shortcut: '4' },
  { id: '05', name: 'Evidence', shortcut: '5' },
  { id: '06', name: 'Chronology', shortcut: '6' },
  { id: '07', name: 'Documents', shortcut: '7' },
  { id: '08', name: 'Monitor', shortcut: '8' },
  { id: '09', name: 'Counsel', shortcut: '9' },
  { id: '10', name: 'Calendar', shortcut: '0' },
  { id: '11', name: 'Encrypted', shortcut: '-' },
  { id: '12', name: 'Stitch UI', shortcut: '=' },
];

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onSelectNode }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter nodes based on user query
  const filteredNodes = NAVIGATION_NODES.filter((node) =>
    node.name.toLowerCase().includes(query.toLowerCase())
  );

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Handle Keyboard Traps & Navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredNodes.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredNodes.length) % filteredNodes.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredNodes[selectedIndex]) {
          onSelectNode(filteredNodes[selectedIndex].id);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredNodes, selectedIndex, onClose, onSelectNode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4 backdrop-blur-md bg-black/60 transition-opacity duration-300">
      <div 
        className="w-full max-w-xl overflow-hidden rounded-xl border border-[#D4AF37]/30 bg-[#101117] shadow-[0_0_50px_rgba(212,175,55,0.15)] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Area */}
        <div className="flex items-center border-b border-neutral-800 px-4 py-3.5">
          <span className="text-neutral-500 font-mono text-sm mr-3">⚡</span>
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent font-mono text-sm text-white placeholder-neutral-500 focus:outline-none"
            placeholder="Type a command or category name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className="hidden sm:inline-block rounded bg-neutral-800 px-2 py-0.5 font-mono text-[10px] font-bold text-neutral-400 border border-neutral-700">
            ESC
          </kbd>
        </div>

        {/* Results Stream */}
        <div className="max-h-72 overflow-y-auto p-2 space-y-0.5 custom-scrollbar">
          {filteredNodes.length === 0 ? (
            <div className="py-6 text-center font-mono text-xs text-neutral-500">
              No matching workspace segments found.
            </div>
          ) : (
            filteredNodes.map((node, index) => {
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={node.id}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-mono text-xs transition-all ${
                    isSelected
                      ? 'bg-[#D4AF37]/10 text-white border border-[#D4AF37]/40 ring-1 ring-[#D4AF37]/20 shadow-[inset_0_0_12px_rgba(212,175,55,0.1)]'
                      : 'text-neutral-400 border border-transparent hover:bg-neutral-900/60 hover:text-neutral-200'
                  }`}
                  onClick={() => {
                    onSelectNode(node.id);
                    onClose();
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      isSelected ? 'bg-[#D4AF37] text-black' : 'bg-neutral-800 text-neutral-400'
                    }`}>
                      {node.id}
                    </span>
                    <span className="font-medium tracking-wide">{node.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-neutral-500 text-[10px]">
                    <span>Jump</span>
                    <kbd className="rounded bg-neutral-800 px-1.5 py-0.5 border border-neutral-700 text-neutral-400">
                      {node.shortcut}
                    </kbd>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Console Status Footer */}
        <div className="bg-[#0b0c10] px-4 py-2 border-t border-neutral-900 flex justify-between items-center text-[10px] font-mono text-neutral-500">
          <div className="flex gap-4">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
          <div>[ ACTIVE LEGAL COMPASS ]</div>
        </div>
      </div>
    </div>
  );
};
