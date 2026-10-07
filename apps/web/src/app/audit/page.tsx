import { ChainOfCommandMasterApp } from "@/components/ChainOfCommandMasterApp";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Audit & Security | Chain of Command",
  description: "Session audit, provenance, and security controls",
};

export default function AuditPage() {
  return <ChainOfCommandMasterApp initialTab="audit" />;
}
