import { ChainOfCommandMasterApp } from "@/components/ChainOfCommandMasterApp";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "AI Lawyer | Chain of Command",
  description:
    "AI Legal Team section — multi-agent swarm workspace inside Chain of Command",
};

/** Alias route: same shell + AI Lawyer section as /chambers */
export default function AiIntelligencePage() {
  return <ChainOfCommandMasterApp initialTab="chambers" />;
}
