import { BottomNav } from "@/components/layout/bottom-nav";
import { RiderGuard } from "@/components/layout/rider-guard";
import { InstallPrompt } from "@/components/pwa/install-prompt";

export default function RiderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RiderGuard>
      <div className="mx-auto min-h-screen w-full max-w-lg bg-zinc-100 pb-20">
        <div className="pt-3">
          <InstallPrompt />
        </div>
        {children}
      </div>
      <BottomNav />
    </RiderGuard>
  );
}
