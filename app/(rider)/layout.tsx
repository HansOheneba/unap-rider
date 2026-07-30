import { RiderGuard } from "@/components/layout/rider-guard";
import { RiderShell } from "@/components/layout/rider-shell";

export default function RiderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RiderGuard>
      <RiderShell>{children}</RiderShell>
    </RiderGuard>
  );
}
