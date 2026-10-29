import { ChambersPlayground } from "@/components/playground/ChambersPlayground";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Chambers Playground — Legal AI Team | Chain of Command",
  description: "Empyrean-style multi-agent legal team playground with chain-of-command directive routing",
};

export default function PlaygroundPage() {
  return <ChambersPlayground />;
}
