"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/auth-store";
import { sendOtp, verifyOtp } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

type Step = "email" | "otp";

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function LoginPage() {
  const router = useRouter();
  const hydrated = useAuthStore((s) => s.hydrated);
  const token = useAuthStore((s) => s.token);
  const rider = useAuthStore((s) => s.rider);
  const setSession = useAuthStore((s) => s.setSession);

  React.useEffect(() => {
    if (hydrated && token && rider) {
      router.replace("/");
    }
  }, [hydrated, token, rider, router]);

  const [step, setStep] = React.useState<Step>("email");
  const [email, setEmail] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!isValidEmail(trimmed)) {
      toast.error("Enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      await sendOtp(trimmed);
      toast.success("Code sent.");
      setStep("otp");
    } catch (err) {
      console.error("[login] sendOtp failed", err);
      toast.error(
        err instanceof Error ? err.message : "Could not send code. Try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOtpComplete = async (value: string) => {
    if (value.length < 6) return;
    setLoading(true);
    try {
      const { token: t, rider: r } = await verifyOtp(email.trim(), value);
      setSession(t, r);
      toast.success(`Welcome, ${r.firstName}.`);
      router.push("/");
    } catch (err) {
      console.error("[login] verifyOtp failed", err);
      toast.error(
        err instanceof Error ? err.message : "Invalid code. Try again.",
      );
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <div className="border-b border-zinc-200 bg-black px-4 py-3 text-center">
        <p className="eyebrow">U Rider</p>
      </div>

      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center">
            <Image
              src="/icons/master-icon.png"
              alt="U Rider"
              width={72}
              height={72}
              className="mb-6 object-contain"
              priority
            />
            <h1>{step === "email" ? "Rider sign in" : "Enter your code"}</h1>
            <small className="mt-1 block text-center">
              {step === "email"
                ? "Enter the email on your rider account."
                : `Enter the code we sent to ${email}`}
            </small>
          </div>

          <div className="space-y-5 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            {step === "email" ? (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    inputMode="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    autoFocus
                    disabled={loading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending..." : "Send code"}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={setOtp}
                    onComplete={handleOtpComplete}
                    disabled={loading}
                  >
                    <InputOTPGroup>
                      {Array.from({ length: 6 }).map((_, i) => (
                        <InputOTPSlot key={i} index={i} />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setStep("email");
                    setOtp("");
                  }}
                  disabled={loading}
                >
                  Use a different email
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
