"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";

export default function TeamError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Team management error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-red-200/90 bg-white p-8 text-center shadow-xl shadow-neutral-900/5">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-600">
          <AlertCircle className="h-7 w-7" />
        </div>

        <h2 className="text-xl font-bold tracking-tight text-neutral-950">
          Team Management Error
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-neutral-500 leading-relaxed">
          {error.message || "An unexpected error occurred while managing the team roster."}
        </p>

        <div className="mt-8 pt-6 border-t border-neutral-100 flex items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Dashboard</span>
          </Link>

          <button
            type="button"
            onClick={reset}
            className="flex items-center gap-1.5 rounded-xl bg-neutral-950 px-4 py-2.5 text-xs font-semibold text-white hover:bg-neutral-800 transition active:scale-95 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    </div>
  );
}

