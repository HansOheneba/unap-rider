import type { RiderSession } from "@/types";
import { normalizePhone } from "@/lib/format";
import { apiFetchOrMock } from "./client";
import { mockStore } from "@/lib/mock/data-store";

type AuthResponse = { token: string; rider: RiderSession };

function mockRiderForPhone(phone: string) {
  const normalized = normalizePhone(phone);
  const rider =
    mockStore.findRiderByPhone(normalized) ?? mockStore.getRider("rdr_001");
  if (!rider) throw new Error("Rider not found");
  return { ...rider, phone: normalized || rider.phone };
}

export async function sendOtp(phone: string): Promise<void> {
  const normalized = normalizePhone(phone);
  return apiFetchOrMock(
    "/rider/auth/send-otp",
    () => {
      if (!phone.trim()) throw new Error("Phone required");
      mockRiderForPhone(phone);
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
      if (!otp.trim()) throw new Error("Invalid OTP");
      const rider = mockRiderForPhone(phone);
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
