import fs from "fs";
import path from "path";
import Link from "next/link";

function formatName(name: string) {
  return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function listMockups(): string[] {
  try {
    const mockupsDir = path.join(process.cwd(), "public", "mockups");
    if (!fs.existsSync(mockupsDir)) return [];
    return fs
      .readdirSync(mockupsDir, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort();
  } catch {
    return [];
  }
}

export default function MockupsGalleryPage() {
  const mockups = listMockups();

  return (
    <main className="p-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold tracking-tight mb-4">Stitch Gallery ({mockups.length})</h1>
      <p className="text-slate-400 mb-8">Explore all high-fidelity UI mockups and legal screens.</p>
      {mockups.length === 0 ? (
        <p className="text-slate-400 border border-slate-800 rounded-xl p-6 bg-slate-900">
          No mockups found in <code>public/mockups</code>. Run{" "}
          <code>node scripts/copy-mockups.mjs</code> from <code>apps/web</code> to generate them.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockups.map((mockup) => (
            <Link
              key={mockup}
              href={`/mockups/${mockup}`}
              className="p-6 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition block"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/mockups/${mockup}/screen.png`}
                alt={formatName(mockup)}
                className="w-full aspect-video object-cover rounded-lg mb-4 opacity-80 hover:opacity-100 transition"
                loading="lazy"
              />
              <h2 className="text-xl font-semibold mb-2">{formatName(mockup)}</h2>
              <p className="text-sm text-slate-400">View mockup</p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
