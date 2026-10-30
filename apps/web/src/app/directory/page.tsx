import { ChainOfCommandMasterApp } from "@/components/ChainOfCommandMasterApp";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Agent Directory | Chain of Command",
  description: "AI Legal Workers, specialized AI skills, and attorney directory for your case team",
};

export default function DirectoryPage() {
  return <ChainOfCommandMasterApp initialTab="directory" />;
}
