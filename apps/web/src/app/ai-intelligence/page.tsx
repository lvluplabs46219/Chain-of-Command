import { ChambersPlayground } from "@/components/playground/ChambersPlayground";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "AI Lawyer — The Wire | Chain of Command",
  description: "The Wire multi-agent legal team playground — AI lawyer workspace",
};

export default function Page() {
  return <ChambersPlayground />;
}
