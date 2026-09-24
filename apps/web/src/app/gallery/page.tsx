import { Metadata } from "next";
import fs from "fs/promises";
import path from "path";

export const metadata: Metadata = {
  title: "Gallery - Acquit.ai Mockups",
  description: "Browse all Acquit.ai UI mockups and design specifications",
};

interface MockupInfo {
  name: string;
  category: string;
  hasCode: boolean;
  hasScreen: boolean;
  path: string;
}

async function getMockups(): Promise<MockupInfo[]> {
  const stitchDir = path.join(
    process.cwd(),
    "public",
    "assets",
    "stitch"
  );

  try {
    const dirs = await fs.readdir(stitchDir, { withFileTypes: true });
    const mockups: MockupInfo[] = [];

    for (const dir of dirs) {
      if (!dir.isDirectory()) continue;

      const dirPath = path.join(stitchDir, dir.name);
      const files = await fs.readdir(dirPath);

      const hasCode = files.includes("code.html");
      const hasScreen = files.includes("screen.png");

      // Extract category from directory name (e.g., "command_center_dashboard_1" -> "command_center")
      let category = dir.name;
      if (dir.name.includes("_")) {
        const parts = dir.name.split("_");
        // Remove trailing numbers (e.g., "_1", "_2")
        if (parts.length > 1 && !isNaN(parseInt(parts[parts.length - 1]))) {
          category = parts.slice(0, -1).join("_");
        } else {
          category = parts[0];
        }
      }

      mockups.push({
        name: dir.name,
        category,
        hasCode,
        hasScreen,
        path: `/assets/stitch/${dir.name}`,
      });
    }

    // Sort by category then by name
    return mockups.sort((a, b) => {
      if (a.category < b.category) return -1;
      if (a.category > b.category) return 1;
      return a.name.localeCompare(b.name);
    });
  } catch (error) {
    console.error("Error reading mockups:", error);
    return [];
  }
}

function formatName(name: string): string {
  // Remove trailing _1, _2, etc.
  const cleaned = name.replace(/_\d+$/, "");
  // Convert snake_case to spaces
  return cleaned
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatCategory(category: string): string {
  return category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default async function GalleryPage() {
  const mockups = await getMockups();

  return (
    <main className="min-h-screen bg-[#0A0A0A] p-6 md:p-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <p className="mb-2 font-mono text-xs tracking-[0.25em] text-[#D4AF37]">
            ACQUIT.AI / MOCKUP GALLERY
          </p>
          <h1 className="text-3xl font-semibold text-white">
            Stitch OS Design Mockups
          </h1>
          <p className="mt-2 max-w-2xl text-white/60">
            Browse all 46+ high-fidelity UI mockups for the Acquit legal operating system.
          </p>
        </header>

        {/* Category Filter */}
        <div className="mb-8">
          <p className="text-sm font-medium text-white/80 mb-3">Categories</p>
          <div className="flex flex-wrap gap-2">
            <button className="px-3 py-1 rounded bg-[#D4AF37] text-black text-xs font-medium">
              All ({mockups.length})
            </button>
            {[
              "command_center",
              "chambers",
              "the_docket",
              "case_timeline",
              "investigations",
              "record_room",
              "law_library",
              "motions_tasks",
              "court_watch",
              "counsel_directory",
              "filing_center",
              "system_settings",
              "accessibility",
            ].map((cat) => {
              const count = mockups.filter((m) => m.category === cat).length;
              return (
                <button
                  key={cat}
                  className="px-3 py-1 rounded bg-white/10 text-white/70 hover:bg-white/20 text-xs font-medium transition-colors"
                >
                  {formatCategory(cat)} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Mockup Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {mockups.map((mockup) => (
            <div
              key={mockup.name}
              className="group rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden transition hover:border-[#D4AF37]/50 hover:bg-white/[0.06]"
            >
              {/* Preview Image */}
              {mockup.hasScreen && (
                <div className="aspect-video bg-black/20 relative overflow-hidden">
                  <img
                    src={mockup.path + "/screen.png"}
                    alt={formatName(mockup.name)}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              )}

              {/* Info */}
              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-white truncate">
                    {formatName(mockup.name)}
                  </h3>
                  <span className="text-[#D4AF37] text-xs">
                    {mockup.hasCode && mockup.hasScreen ? "Code + Spec" : mockup.hasCode ? "Code" : "Spec"}
                  </span>
                </div>
                <p className="text-xs text-white/40 mt-1">
                  {formatCategory(mockup.category)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 p-4 pt-0 border-t border-white/10">
                {mockup.hasCode && (
                  <a
                    href={mockup.path + "/code.html"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center py-2 text-xs font-medium text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]/80 transition-colors rounded"
                  >
                    View Code
                  </a>
                )}
                {mockup.hasScreen && (
                  <a
                    href={mockup.path + "/screen.png"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center py-2 text-xs font-medium text-[#8f9194] hover:bg-white/10 hover:text-white transition-colors rounded"
                  >
                    View Spec
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
