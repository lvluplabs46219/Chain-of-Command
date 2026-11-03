import { redirect } from "next/navigation";

/** Legacy path — Empyrean was renamed to The Wire. */
export default function EmpyreanLegacyRedirect() {
  redirect("/wire");
}
