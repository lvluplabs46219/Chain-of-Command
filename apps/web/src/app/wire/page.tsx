import type { Metadata } from "next";
import { WirePlaygroundHost } from "@/components/wire/WirePlaygroundHost";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Wire — Agent Playground | Chain of Command",
  description:
    "Full multi-agent playground UI (Candy GenTeam shell). Same surface that shipped as the Empyrean-style dashboard — channels, swarm, light/dark.",
};

/** Product place: The Wire. Visual shell = native daemon UI on :3100 (Empyrean-style GenTeam). */
export default function WirePage() {
  return <WirePlaygroundHost />;
}
