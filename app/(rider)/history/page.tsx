"use client";

import * as React from "react";
import { useHistory } from "@/lib/hooks/useAssignments";
import { AssignmentCard } from "@/components/assignments/assignment-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function HistoryPage() {
  const [page, setPage] = React.useState(1);
  const { data, isLoading } = useHistory(page);

  return (
    <div className="px-4 py-6">
      <header className="mb-6">
        <p className="eyebrow mb-1">Completed runs</p>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          History
        </h1>
      </header>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : !data?.data.length ? (
        <div className="rounded-xl border border-dashed border-zinc-200 bg-white px-4 py-10 text-center">
          <p className="text-sm text-zinc-500">No completed deliveries yet.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {data.data.map((a) => (
              <AssignmentCard key={a.id} assignment={a} />
            ))}
          </div>

          {data.totalPages > 1 ? (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  />
                </PaginationItem>
                {Array.from({ length: data.totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <PaginationItem key={p}>
                      <PaginationLink
                        isActive={p === page}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}
                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setPage((p) => Math.min(data.totalPages, p + 1))
                    }
                    disabled={page >= data.totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          ) : null}
        </>
      )}
    </div>
  );
}
