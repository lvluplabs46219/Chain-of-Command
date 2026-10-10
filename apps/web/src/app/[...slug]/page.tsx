import { ChainOfCommandMasterApp } from "@/components/ChainOfCommandMasterApp";
import { WorkspaceTab } from "@/components/workspace/WorkspaceNavigation";

export const dynamic = "force-dynamic";

function resolveWorkspaceTab(slug: string[]): WorkspaceTab {
  const path = slug.join("/").toLowerCase();

  if (path.includes("docket")) return "docket";
  if (path.includes("chamber") || path.includes("agent") || path.includes("team")) return "chambers";
  if (path.includes("lib") || path.includes("statute") || path.includes("research")) return "library";
  if (path.includes("investigat") || path.includes("evidence")) return "investigations";
  if (path.includes("time") || path.includes("chronology")) return "timeline";
  if (path.includes("draft") || path.includes("motion") || path.includes("doc")) return "draft_desk";
  if (path.includes("court") || path.includes("watch") || path.includes("calendar")) return "court_watch";
  if (path.includes("director") || path.includes("attorney") || path.includes("counsel")) return "directory";
  if (path.includes("task") || path.includes("deadline")) return "tasks";
  if (path.includes("audit") || path.includes("log") || path.includes("compliance")) return "audit";
  if (path.includes("archive") || path.includes("design") || path.includes("stitch")) return "archive";

  return "dashboard";
}

export default async function CatchAllSlugPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug = [] } = await params;
  const initialTab = resolveWorkspaceTab(slug);

  return <ChainOfCommandMasterApp initialTab={initialTab} />;
}
