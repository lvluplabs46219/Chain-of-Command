import { ChambersPlayground } from "@/components/playground/ChambersPlayground";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "AI Lawyer — Empyrean Chambers | Chain of Command",
  description: "Empyrean multi-agent legal team playground — AI lawyer workspace",
};

export default function Page() {
  return <ChambersPlayground />;
}
