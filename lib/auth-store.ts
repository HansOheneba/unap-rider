"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { RiderSession } from "@/types";
import { clearToken, setToken } from "@/lib/api/token";
import { clearMockPersistStorage } from "@/lib/mock/mock-persist-store";

function setAuthCookie(token: string) {
  document.cookie = `unap-rider-token=${encodeURIComponent(token)}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

function clearAuthCookie() {
  document.cookie = "unap-rider-token=; path=/; max-age=0; SameSite=Lax";
}

type AuthState = {
  rider: RiderSession | null;
  token: string | null;
  hydrated: boolean;
  setSession: (token: string, rider: RiderSession) => void;
  setRider: (rider: RiderSession) => void;
  setHydrated: (v: boolean) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      rider: null,
      token: null,
      hydrated: false,

      setSession: (token, rider) => {
        setToken(token);
        setAuthCookie(token);
        set({ token, rider });
      },

      setRider: (rider) => set({ rider }),

      setHydrated: (v) => set({ hydrated: v }),

      logout: () => {
        clearToken();
        clearAuthCookie();
        clearMockPersistStorage();
        set({ rider: null, token: null });
        useAuthStore.persist.clearStorage();
      },
    }),
    {
      name: "unap-rider-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        rider: s.rider,
        token: s.token,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          setToken(state.token);
          setAuthCookie(state.token);
        }
        state?.setHydrated(true);
      },
    },
  ),
);
