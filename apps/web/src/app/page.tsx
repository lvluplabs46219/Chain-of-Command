import { ChainOfCommandMasterApp } from "@/components/ChainOfCommandMasterApp";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Chain of Command — Legal OS & Pro Se Case Workspace",
  description: "AI-Powered Legal Workspace for Self-Represented Litigants and Case Management",
};

export default function HomePage() {
  return <ChainOfCommandMasterApp initialTab="dashboard" />;
}
