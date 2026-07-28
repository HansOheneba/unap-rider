import type { RiderSession } from "@/types";
import { ApiError, apiFetchOrMock } from "./client";
import { getToken } from "./token";
import { mockStore } from "@/lib/mock/data-store";

type AuthResponse = { token: string; rider: RiderSession };

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function mockRiderForEmail(email: string): RiderSession {
  const normalized = normalizeEmail(email);
  const rider =
    mockStore.findRiderByEmail(normalized) ?? mockStore.getRider("rdr_001");
  if (!rider) throw new Error("Rider not found");
  return { ...rider, email: normalized || rider.email };
}

export async function sendOtp(email: string): Promise<void> {
  const normalized = normalizeEmail(email);
  return apiFetchOrMock(
    "/rider/auth/send-otp",
    () => {
      if (!normalized) throw new Error("Email required");
      mockRiderForEmail(normalized);
      return undefined;
    },
    { method: "POST", body: JSON.stringify({ email: normalized }) },
  );
}

export async function verifyOtp(
  email: string,
  otp: string,
): Promise<AuthResponse> {
  const normalized = normalizeEmail(email);
  const res = await apiFetchOrMock(
    "/rider/auth/verify-otp",
    () => {
      if (!otp.trim()) throw new Error("Invalid OTP");
      const rider = mockRiderForEmail(normalized);
      return {
        token: `mock_rider_${rider.id}`,
        rider,
      };
    },
    {
      method: "POST",
      body: JSON.stringify({ email: normalized, otp }),
    },
  );
  // Backend does not echo email back on RiderSession; carry it from the login step.
  return {
    ...res,
    rider: { ...res.rider, email: res.rider.email || normalized },
  };
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
    const riderId = riderIdFromToken(getToken());
    if (!riderId) throw new ApiError("Not authenticated", 401);
    const rider = mockStore.getRider(riderId);
    if (!rider) throw new ApiError("Not authenticated", 401);
    return rider;
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
      const riderId = riderIdFromToken(getToken());
      if (!riderId) throw new Error("Not authenticated");
      return mockStore.updateRiderStatus(riderId, status);
    },
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  );
}
