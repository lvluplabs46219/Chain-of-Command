import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/** AI Lawyer tab → The Wire (Empyrean-style GenTeam playground). */
export default function ChambersPage() {
  redirect("/wire");
}
