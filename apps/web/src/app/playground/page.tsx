import { ChambersPlayground } from "@/components/playground/ChambersPlayground";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "The Wire — AI Lawyer & Swarm Playground | Chain of Command",
  description: "The Wire: Multi-agent AI legal swarm, hireable AI legal workers, and live conference room",
};

export default function PlaygroundPage() {
  return <ChambersPlayground />;
}
