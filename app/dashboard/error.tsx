"use client";

import ComingSoon from "@/components/common/ComingSoon";
import { Button } from "@/components/ui/button";

/** Shown when a dashboard page fails to load (e.g. the API is down). */
export default function DashboardError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <ComingSoon
        title="Something went wrong"
        description="We couldn't load this page. Check your connection and try again."
        icon="material-symbols:cloud-off-outline-rounded"
      />
      <Button variant="outline" onClick={reset} className="-mt-2">
        Try again
      </Button>
    </div>
  );
}
