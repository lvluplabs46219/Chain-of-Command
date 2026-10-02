import { ChainOfCommandMasterApp } from "@/components/ChainOfCommandMasterApp";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "The Docket | Chain of Command",
  description: "Manage active legal matters and court submissions",
};

export default function DocketPage() {
  return <ChainOfCommandMasterApp initialTab="docket" />;
}
