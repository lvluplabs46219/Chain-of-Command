import { ChainOfCommandMasterApp } from "@/components/ChainOfCommandMasterApp";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Timeline | Chain of Command",
  description: "Case chronology, events, and filing deadlines",
};

export default function TimelinePage() {
  return <ChainOfCommandMasterApp initialTab="timeline" />;
}
