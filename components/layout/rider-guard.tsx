"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useRiderAuth } from "@/lib/hooks/useRiderAuth";
import { useAuthStore } from "@/lib/auth-store";
import { getMe } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

function isUnauthorized(err: unknown): boolean {
  return (
    err instanceof ApiError && (err.status === 401 || err.status === 403)
  );
}

export function RiderGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { hydrated, isAuthenticated } = useRiderAuth();
  const setRider = useAuthStore((s) => s.setRider);
  const logout = useAuthStore((s) => s.logout);
  const [sessionValid, setSessionValid] = React.useState(false);

  React.useEffect(() => {
    if (!hydrated) return;

    if (!isAuthenticated) {
      setSessionValid(false);
      router.replace("/login");
      return;
    }

    let cancelled = false;

    async function validateSession() {
      try {
        const me = await getMe();
        if (cancelled) return;
        setRider(me);
        setSessionValid(true);
      } catch (err) {
        if (cancelled) return;

        if (isUnauthorized(err)) {
          logout();
          setSessionValid(false);
          router.replace("/login");
          return;
        }

        // Network / server blips: keep the cached session so the rider can retry.
        setSessionValid(true);
      }
    }

    setSessionValid(false);
    void validateSession();

    return () => {
      cancelled = true;
    };
  }, [hydrated, isAuthenticated, logout, router, setRider]);

  if (!hydrated || (isAuthenticated && !sessionValid)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
