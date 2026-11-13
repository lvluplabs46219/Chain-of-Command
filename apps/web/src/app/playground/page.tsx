import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/** Legacy AI Lawyer alias → The Wire (single playground surface). */
export default function PlaygroundPage() {
  redirect("/wire");
}
