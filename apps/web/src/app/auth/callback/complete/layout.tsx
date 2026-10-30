import type { ReactNode } from "react";

/** Auth completion is always request-time (tokens in query/hash). */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function AuthCallbackCompleteLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
