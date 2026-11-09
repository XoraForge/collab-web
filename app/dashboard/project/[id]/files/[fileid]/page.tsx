import DocumentLayout from "@/components/project/document/DocumentLayout";
import { Suspense } from "react";

export default function page() {
  return (
    <Suspense>
      <DocumentLayout />
    </Suspense>
  );
}
