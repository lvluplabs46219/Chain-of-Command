import { useSearchParams } from "react-router-dom";
import { STITCH_CATEGORIES } from "./stitchConfig";
import { StitchPageViewer } from "./StitchPageViewer";

interface StitchCategoryPageProps {
  categoryId: string;
}

export function StitchCategoryPage({ categoryId }: StitchCategoryPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = STITCH_CATEGORIES.find((c) => c.id === categoryId);

  if (!category) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#141313] text-[#e5e2e1]">
        <p>Category not found: {categoryId}</p>
      </div>
    );
  }

  // Get current sub-screen from query param ?sub= or fallback to primary
  const subParam = searchParams.get("sub");
  const isValidSub = category.screens.some((s) => s.id === subParam);
  const currentMockup = isValidSub && subParam ? subParam : category.primaryMockup;

  const handleSelectMockup = (mockupId: string) => {
    setSearchParams({ sub: mockupId });
  };

  return (
    <StitchPageViewer
      mockupName={currentMockup}
      category={category}
      onSelectMockup={handleSelectMockup}
    />
  );
}
