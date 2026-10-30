import { AgentRolodex3D } from "@/components/directory/AgentRolodex3D";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "AI Lawyer Rolodex — Agent Directory | Chain of Command",
  description: "3D carousel of legal AI agents, skills, and specialized workers",
};

export default function AgentRolodexPage() {
  return <AgentRolodex3D />;
}
