"use client";

import * as React from "react";
import { Download, Share, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "unap-rider-install-dismissed";

const dismissListeners = new Set<() => void>();

function subscribeDismiss(listener: () => void) {
  dismissListeners.add(listener);
  return () => dismissListeners.delete(listener);
}

function notifyDismissListeners() {
  dismissListeners.forEach((listener) => listener());
}

function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      (navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

function getDismissedSnapshot(): boolean {
  if (isStandalone()) return true;
  return localStorage.getItem(DISMISS_KEY) !== null;
}

function getDismissedServerSnapshot(): boolean {
  return true;
}

export function InstallPrompt() {
  const [deferred, setDeferred] =
    React.useState<BeforeInstallPromptEvent | null>(null);
  const dismissed = React.useSyncExternalStore(
    subscribeDismiss,
    getDismissedSnapshot,
    getDismissedServerSnapshot,
  );

  React.useEffect(() => {
    if (isStandalone()) return;

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      localStorage.removeItem(DISMISS_KEY);
      notifyDismissListeners();
      setDeferred(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
    };
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    notifyDismissListeners();
    setDeferred(null);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    dismiss();
  };

  const showIosHint = isIOS() && !dismissed;

  if (dismissed || isStandalone()) return null;

  if (showIosHint) {
    return (
      <div className="mx-4 mb-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-bold text-zinc-900">Add to Home Screen</p>
            <p className="mt-1 text-sm text-zinc-600">
              Tap <Share className="inline h-4 w-4" /> Share, then{" "}
              <strong>Add to Home Screen</strong> for quick access on your
              runs.
            </p>
          </div>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={dismiss}
            className="text-zinc-400"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  if (!deferred) return null;

  return (
    <div className="mx-4 mb-3 rounded-2xl border border-zinc-900 bg-zinc-900 p-4 text-white shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bold">Install U Rider</p>
          <p className="mt-1 text-sm text-zinc-300">
            Put the app on your home screen for one-tap access while you are on
            the road.
          </p>
        </div>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={dismiss}
          className="text-zinc-400"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <Button
        className="mt-3 w-full bg-[#E8192C] hover:bg-[#c91526]"
        onClick={install}
      >
        <Download className="h-4 w-4" />
        Install app
      </Button>
    </div>
  );
}
