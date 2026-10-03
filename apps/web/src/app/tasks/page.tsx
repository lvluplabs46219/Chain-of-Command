import { ChainOfCommandMasterApp } from "@/components/ChainOfCommandMasterApp";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tasks & Deadlines | Chain of Command",
  description: "Motion board and deadline notices",
};

export default function TasksPage() {
  return <ChainOfCommandMasterApp initialTab="tasks" />;
}
