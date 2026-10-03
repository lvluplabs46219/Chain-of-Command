import { ChainOfCommandMasterApp } from "@/components/ChainOfCommandMasterApp";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Counsel Directory | Chain of Command",
  description: "Bar listings and pro bono directory — not recommendations",
};

export default function DirectoryPage() {
  return <ChainOfCommandMasterApp initialTab="directory" />;
}
