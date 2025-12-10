import Header from "@/components/common/Header";
import Messenger from "@/components/common/Messenger";
import SideNav from "@/components/common/SideNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen relative">
      {/* Side Navigation */}
      <SideNav />
      <div className="flex flex-col size-full">
        {/* Header */}
        <Header />

        {/* Body */}
        <div className="w-full flex flex-col grow">{children}</div>
      </div>
      {/* Messenger */}
      <Messenger />
    </div>
  );
}
