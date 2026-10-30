import { ChambersPlayground } from "@/components/playground/ChambersPlayground";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Empyrean Agent Playground — AI Lawyer | Chain of Command",
  description: "Live Empyrean multi-agent swarm as your legal AI team playground",
};

export default function PlaygroundPage() {
  return <ChambersPlayground />;
}
