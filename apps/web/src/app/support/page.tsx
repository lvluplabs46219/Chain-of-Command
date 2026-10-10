import { ChainOfCommandMasterApp } from "@/components/ChainOfCommandMasterApp";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Support & Crisis Resources | Chain of Command",
  description: "Crisis hotlines, court self-help centers, and legal aid for self-represented litigants",
};

export default function SupportPage() {
  return <ChainOfCommandMasterApp initialTab="support" />;
}
