import { ChainOfCommandWorkspace } from "@/components/ChainOfCommandWorkspace";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return <ChainOfCommandWorkspace initialTab="dashboard" />;
}
