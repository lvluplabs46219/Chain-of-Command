import { useState } from "react";
import { Link } from "react-router-dom";
import {
  STITCH_CATEGORIES,
  ALL_STITCH_MOCKUPS,
  formatMockupName,
  findCategoryForMockup,
} from "../../stitch/stitchConfig";
import {
  Search,
  ChevronRight,
  ExternalLink,
  Layers,
  Sparkles,
} from "lucide-react";

export function StitchGallery() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMockups = ALL_STITCH_MOCKUPS.filter((m) => {
    const matchesSearch =
      m.toLowerCase().includes(searchQuery.toLowerCase()) ||
      formatMockupName(m).toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedCategory === "all") return true;

    const cat = findCategoryForMockup(m);
    return cat?.id === selectedCategory;
  });

  return (
    <div className="min-h-full bg-[#141313] p-6 lg:p-8 text-[#e5e2e1]">
      {/* Header */}
      <div className="mb-8 border-b border-[#44474a]/40 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs tracking-widest text-[#b5c8df] uppercase">
              ACQUIT.AI / STITCH OS SPECIFICATION
            </span>
            <span className="rounded bg-[#36485b]/60 px-2 py-0.5 font-mono text-[10px] text-[#b5c8df]">
              46 DESIGN SCREENS
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-white tracking-tight">
            Stitch OS Pages & Screen Matrix
          </h1>
          <p className="mt-1 text-sm text-[#8f9194] max-w-2xl">
            Complete high-fidelity layouts created for the Acquit legal operating system. Click any card to launch the interactive live layout or inspect its visual spec.
          </p>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8f9194]" />
            <input
              type="text"
              placeholder="Filter mockups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 rounded border border-[#44474a]/60 bg-[#1c1b1b] pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#8f9194] focus:outline-none focus:border-[#b5c8df]"
            />
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="mb-6 flex items-center gap-1.5 overflow-x-auto pb-2 hide-scrollbar">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`shrink-0 rounded px-3 py-1 text-xs font-semibold uppercase tracking-wider transition ${
            selectedCategory === "all"
              ? "bg-[#36485b] text-[#d1e4fb] border border-[#b5c8df]/40"
              : "border border-[#44474a]/40 bg-[#1c1b1b] text-[#c5c6ca] hover:bg-[#2a2a2a] hover:text-white"
          }`}
        >
          All Screens ({ALL_STITCH_MOCKUPS.length})
        </button>
        {STITCH_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`shrink-0 rounded px-3 py-1 text-xs font-medium uppercase tracking-wider transition ${
              selectedCategory === cat.id
                ? "bg-[#36485b] text-[#d1e4fb] border border-[#b5c8df]/40 font-semibold"
                : "border border-[#44474a]/40 bg-[#1c1b1b] text-[#c5c6ca] hover:bg-[#2a2a2a] hover:text-white"
            }`}
          >
            {cat.label} ({cat.screens.length})
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filteredMockups.map((mockupId) => {
          const category = findCategoryForMockup(mockupId);
          const screenInfo = category?.screens.find((s) => s.id === mockupId);
          const isPrimary = screenInfo?.isPrimary;

          return (
            <div
              key={mockupId}
              className="group flex flex-col overflow-hidden rounded-xl border border-[#44474a]/50 bg-[#1c1b1b] transition hover:border-[#b5c8df]/80 hover:bg-[#201f1f] shadow-lg"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video w-full overflow-hidden bg-[#0e0e0e]">
                <img
                  src={`/assets/stitch/${mockupId}/screen.png`}
                  alt={formatMockupName(mockupId)}
                  className="h-full w-full object-cover object-top opacity-85 transition group-hover:opacity-100 group-hover:scale-105 duration-300"
                  loading="lazy"
                />

                {/* Primary Tag */}
                {isPrimary && (
                  <div className="absolute top-2 left-2 rounded bg-[#36485b]/90 border border-[#b5c8df]/40 px-1.5 py-0.5 font-mono text-[9px] font-bold text-[#b5c8df] uppercase tracking-wider backdrop-blur">
                    Primary Route
                  </div>
                )}

                {/* Direct Raw Link */}
                <a
                  href={`/assets/stitch/${mockupId}/code.html`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-2 right-2 rounded bg-black/60 p-1 text-white/70 hover:text-white hover:bg-black/90 opacity-0 group-hover:opacity-100 transition backdrop-blur"
                  title="Open Raw HTML"
                >
                  <ExternalLink size={12} />
                </a>
              </div>

              {/* Info & Action */}
              <div className="flex flex-1 flex-col justify-between p-3.5">
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#8f9194] mb-1">
                    <span className="uppercase tracking-wider">
                      {category?.label || "Workspace"}
                    </span>
                  </div>
                  <h3 className="font-semibold text-white text-sm group-hover:text-[#b5c8df] transition-colors line-clamp-1">
                    {formatMockupName(mockupId)}
                  </h3>
                  {screenInfo?.description && (
                    <p className="mt-1 text-xs text-[#8f9194] line-clamp-2 leading-relaxed">
                      {screenInfo.description}
                    </p>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-[#44474a]/30 flex items-center justify-between">
                  <Link
                    to={`/stitch/${mockupId}`}
                    className="flex items-center gap-1 text-xs font-semibold text-[#b5c8df] hover:text-white transition"
                  >
                    <span>Launch Page</span>
                    <ChevronRight size={13} />
                  </Link>

                  <span className="font-mono text-[10px] text-[#8f9194]">
                    code.html
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default StitchGallery;
