import Header from "@/components/common/Header";
import SideNav from "@/components/common/SideNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      {/* Side Navigation */}
      <SideNav />
      <div className="flex flex-col size-full">
        {/* Header */}
        <Header />

        {/* Body */}
        <div className="w-full flex flex-col grow">{children}</div>
      </div>
    </div>
  );
}
