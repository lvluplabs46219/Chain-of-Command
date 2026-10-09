import { ChainOfCommandMasterApp } from "@/components/ChainOfCommandMasterApp";
import { WorkspaceTab } from "@/components/workspace/WorkspaceNavigation";

export const dynamic = "force-dynamic";

function resolveTabFromSlug(slug: string[]): WorkspaceTab {
  const path = slug.join("/").toLowerCase();

  if (path.includes("case")) return "cases";
  if (path.includes("docket")) return "court_watch";
  if (path.includes("chamber") || path.includes("agent") || path.includes("ai")) return "chambers";
  if (path.includes("research") || path.includes("workbench")) return "research";
  if (path.includes("library") || path.includes("statute")) return "library";
  if (path.includes("investigation") || path.includes("evidence")) return "draft_desk";
  if (path.includes("timeline") || path.includes("chronolog")) return "timeline";
  if (path.includes("draft") || path.includes("document") || path.includes("record")) return "draft_desk";
  if (path.includes("court") || path.includes("prep") || path.includes("filing")) return "court_watch";
  if (path.includes("director") || path.includes("counsel") || path.includes("attorney")) return "directory";
  if (path.includes("task") || path.includes("motion") || path.includes("deadline")) return "tasks";
  if (path.includes("setting") || path.includes("audit") || path.includes("security")) return "settings";
  if (path.includes("mockup") || path.includes("archive") || path.includes("gallery") || path.includes("stitch")) return "archive";

  return "dashboard";
}

export default async function CatchAllSlugPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug = [] } = await params;
  const initialTab = resolveTabFromSlug(slug);

  return <ChainOfCommandMasterApp initialTab={initialTab} />;
}
