import { useParams } from "react-router-dom";
import { ALL_STITCH_MOCKUPS } from "./stitchConfig";
import { StitchPageViewer } from "./StitchPageViewer";

export function StitchMockupDirectPage() {
  const { mockupName } = useParams<{ mockupName: string }>();

  if (!mockupName || !ALL_STITCH_MOCKUPS.includes(mockupName)) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#141313] text-[#e5e2e1]">
        <div className="text-center">
          <h2 className="text-xl font-bold text-[#ffb4ab] mb-2">Mockup Not Found</h2>
          <p className="text-sm text-[#8f9194]">
            '{mockupName}' is not a registered Stitch screen.
          </p>
        </div>
      </div>
    );
  }

  return <StitchPageViewer mockupName={mockupName} />;
}
