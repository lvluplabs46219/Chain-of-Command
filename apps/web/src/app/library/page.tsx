import { ChainOfCommandMasterApp } from "@/components/ChainOfCommandMasterApp";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Law Library | Chain of Command",
  description: "Search the stacks — statutes, cases, rules, and research briefs",
};

export default function LibraryPage() {
  return <ChainOfCommandMasterApp initialTab="library" />;
}
