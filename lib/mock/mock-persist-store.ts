"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  buildFreshMockStore,
  type MockStoreData,
} from "./create-initial-store";

type MockPersistState = {
  store: MockStoreData | null;
  hydrated: boolean;
  getOrInitStore: () => MockStoreData;
  setStore: (store: MockStoreData) => void;
  resetToFreshRun: () => MockStoreData;
  setHydrated: (v: boolean) => void;
};

const STORAGE_KEY = "unap-rider-mock-store";

function cloneStore(data: MockStoreData): MockStoreData {
  return {
    riders: data.riders.map((r) => ({ ...r })),
    orders: data.orders.map((o) => ({
      ...o,
      items: o.items.map((i) => ({ ...i })),
    })),
    deliveryEvents: data.deliveryEvents.map((e) => ({ ...e })),
  };
}

function readStoreFromStorage(): MockStoreData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { store?: MockStoreData | null } };
    const store = parsed.state?.store;
    return store?.orders?.length ? cloneStore(store) : null;
  } catch {
    return null;
  }
}

export const useMockPersistStore = create<MockPersistState>()(
  persist(
    (set, get) => ({
      store: null,
      hydrated: false,

      getOrInitStore: () => {
        const existing = get().store;
        if (existing) return existing;

        const fromDisk = readStoreFromStorage();
        if (fromDisk) {
          set({ store: fromDisk });
          return fromDisk;
        }

        const fresh = buildFreshMockStore();
        set({ store: fresh });
        return fresh;
      },

      setStore: (store) => set({ store: cloneStore(store) }),

      resetToFreshRun: () => {
        const fresh = buildFreshMockStore();
        set({ store: fresh });
        return fresh;
      },

      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: "unap-rider-mock-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ store: state.store }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
        if (!state?.store) {
          state?.setStore(buildFreshMockStore());
        }
      },
    },
  ),
);

/** Safe read for mock API (client-only). */
export function getPersistedMockStore(): MockStoreData {
  if (typeof window === "undefined") {
    return buildFreshMockStore();
  }
  const state = useMockPersistStore.getState();
  if (state.store) return state.store;
  return state.getOrInitStore();
}

export function savePersistedMockStore(store: MockStoreData): void {
  if (typeof window === "undefined") return;
  useMockPersistStore.getState().setStore(store);
}
