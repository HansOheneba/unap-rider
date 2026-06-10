import { Skeleton } from "@/components/ui/skeleton";

export function ShipmentCardSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white px-3 py-2.5 ring-1 ring-zinc-100">
      <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-[85%]" />
        <Skeleton className="h-3 w-[60%]" />
        <Skeleton className="h-3 w-[45%]" />
      </div>
      <Skeleton className="h-4 w-4 shrink-0" />
    </div>
  );
}

type ShipmentListSkeletonProps = {
  rows?: number;
  showFilter?: boolean;
};

export function ShipmentListSkeleton({
  rows = 4,
  showFilter = false,
}: ShipmentListSkeletonProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <Skeleton className="h-5 w-36" />
        {showFilter ? (
          <Skeleton className="ml-auto h-8 w-14 shrink-0 rounded-md" />
        ) : null}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <ShipmentCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TabsSkeleton() {
  return (
    <div className="flex gap-2">
      <Skeleton className="h-9 w-28 rounded-full" />
      <Skeleton className="h-9 w-24 rounded-full" />
      <Skeleton className="h-9 w-24 rounded-full" />
    </div>
  );
}

export function AssignmentDetailSkeleton() {
  return (
    <div className="space-y-3 bg-zinc-100">
      <div className="space-y-3 bg-zinc-900 px-3 pb-3 pt-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9 rounded-md bg-zinc-700" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-24 bg-zinc-700" />
            <Skeleton className="h-5 w-full bg-zinc-700" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full bg-zinc-700" />
        </div>
        <Skeleton className="h-1.5 w-full rounded-full bg-zinc-700" />
      </div>
      <div className="space-y-3 px-3 pb-28">
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-4 px-4 py-6">
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-7 w-32" />
      </div>
      <Skeleton className="h-44 w-full rounded-xl" />
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-12 w-full rounded-md" />
    </div>
  );
}
