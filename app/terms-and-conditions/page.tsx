import ComingSoon from "@/components/common/ComingSoon";
import Link from "next/link";

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <ComingSoon title="Terms & Conditions" icon="material-symbols:gavel-rounded" />
      <Link href="/login" className="text-sm underline -mt-4">
        Back to login
      </Link>
    </div>
  );
}
