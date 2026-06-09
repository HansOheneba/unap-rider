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

type Step = "phone" | "otp";

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

  const [step, setStep] = React.useState<Step>("phone");
  const [phone, setPhone] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      toast.error("Enter your phone number.");
      return;
    }
    setLoading(true);
    try {
      await sendOtp(phone.trim());
      toast.success("Code sent. Use any 6 digits in dev mode.");
      setStep("otp");
    } catch {
      toast.error("Enter a phone number and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpComplete = async (value: string) => {
    if (value.length < 6) return;
    setLoading(true);
    try {
      const { token: t, rider: r } = await verifyOtp(phone.trim(), value);
      setSession(t, r);
      toast.success(`Welcome, ${r.firstName}.`);
      router.push("/");
    } catch {
      toast.error("Invalid code. Try again.");
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <p className="text-sm text-zinc-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <div className="border-b border-zinc-200 bg-black px-4 py-3 text-center">
        <p className="eyebrow text-zinc-400">Est. 2024 | Rider Access</p>
      </div>

      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center">
            <Image
              src="/icons/master-icon.png"
              alt="Unapologetic"
              width={72}
              height={72}
              className="mb-6 object-contain"
              priority
            />
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              {step === "phone" ? "Rider sign in" : "Enter your code"}
            </h1>
            <p className="mt-1 text-center text-sm text-zinc-500">
              {step === "phone"
                ? "Phone OTP for assigned riders only."
                : `Code sent to ${phone}`}
            </p>
          </div>

          <div className="space-y-5 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            {step === "phone" ? (
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone number</Label>
                  <Input
                    id="phone"
                    type="text"
                    placeholder="Any number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="off"
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
                    setStep("phone");
                    setOtp("");
                  }}
                  disabled={loading}
                >
                  Use a different number
                </Button>
              </div>
            )}
          </div>

          {step === "phone" ? (
            <p className="mt-6 text-center text-xs text-zinc-400">
              Dev: any phone number, any 6-digit code
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
