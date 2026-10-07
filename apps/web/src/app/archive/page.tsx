import { ChainOfCommandMasterApp } from "@/components/ChainOfCommandMasterApp";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Design Archive | Chain of Command",
  description: "Design system and mockup archive",
};

export default function ArchivePage() {
  return <ChainOfCommandMasterApp initialTab="archive" />;
}
