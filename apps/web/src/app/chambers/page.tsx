import { ChambersPlayground } from "@/components/playground/ChambersPlayground";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Chambers — The Wire | Chain of Command",
  description: "The Wire agent playground and AI lawyer chambers",
};

export default function Page() {
  return <ChambersPlayground />;
}
