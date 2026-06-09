export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-100 px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
        You are offline
      </p>
      <h1 className="mt-2 text-2xl font-bold text-zinc-900">
        No connection right now
      </h1>
      <p className="mt-3 max-w-sm text-sm text-zinc-600">
        Check your mobile data or Wi-Fi, then reopen Unapologetic Rider. Your
        signed-in session is still saved.
      </p>
    </div>
  );
}
