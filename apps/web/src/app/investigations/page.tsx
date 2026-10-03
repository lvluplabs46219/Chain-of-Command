import { ChainOfCommandMasterApp } from "@/components/ChainOfCommandMasterApp";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Investigations | Chain of Command",
  description: "Evidence locker, case research, and exhibit analysis",
};

export default function InvestigationsPage() {
  return <ChainOfCommandMasterApp initialTab="investigations" />;
}
