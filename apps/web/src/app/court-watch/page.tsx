import { ChainOfCommandMasterApp } from "@/components/ChainOfCommandMasterApp";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Court Watch | Chain of Command",
  description: "Hearings, docket activity, and deadline engine",
};

export default function CourtWatchPage() {
  return <ChainOfCommandMasterApp initialTab="court_watch" />;
}
