import StitchPage from "@/lib/stitch/StitchPage";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "The Docket | Acquit.ai",
  description: "Manage active legal matters and court submissions",
};

export default function DocketPage() {
  return <StitchPage folder="the_docket_cases_1" />;
}
