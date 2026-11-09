import ComingSoon from "@/components/common/ComingSoon";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <ComingSoon
        title="Project not found"
        description="It may have been deleted, or you don't have access to it."
        icon="material-symbols:folder-off-outline-rounded"
      />
      <Link href="/dashboard" className="text-sm underline -mt-4">
        Back to dashboard
      </Link>
    </div>
  );
}
