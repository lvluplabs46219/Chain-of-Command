import { ChainOfCommandMasterApp } from "@/components/ChainOfCommandMasterApp";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Draft Desk | Chain of Command",
  description: "Motion drafting and filing preparation",
};

export default function DraftDeskPage() {
  return <ChainOfCommandMasterApp initialTab="draft_desk" />;
}
