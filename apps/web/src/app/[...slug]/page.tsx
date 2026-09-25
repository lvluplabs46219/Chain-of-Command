import { notFound } from "next/navigation";
import StitchPage from "@/lib/stitch/StitchPage";
import { resolveStitchFolder } from "@/lib/stitch/route-map";

export const dynamic = "force-dynamic";

export default async function StitchRoutePage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug = [] } = await params;
  const folder = resolveStitchFolder(slug);
  if (!folder) notFound();
  return <StitchPage folder={folder} />;
}
