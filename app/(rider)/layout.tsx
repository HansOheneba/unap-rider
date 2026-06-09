import { BottomNav } from "@/components/layout/bottom-nav";
import { RiderGuard } from "@/components/layout/rider-guard";

export default function RiderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RiderGuard>
      <div className="mx-auto min-h-screen w-full max-w-lg pb-20">
        {children}
      </div>
      <BottomNav />
    </RiderGuard>
  );
}
