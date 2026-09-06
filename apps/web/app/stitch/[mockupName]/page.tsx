import StitchMockup from "../../../components/mockups/acquit-case-workspace/StitchMockup";

export default function StitchMockupPage({
  params,
}: {
  params: { mockupName: string };
}) {
  return <StitchMockup mockupName={params.mockupName} />;
}
