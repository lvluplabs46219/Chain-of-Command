import { LibraryClient } from "./LibraryClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Law Library | Chain of Command",
  description:
    "Search the stacks — hybrid statute and case retrieval with volume reader and citation chips",
};

export default function LibraryPage() {
  return <LibraryClient />;
}
