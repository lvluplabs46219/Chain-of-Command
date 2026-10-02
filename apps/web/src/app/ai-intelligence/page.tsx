import { ChainOfCommandMasterApp } from "@/components/ChainOfCommandMasterApp";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "AI Intelligence & Specialist Chambers | Chain of Command",
  description: "Specialist legal AI agent runtime and procedural engines",
};

export default function AiIntelligencePage() {
  return <ChainOfCommandMasterApp initialTab="chambers" />;
}
