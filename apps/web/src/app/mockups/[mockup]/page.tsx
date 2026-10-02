const MOCKUP_NAME_PATTERN = /^[a-z0-9._-]+$/i;

export default async function MockupPage({
  params,
}: {
  params: Promise<{ mockup: string }>;
}) {
  const { mockup } = await params;

  if (!MOCKUP_NAME_PATTERN.test(mockup)) {
    return (
      <main className="p-8 max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Invalid mockup name</h1>
      </main>
    );
  }

  const displayName = mockup
    .replace(/acquit\.ai_/gi, "Chain of Command ")
    .replace(/acquit_/gi, "Chain of Command ")
    .replace(/_acquit\.ai_/gi, " Chain of Command ")
    .replace(/acquit/gi, "Chain of Command")
    .replace(/_/g, " ");

  return (
    <main className="p-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold tracking-tight mb-4 capitalize">{displayName}</h1>
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
        <iframe
          src={`/mockups/${mockup}/index.html`}
          className="w-full h-screen border-none"
          title={displayName}
        />
      </div>
    </main>
  );
}
