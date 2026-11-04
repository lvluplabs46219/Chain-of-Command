import { ChainOfCommandMasterApp } from "@/components/ChainOfCommandMasterApp";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "AI Lawyer | Chain of Command",
  description:
    "AI Legal Team section — multi-agent swarm workspace inside Chain of Command",
};

export default function ChambersPage() {
  return <ChainOfCommandMasterApp initialTab="chambers" />;
}
