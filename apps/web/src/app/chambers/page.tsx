import { ChainOfCommandMasterApp } from "@/components/ChainOfCommandMasterApp";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Chambers — AI Legal Team | Chain of Command",
  description: "Multi-agent legal workspace with specialized AI counselors",
};

export default function ChambersPage() {
  return <ChainOfCommandMasterApp initialTab="chambers" />;
}
