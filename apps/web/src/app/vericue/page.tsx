import { VeriCueMasterApp } from "@/components/vericue/VeriCueMasterApp";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VeriCue AI — Forensic Telemetry Console",
  description:
    "Multi-modal behavioral assessment, local LLM inference, cryptographic audit trails, and regulatory compliance workstation.",
};

export const dynamic = "force-dynamic";

export default function VeriCuePage() {
  return <VeriCueMasterApp initialTab="home" />;
}
