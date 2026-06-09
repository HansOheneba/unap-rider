import type { RiderSession } from "@/types";
import { normalizePhone } from "@/lib/format";
import { apiFetchOrMock } from "./client";
import { mockStore } from "@/lib/mock/data-store";

type AuthResponse = { token: string; rider: RiderSession };

export async function sendOtp(phone: string): Promise<void> {
  const normalized = normalizePhone(phone);
  return apiFetchOrMock(
    "/rider/auth/send-otp",
    () => {
      const rider = mockStore.findRiderByPhone(normalized);
      if (!rider) throw new Error("Phone not registered");
      return undefined;
    },
    { method: "POST", body: JSON.stringify({ phone: normalized }) },
  );
}

export async function verifyOtp(
  phone: string,
  otp: string,
): Promise<AuthResponse> {
  const normalized = normalizePhone(phone);
  return apiFetchOrMock(
    "/rider/auth/verify-otp",
    () => {
      const rider = mockStore.findRiderByPhone(normalized);
      if (!rider || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
        throw new Error("Invalid OTP");
      }
      return {
        token: `mock_rider_${rider.id}`,
        rider,
      };
    },
    {
      method: "POST",
      body: JSON.stringify({ phone: normalized, otp }),
    },
  );
}

export async function logout(): Promise<void> {
  return apiFetchOrMock(
    "/rider/auth/logout",
    () => undefined,
    { method: "POST" },
  );
}

export async function getMe(): Promise<RiderSession> {
  return apiFetchOrMock("/rider/auth/me", () => {
    throw new Error("Not authenticated");
  });
}

export function riderIdFromToken(token: string | null): string | null {
  if (!token?.startsWith("mock_rider_")) return null;
  return token.replace("mock_rider_", "");
}

export async function updateRiderStatus(
  status: "active" | "off_duty",
): Promise<RiderSession> {
  return apiFetchOrMock(
    "/rider/me/status",
    () => {
      throw new Error("Not authenticated");
    },
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  );
}

export function updateRiderStatusMock(
  riderId: string,
  status: "active" | "off_duty",
): RiderSession {
  return mockStore.updateRiderStatus(riderId, status);
}
