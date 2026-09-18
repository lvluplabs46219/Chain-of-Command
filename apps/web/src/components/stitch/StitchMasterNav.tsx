import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  STITCH_CATEGORIES,
  ALL_STITCH_MOCKUPS,
  formatMockupName,
} from "./stitchConfig";
import {
  Gavel,
  Search,
  Wrench,
  ChevronDown,
  LayoutGrid,
  ShieldCheck,
  LogOut,
  User,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export function StitchMasterNav() {
  const location = useLocation();
  const { user, isAuthenticated, logout, loginAsLitigant } = useAuth();
  const [toolsOpen, setToolsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResultsOpen, setSearchResultsOpen] = useState(false);

  const filteredMockups = searchQuery.trim()
    ? ALL_STITCH_MOCKUPS.filter((m) =>
        m.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <header className="sticky top-0 z-50 w-full shrink-0 border-b border-[#44474a]/50 bg-[#141313] text-[#e5e2e1]">
      <div className="flex h-16 items-center justify-between px-4">
        {/* Brand & Matter Identity */}
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 group transition-transform"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded bg-[#201f1f] border border-[#b5c8df]/40 text-[#b5c8df] group-hover:border-[#b5c8df]">
              <Gavel size={18} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg font-bold tracking-tight text-white group-hover:text-[#b5c8df] transition-colors">
                  Acquit.ai
                </span>
                <span className="rounded bg-[#36485b]/60 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[#b5c8df] border border-[#b5c8df]/30">
                  LEGAL OS
                </span>
              </div>
              <span className="font-mono text-[11px] text-[#8f9194]">
                Pro Se Defense Workspace
              </span>
            </div>
          </Link>

          {/* Active Matter Badge */}
          <div className="hidden xl:flex items-center gap-2 rounded border border-[#44474a]/60 bg-[#1c1b1b] px-3 py-1 text-xs">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono font-semibold text-[#b5c8df]">
              #2024-CR-04821
            </span>
            <span className="text-[#8f9194]">|</span>
            <span className="font-medium text-white">State v. Doe</span>
            <span className="text-[#8f9194]">|</span>
            <span className="text-[#c5c6ca] text-[11px]">SF Superior Court</span>
          </div>
        </div>

        {/* Global Search & All Mockups Launch */}
        <div className="flex items-center gap-3">
          {/* Quick Mockup Search */}
          <div className="relative hidden md:block">
            <div className="flex items-center rounded border border-[#44474a]/60 bg-[#1c1b1b] px-2.5 py-1 text-xs text-[#e5e2e1] focus-within:border-[#b5c8df] focus-within:ring-1 focus-within:ring-[#b5c8df]">
              <Search size={14} className="text-[#8f9194] mr-2" />
              <input
                type="text"
                placeholder="Search 46 mockups..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchResultsOpen(true);
                }}
                onFocus={() => setSearchResultsOpen(true)}
                className="w-36 lg:w-48 bg-transparent text-xs text-white placeholder-[#8f9194] focus:outline-none font-mono"
              />
            </div>

            {/* Quick search popup */}
            {searchResultsOpen && searchQuery.trim().length > 0 && (
              <div
                className="absolute right-0 mt-1.5 w-72 rounded-lg border border-[#44474a] bg-[#201f1f] p-2 shadow-2xl z-50 max-h-80 overflow-y-auto"
                onMouseLeave={() => setSearchResultsOpen(false)}
              >
                <div className="text-[11px] font-mono text-[#8f9194] px-2 py-1 uppercase tracking-wider">
                  Matching Stitch Screens ({filteredMockups.length})
                </div>
                {filteredMockups.length === 0 ? (
                  <div className="px-2 py-3 text-xs text-[#8f9194] text-center">
                    No mockups matched "{searchQuery}"
                  </div>
                ) : (
                  filteredMockups.map((m) => (
                    <Link
                      key={m}
                      to={`/stitch/${m}`}
                      onClick={() => {
                        setSearchQuery("");
                        setSearchResultsOpen(false);
                      }}
                      className="flex items-center justify-between rounded px-2 py-1.5 text-xs text-[#c5c6ca] hover:bg-[#36485b] hover:text-white transition"
                    >
                      <span>{formatMockupName(m)}</span>
                      <span className="font-mono text-[10px] text-[#8f9194]">Launch →</span>
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>

          {/* All Screens Gallery Link */}
          <Link
            to="/gallery"
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold tracking-wider transition ${
              location.pathname === "/gallery"
                ? "bg-[#36485b] text-[#d1e4fb] border border-[#b5c8df]"
                : "border border-[#44474a]/60 bg-[#1c1b1b] text-[#c5c6ca] hover:bg-[#2a2a2a] hover:text-white"
            }`}
          >
            <LayoutGrid size={14} />
            <span className="hidden sm:inline">Stitch Gallery</span>
            <span className="rounded bg-[#36485b] px-1 text-[10px] text-[#b5c8df]">46</span>
          </Link>

          {/* Pro Tools Menu */}
          <div className="relative">
            <button
              onClick={() => setToolsOpen(!toolsOpen)}
              className="flex items-center gap-1.5 rounded border border-[#44474a]/60 bg-[#1c1b1b] px-3 py-1.5 text-xs font-medium text-[#c5c6ca] hover:bg-[#2a2a2a] hover:text-white transition"
            >
              <Wrench size={13} className="text-[#b5c8df]" />
              <span className="hidden sm:inline">Modules</span>
              <ChevronDown size={13} />
            </button>

            {toolsOpen && (
              <div
                className="absolute right-0 mt-1.5 w-64 rounded-lg border border-[#44474a] bg-[#201f1f] p-2 shadow-2xl z-50"
                onMouseLeave={() => setToolsOpen(false)}
              >
                <div className="text-[11px] font-mono text-[#8f9194] px-2 py-1 uppercase tracking-wider border-b border-[#44474a]/40 mb-1">
                  Active Platform Tools
                </div>
                <Link
                  to="/chain-of-command"
                  onClick={() => setToolsOpen(false)}
                  className="flex flex-col rounded px-2.5 py-1.5 hover:bg-[#36485b] transition"
                >
                  <span className="text-xs font-semibold text-white">Chain of Command</span>
                  <span className="text-[11px] text-[#8f9194]">Multi-agent orchestration lab</span>
                </Link>
                <Link
                  to="/document-editor"
                  onClick={() => setToolsOpen(false)}
                  className="flex flex-col rounded px-2.5 py-1.5 hover:bg-[#36485b] transition"
                >
                  <span className="text-xs font-semibold text-white">VS Code Document Editor</span>
                  <span className="text-[11px] text-[#8f9194]">Pleading drafting workstation</span>
                </Link>
                <Link
                  to="/document-vault"
                  onClick={() => setToolsOpen(false)}
                  className="flex flex-col rounded px-2.5 py-1.5 hover:bg-[#36485b] transition"
                >
                  <span className="text-xs font-semibold text-white">Sovereign Cylinder</span>
                  <span className="text-[11px] text-[#8f9194]">Encrypted document vault</span>
                </Link>
                <Link
                  to="/academy"
                  onClick={() => setToolsOpen(false)}
                  className="flex flex-col rounded px-2.5 py-1.5 hover:bg-[#36485b] transition"
                >
                  <span className="text-xs font-semibold text-white">Acquit Academy</span>
                  <span className="text-[11px] text-[#8f9194]">Pro se procedural training</span>
                </Link>
                <Link
                  to="/google-workspace"
                  onClick={() => setToolsOpen(false)}
                  className="flex flex-col rounded px-2.5 py-1.5 hover:bg-[#36485b] transition"
                >
                  <span className="text-xs font-semibold text-white">Google Workspace</span>
                  <span className="text-[11px] text-[#8f9194]">Drive, Calendar & Docs sync</span>
                </Link>
                <Link
                  to="/rag-citations"
                  onClick={() => setToolsOpen(false)}
                  className="flex flex-col rounded px-2.5 py-1.5 hover:bg-[#36485b] transition"
                >
                  <span className="text-xs font-semibold text-white">RAG Citations</span>
                  <span className="text-[11px] text-[#8f9194]">Source verification viewer</span>
                </Link>
              </div>
            )}
          </div>

          {/* User Session & Role Guard Badge */}
          <div className="relative">
              {isAuthenticated && user ? (
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 rounded border border-[#d4af37]/40 bg-[#1c1a16] px-2.5 py-1.5 text-xs text-[#d4af37] hover:border-[#d4af37] transition"
                  title="Authenticated Workspace Session"
                >
                  <ShieldCheck size={14} className="text-[#d4af37]" />
                  <span className="hidden md:inline font-mono font-bold text-[11px] uppercase tracking-wider">
                    {user.role === "pro_se" ? "Pro Se" : "Counsel"}
                  </span>
                  <span className="hidden lg:inline text-white/80 max-w-[100px] truncate text-[11px]">
                    · {user.name.split(" ")[0]}
                  </span>
                  <ChevronDown size={12} className="text-[#d4af37]" />
                </button>
              ) : (
                <button
                  onClick={() => loginAsLitigant()}
                  className="flex items-center gap-1.5 rounded border border-[#d4af37] bg-[#d4af37] text-black px-2.5 py-1.5 text-xs font-bold hover:bg-[#c29d2b] transition"
                >
                  <User size={13} />
                  <span>Litigant Login</span>
                </button>
              )}

              {userMenuOpen && user && (
                <div
                  className="absolute right-0 mt-1.5 w-64 rounded-lg border border-[#44474a] bg-[#201f1f] p-3 shadow-2xl z-50 text-xs"
                  onMouseLeave={() => setUserMenuOpen(false)}
                >
                  <div className="border-b border-[#44474a]/40 pb-2 mb-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{user.name}</span>
                      <span className="rounded bg-[#252015] border border-[#d4af37]/50 px-1.5 py-0.5 text-[10px] font-mono text-[#d4af37]">
                        {user.role === "pro_se" ? "PRO SE LITIGANT" : "LEGAL COUNSEL"}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8f9194] mt-0.5">{user.email}</p>
                    <p className="text-[10px] mono text-[#9fc6ae] mt-1">✓ Verified Session · Active Matter #2024-CR-04821</p>
                  </div>

                  <div className="space-y-1 text-[#c5c6ca] text-[11px]">
                    <div className="flex justify-between py-1">
                      <span className="text-[#8f9194]">Jurisdiction:</span>
                      <span className="text-white">{user.jurisdiction}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-[#8f9194]">Status:</span>
                      <span className="text-[#9fc6ae] font-semibold">Self-Represented (Pro Se)</span>
                    </div>
                  </div>

                  <div className="border-t border-[#44474a]/40 pt-2 mt-2">
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="flex items-center gap-2 w-full text-left py-1 text-[11px] text-[#e06c75] hover:text-[#f3959b] transition"
                    >
                      <LogOut size={13} />
                      <span>End Workspace Session</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      {/* Stitch Category Links Bar */}
      <nav className="flex items-center gap-1 overflow-x-auto border-t border-[#44474a]/40 bg-[#1a1919] px-4 py-1.5 text-xs hide-scrollbar">
        {STITCH_CATEGORIES.map((cat) => {
          const isActive =
            location.pathname === cat.route ||
            (cat.route !== "/" && location.pathname.startsWith(cat.route));

          return (
            <Link
              key={cat.id}
              to={cat.route}
              className={`shrink-0 rounded px-2.5 py-1 text-xs font-medium uppercase tracking-wider transition ${
                isActive
                  ? "bg-[#36485b] text-[#d1e4fb] font-semibold border-b-2 border-[#b5c8df]"
                  : "text-[#c5c6ca] hover:bg-[#2a2a2a] hover:text-white"
              }`}
            >
              {cat.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
