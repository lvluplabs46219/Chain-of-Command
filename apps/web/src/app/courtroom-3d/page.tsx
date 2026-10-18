import { ChainOfCommandMasterApp } from "@/components/ChainOfCommandMasterApp";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "3D Courtroom War Room & Spatial Evidence Simulator | Chain of Command",
  description:
    "Interactive 3D courtroom simulator for pro se litigants: practice hearing preparation, oral arguments, witness cross-examination, and spatial evidence sightline reconstruction.",
};

export default function Courtroom3DPage() {
  return <ChainOfCommandMasterApp initialTab="courtroom_3d" />;
}
