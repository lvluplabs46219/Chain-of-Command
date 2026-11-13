import type { Metadata } from "next";
import { WirePlaygroundHost } from "@/components/wire/WirePlaygroundHost";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Wire — Counsel Lab | Chain of Command",
  description:
    "Native multi-agent playground on the same origin as Chain of Command: directory, retain counsel, channels, loadouts, and chat. No iframe to :3100.",
};

/** The Wire lives on :3000 inside the main app — not a separate daemon UI. */
export default function WirePage() {
  return <WirePlaygroundHost />;
}
