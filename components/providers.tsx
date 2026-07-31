"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { ApiError } from "@/lib/api/client";

function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  // Retries on 429 make rate limiting worse; auth errors need a fresh login.
  if (error instanceof ApiError) {
    if (
      error.status === 429 ||
      error.status === 401 ||
      error.status === 403
    ) {
      return false;
    }
  }
  return failureCount < 1;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: true,
            retry: shouldRetryQuery,
            retryDelay: (attempt) => Math.min(1_000 * 2 ** attempt, 30_000),
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-center" richColors closeButton />
    </QueryClientProvider>
  );
}
