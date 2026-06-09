"use client";

import { useAuthStore } from "@/lib/auth-store";

export function useRiderAuth() {
  const rider = useAuthStore((s) => s.rider);
  const token = useAuthStore((s) => s.token);
  const hydrated = useAuthStore((s) => s.hydrated);
  const logout = useAuthStore((s) => s.logout);

  return {
    rider,
    token,
    hydrated,
    isAuthenticated: Boolean(token && rider),
    logout,
  };
}
