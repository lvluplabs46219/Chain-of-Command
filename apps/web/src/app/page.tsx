import { ChainOfCommandMasterApp } from "@/components/ChainOfCommandMasterApp";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return <ChainOfCommandMasterApp initialTab="dashboard" />;
}
