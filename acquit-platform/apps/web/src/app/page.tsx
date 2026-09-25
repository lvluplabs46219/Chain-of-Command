export default function CommandCenterPage() {
  return (
    <main className="p-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold tracking-tight mb-4">Acquit Command Center</h1>
      <p className="text-slate-400 mb-8">AI Legal Operating System & Multi-Agent Workspace</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a href="/gallery" className="p-6 bg-slate-898 border border-slate-800 rounded-xl hover:border-slate-700 transition">
          <h2 className="text-xl font-semibold mb-2">Stitch Gallery (85)</h2>
          <p className="text-sm text-slate-400">Explore all high-fidelity UI mockups and legal screens.</p>
        </a>
        <a href="/chambers" className="p-6 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition">
          <h2 className="text-xl font-semibold mb-2">GenTeam Chambers</h2>
          <p className="text-sm text-slate-400">Autonomous multi-agent sparring and legal workspace.</p>
        </a>
        <a href="/docket" className="p-6 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition">
          <h2 className="text-xl font-semibold mb-2">The Docket</h2>
          <p className="text-sm text-slate-400">Manage active legal matters and court submissions.</p>
        </a>
      </div>
    </main>
  );
}
